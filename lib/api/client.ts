import {
  ApiResponse,
  ChatRequest,
  ChatStreamChunk,
  MOCK_API_DELAY,
} from './types';
import type { ChartConfig, DataPreview } from '@/types';

/**
 * API Client for Data Ada Agent
 * Currently uses mock data, ready for backend integration
 */
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

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
      // TODO: Replace with real API call
      // const response = await fetch(`${this.baseUrl}/chat`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(request),
      // });
      // Handle streaming response...

      // Mock implementation
      await this.mockChatStream(request, onChunk, onComplete);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
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
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Upload file
   */
  async uploadFile(_file: File): Promise<ApiResponse<{ id: string }>> {
    try {
      // TODO: Implement real file upload
      await this.delay(MOCK_API_DELAY);

      return {
        success: true,
        data: {
          id: `file_${Date.now()}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : 'Upload failed',
        },
      };
    }
  }

  /**
   * Get project history
   */
  async getProjectHistory(): Promise<ApiResponse<unknown[]>> {
    try {
      // TODO: Implement real API call
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Fetch failed',
        },
      };
    }
  }

  /**
   * Save project
   */
  async saveProject(_project: unknown): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement real API call
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Save failed',
        },
      };
    }
  }

  /**
   * Delete project
   */
  async deleteProject(_projectId: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Implement real API call
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : 'Delete failed',
        },
      };
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();
