// API Request/Response types
import type { TaskMode, ChartConfig, DataPreview } from '@/types';

// ==================== Chat API ====================

export interface ChatRequest {
  projectId: string;
  message: string;
  files?: FileUpload[];
  mode?: TaskMode;
  context?: string;
  userId?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: ArrayBuffer; // For client-side processing
}

export interface ThinkingStepUpdate {
  id: string;
  status: 'completed' | 'loading' | 'pending';
  text: string;
}

export interface ChatStreamChunk {
  type: 'thinking_step' | 'conclusion' | 'chart' | 'data' | 'done' | 'error';
  data: unknown;
}

export interface ThinkingStepChunk {
  type: 'thinking_step';
  data: ThinkingStepUpdate;
}

export interface ConclusionChunk {
  type: 'conclusion';
  data: {
    content: string;
    isComplete: boolean;
  };
}

export interface ChartChunk {
  type: 'chart';
  data: ChartConfig;
}

export interface DataChunk {
  type: 'data';
  data: DataPreview;
}

export interface ErrorChunk {
  type: 'error';
  data: {
    message: string;
    retryable: boolean;
    code?: string;
  };
}

export interface DoneChunk {
  type: 'done';
  data: {
    message?: string;
  };
}

// ==================== Project API ====================

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  files_count?: number;
  messages_count?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  userId: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: ProjectFile[];
  charts?: ChartConfig[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

// ==================== User API ====================

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

// ==================== General API Types ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    total?: number;
    page?: number;
    perPage?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
  statusCode?: number;
}

// Error codes
export enum ApiErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_FIELD = 'MISSING_FIELD',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DELETED = 'DELETED',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Request config for retry logic
export interface RequestConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
  timeout?: number;
}

// Request interceptor function type
export type RequestInterceptor = (config: {
  url: string;
  method: string;
  headers: Headers;
  body?: string;
}) => Promise<{
  url?: string;
  method?: string;
  headers?: Headers;
  body?: string;
} | void>;

// Response interceptor function type
export type ResponseInterceptor = (response: Response, config?: {
  url: string;
  method: string;
}) => Promise<Response | void>;

// ==================== Configuration ====================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Mock API configuration (for development)
export const MOCK_API_DELAY = 1500; // ms
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || false;

