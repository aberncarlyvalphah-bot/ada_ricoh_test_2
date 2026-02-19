// API Request/Response types
import type { TaskMode, ChartConfig, DataPreview } from '@/types';

export interface ChatRequest {
  projectId: string;
  message: string;
  files?: FileUpload[];
  mode?: TaskMode;
  context?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
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
  };
}

export interface DoneChunk {
  type: 'done';
  data: {
    message?: string;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Mock API configuration
export const MOCK_API_DELAY = 1500; // ms
