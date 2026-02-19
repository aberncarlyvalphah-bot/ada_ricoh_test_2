'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileUpload {
  file: File;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
}

export default function FileUploader({
  onFilesSelected,
  disabled = false,
  multiple = true,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Pass files to parent for actual upload
    setUploadStatus('uploading');
    setUploadProgress(0);
    setError(undefined);

    try {
      await onFilesSelected(files);
      setUploadStatus('completed');
      setUploadProgress(100);
    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : '上传失败');
    }
  }, [onFilesSelected]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleUpload(droppedFiles);
  }, [disabled, handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      handleUpload(fileList);
    }

    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleUpload]);

  const triggerFileSelect = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      <input
        ref={inputRef}
        type="file"
        id="file-upload-input"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        style={{
          position: 'absolute',
          width: '0.1px',
          height: '0.1px',
          opacity: '0',
          overflow: 'hidden',
          zIndex: '-1',
        }}
        multiple={multiple}
      />
      <div
        onClick={triggerFileSelect}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5 text-primary'
            : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-center mb-1">
              点击或拖放文件到此处
            </p>
            <p className="text-xs text-muted-foreground text-center">
              支持 CSV、Excel 文件（最大 10MB，单次最多 {multiple ? '5 个' : '1 个'}）
            </p>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-primary" />
            <p className="text-sm text-center">上传中... {uploadProgress}%</p>
          </div>
        )}

        {uploadStatus === 'completed' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-center font-medium text-green-600">
              上传成功！
            </p>
            <Button onClick={() => setUploadStatus('idle')} className="mx-auto">
              上传新文件
            </Button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center text-white">
              <X className="h-6 w-6" />
            </div>
            <p className="text-sm text-center font-medium text-red-600 mb-2">
              上传失败
            </p>
            {error && (
              <p className="text-xs text-red-500 text-center max-w-sm">
                {error}
              </p>
            )}
            <Button
              onClick={() => {
                setUploadStatus('idle');
                setError(undefined);
              }}
              className="mx-auto"
            >
              重试
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
