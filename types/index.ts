// Task mode types
export type TaskMode = 'chart' | 'dashboard' | 'extract' | 'report';

// Project types
export interface Project {
  id: string;
  title: string;
  mode: TaskMode;
  createdAt: string;
  updatedAt: string;
}

// File types
export interface File {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  files?: File[];
}

// Chart types (Protocol C)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ChartDataset {
  dimensions: string[];
  source: any[];
}

export interface ChartOptions {
  [key: string]: any;
}

export interface ChartConfig {
  chart_id: string;
  recommended_type: string;
  dataset: ChartDataset;
  chart_options: ChartOptions;
  preview_data: any[];
}

// Data types for analysis
export interface DataRow {
  [key: string]: any;
}

export interface DataPreview {
  data: DataRow[];
  totalRows: number;
  totalColumns: number;
}

// Chart type options
export type ChartType = 'radar' | 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';

// Thinking step status
export type ThinkingStepStatus = 'completed' | 'loading' | 'pending';

export interface ThinkingStep {
  id: string;
  status: ThinkingStepStatus;
  text: string;
}

// Analysis result
export interface AnalysisResult {
  conclusion: string;
  insights: string[];
  recommendations: string[];
}

// File upload status
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface FileUpload {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}
