import {
  ApiResponse,
  ChatRequest,
  ChatStreamChunk,
  API_CONFIG,
  ApiError,
  ApiErrorCode,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  UserProfile,
  MOCK_API_DELAY,
  USE_MOCK_DATA,
} from './types';
import { supabase } from '@/lib/supabase/client';
import type { ChartConfig } from '@/types';

/**
 * API Client for Data Ada Agent
 * Integrates with Supabase backend and provides retry logic, error handling
 */
class ApiClient {
  private baseUrl = API_CONFIG.BASE_URL;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
    // Add default auth interceptor
    this.addRequestInterceptor(this.authInterceptor);
    this.addResponseInterceptor(this.errorResponseInterceptor);
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Auth interceptor - adds Supabase auth token
   */
  private async authInterceptor(config: {
    url: string;
    method: string;
    headers: Headers;
    body?: string;
  }) {
    if (!supabase) {
      console.warn('[ApiClient] Supabase not configured, skipping auth interceptor');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.set('Authorization', `Bearer ${session.access_token}`);
      }
    } catch (error) {
      console.error('[ApiClient] Auth interceptor error:', error);
    }
  }

  /**
   * Error response interceptor
   */
  private async errorResponseInterceptor(response: Response) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('[ApiClient] Unauthorized, attempting token refresh');
      try {
        if (supabase) {
          await supabase.auth.refreshSession();
          // Note: The retry logic should be handled by the calling code
        }
      } catch (error) {
        console.error('[ApiClient] Token refresh failed:', error);
      }
    }
  }

  /**
   * Core HTTP request method with retry logic
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      maxRetries = API_CONFIG.MAX_RETRIES,
      retryDelay = API_CONFIG.RETRY_DELAY,
      timeout = API_CONFIG.DEFAULT_TIMEOUT,
      retryCondition = defaultRetryCondition,
      ...fetchOptions
    } = options;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        // Build request config
        const url = endpoint.startsWith('http')
          ? endpoint
          : `${this.baseUrl}${endpoint}`;

        const headers = new Headers({
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        });

        let requestConfig = {
          url,
          method: (fetchOptions.method || 'GET').toUpperCase(),
          headers,
          body: fetchOptions.body as string | undefined,
        };

        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
          const result = await interceptor(requestConfig);
          if (result) {
            requestConfig = { ...requestConfig, ...result };
          }
        }

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Make request
        const response = await fetch(requestConfig.url, {
          ...fetchOptions,
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
          const result = await interceptor(processedResponse, {
            url: requestConfig.url,
            method: requestConfig.method,
          });
          if (result) {
            processedResponse = result;
          }
        }

        // Handle response
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          const error: ApiError = {
            code: errorData.code || this.getErrorCodeFromStatus(response.status),
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            details: errorData.details,
            statusCode: response.status,
            retryable: this.isRetryable(response.status),
          };

          // Check if should retry
          if (attempt < maxRetries && retryCondition(error)) {
            attempt++;
            console.warn(`[ApiClient] Request failed (attempt ${attempt}/${maxRetries}), retrying...`, error);
            await this.delay(retryDelay * attempt); // Exponential backoff
            continue;
          }

          return {
            success: false,
            error,
          };
        }

        // Parse successful response
        const data = await response.json();
        return {
          success: true,
          data,
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if timeout
        if (lastError.name === 'AbortError') {
          const timeoutError: ApiError = {
            code: ApiErrorCode.TIMEOUT,
            message: `Request timeout after ${timeout}ms`,
            retryable: true,
          };

          if (attempt < maxRetries && retryCondition(timeoutError)) {
            attempt++;
            console.warn(`[ApiClient] Request timeout (attempt ${attempt}/${maxRetries}), retrying...`);
            await this.delay(retryDelay * attempt);
            continue;
          }

          return {
            success: false,
            error: timeoutError,
          };
        }

        // Other network errors
        const networkError: ApiError = {
          code: ApiErrorCode.NETWORK_ERROR,
          message: lastError.message || 'Network error',
          retryable: true,
        };

        if (attempt < maxRetries && retryCondition(networkError)) {
          attempt++;
          console.warn(`[ApiClient] Network error (attempt ${attempt}/${maxRetries}), retrying...`, lastError);
          await this.delay(retryDelay * attempt);
          continue;
        }

        return {
          success: false,
          error: networkError,
        };
      }
    }

    // Should not reach here, but just in case
    return {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: lastError?.message || 'Unknown error',
        retryable: false,
      },
    };
  }

  /**
   * Parse error response body
   */
  private async parseErrorResponse(response: Response): Promise<Partial<ApiError>> {
    try {
      const data = await response.json();
      return data.error || data;
    } catch {
      return {};
    }
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 400: return ApiErrorCode.VALIDATION_ERROR;
      case 401: return ApiErrorCode.UNAUTHORIZED;
      case 404: return ApiErrorCode.NOT_FOUND;
      case 409: return ApiErrorCode.ALREADY_EXISTS;
      case 500: return ApiErrorCode.INTERNAL_ERROR;
      case 503: return ApiErrorCode.SERVICE_UNAVAILABLE;
      default: return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  /**
   * Check if status code is retryable
   */
  private isRetryable(status: number): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(status);
  }

  /**
   * Default retry condition
   */
  private defaultRetryCondition(error: ApiError): boolean {
    return error.retryable === true;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Send chat message and receive streaming response
   */
  async sendChat(
    request: ChatRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await this.mockChatStream(request, onChunk, onComplete);
      } else {
        await this.realChatStream(request, onChunk, onComplete, onError);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Real chat stream implementation
   */
  private async realChatStream(
    request: ChatRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            } catch (error) {
              console.error('Failed to parse SSE data:', line, error);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Mock chat stream - simulates AI response
   */
  private async mockChatStream(
    request: ChatRequest,
    onChunk: (chunk: ChatStreamChunk) => void,
    onComplete: () => void
  ): Promise<void> {
    const steps = [
      { id: '1', status: 'completed' as const, text: '正在读取文件表头...' },
      { id: '2', status: 'loading' as const, text: '提取数据中...' },
    ];

    // Send first thinking step
    onChunk({
      type: 'thinking_step',
      data: steps[0],
    });

    await this.delay(800);

    // Send second thinking step
    onChunk({
      type: 'thinking_step',
      data: { ...steps[1], status: 'completed' as const },
    });

    onChunk({
      type: 'thinking_step',
      data: {
        id: '3',
        status: 'loading' as const,
        text: '正在生成分析结果...',
      },
    });

    await this.delay(800);

    // Update third step
    onChunk({
      type: 'thinking_step',
      data: {
        id: '3',
        status: 'completed' as const,
        text: '正在生成分析结果...',
      },
    });

    // Send conclusion
    const conclusion = this.getMockConclusion(request.message);
    onChunk({
      type: 'conclusion',
      data: {
        content: conclusion,
        isComplete: true,
      },
    });

    // Send chart (if in chart mode)
    if (request.mode === 'chart' || !request.mode) {
      await this.delay(500);
      onChunk({
        type: 'chart',
        data: this.getMockChartConfig(),
      });
    }

    onComplete();
  }

  /**
   * Get mock conclusion based on user message
   */
  private getMockConclusion(message: string): string {
    if (message.includes('成绩') || message.includes('分析')) {
      return `根据数据分析，得出以下结论：

**优势科目**：
- 美术：95分，表现最为突出
- 数学：92分，逻辑思维能力较强
- 音乐：92分，艺术素养优秀

**需要关注的科目**：
- 生物：75分，相对较弱，建议加强基础知识复习
- 物理：78分，需要多做练习题

**总体评价**：
该同学文理科发展较为均衡，艺术类科目表现优异。理科中的物理和生物需要重点关注，建议通过增加练习时间和针对性辅导来提升。整体而言，该同学具有良好的学习潜力，保持当前的学习态度和方法，成绩会有进一步提升。`;
    }

    return `已收到您的请求："${message}"。

这是一个模拟响应。当后端 API 集成后，这里将显示 AI 的真实分析结果。`;
  }

  /**
   * Get mock chart configuration
   */
  private getMockChartConfig(): ChartConfig {
    return {
      chart_id: 'chart_1',
      recommended_type: 'radar',
      dataset: {
        dimensions: ['科目', '成绩'],
        source: [
          { 科目: '语文', 成绩: 85 },
          { 科目: '数学', 成绩: 92 },
          { 科目: '英语', 成绩: 88 },
          { 科目: '物理', 成绩: 78 },
          { 科目: '化学', 成绩: 82 },
          { 科目: '生物', 成绩: 75 },
          { 科目: '历史', 成绩: 90 },
          { 科目: '地理', 成绩: 86 },
          { 科目: '政治', 成绩: 88 },
          { 科目: '音乐', 成绩: 92 },
          { 科目: '美术', 成绩: 95 },
          { 科目: '体育', 成绩: 88 },
        ],
      },
      chart_options: {},
      preview_data: [
        { 科目: '语文', 成绩: 85 },
        { 科目: '数学', 成绩: 92 },
        { 科目: '英语', 成绩: 88 },
        { 科目: '物理', 成绩: 78 },
        { 科目: '化学', 成绩: 82 },
        { 科目: '生物', 成绩: 75 },
        { 科目: '历史', 成绩: 90 },
        { 科目: '地理', 成绩: 86 },
        { 科目: '政治', 成绩: 88 },
        { 科目: '音乐', 成绩: 92 },
        { 科目: '美术', 成绩: 95 },
        { 科目: '体育', 成绩: 88 },
      ],
    };
  }

  /**
   * Upload file
   */
  async uploadFile(_file: File): Promise<ApiResponse<{ id: string }>> {
    try {
      if (USE_MOCK_DATA) {
        await this.delay(MOCK_API_DELAY);
        return {
          success: true,
          data: {
            id: `file_${Date.now()}`,
          },
        };
      }

      // Real implementation would be handled by fileService.ts
      return this.request<{ id: string }>('/files/upload', {
        method: 'POST',
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Upload failed',
        },
      };
    }
  }

  /**
   * Get project history
   */
  async getProjectHistory(): Promise<ApiResponse<Project[]>> {
    try {
      if (USE_MOCK_DATA) {
        return {
          success: true,
          data: [],
        };
      }

      return this.request<Project[]>('/projects');
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Fetch failed',
        },
      };
    }
  }

  /**
   * Create project
   */
  async createProject(request: CreateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      if (USE_MOCK_DATA) {
        await this.delay(MOCK_API_DELAY);
        return {
          success: true,
          data: {
            id: `project_${Date.now()}`,
            name: request.name,
            description: request.description,
            user_id: request.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }

      return this.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Create failed',
        },
      };
    }
  }

  /**
   * Save project
   */
  async saveProject(request: UpdateProjectRequest): Promise<ApiResponse<void>> {
    try {
      return this.request<void>(`/projects/${request.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: request.name,
          description: request.description,
        }),
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Save failed',
        },
      };
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    try {
      return this.request<void>(`/projects/${projectId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Delete failed',
        },
      };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: {
            code: ApiErrorCode.UNAUTHORIZED,
            message: 'User not authenticated',
          },
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name,
          created_at: user.created_at || new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : 'Failed to get user profile',
        },
      };
    }
  }
}

// Default retry condition function
function defaultRetryCondition(error: ApiError): boolean {
  return error.retryable === true;
}

// Singleton instance
export const apiClient = new ApiClient();
