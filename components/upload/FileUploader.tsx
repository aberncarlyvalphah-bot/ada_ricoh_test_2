'use client';

import { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileUpload {
  file: File;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function FileUploader({
  onFileUploaded,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileUploaded: (file: File, data: any[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndUploadFile = (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus('error');
      alert(`文件过大！最大支持 ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      setUploadStatus('error');
      alert('仅支持 CSV 和 Excel 文件！');
      return;
    }

    // Simulate upload process
    setUploadStatus('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 100));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('completed');

      // Parse and return mock data
      const mockData = [
        { 科目: '语文', 成绩: 85 },
        { 科目: '数学', 成绩: 92 },
        { 科目: '英语', 成绩: 88 },
        { 科目: '物理', 成绩: 78 },
        { 科目: '化学', 成绩: 82 },
        { 科目: '生物', 成绩: 75 },
        { 科目: '历史', 成绩: 90 },
      ];

      onFileUploaded(file, mockData);
    }, 2000);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      validateAndUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndUploadFile(file);
    }
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5 text-primary' : 'border-gray-300 hover:border-primary/50'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus === 'idle' && (
          <>
            <Upload className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-center mb-1">
              拖放文件到此处
            </p>
            <p className="text-xs text-muted-foreground text-center">
              支持 CSV 或 Excel 文件（最大 10MB）
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
            <p className="text-sm text-center font-medium text-red-600">
              上传失败
            </p>
            <Button onClick={() => setUploadStatus('idle')} className="mx-auto">
              重试
            </Button>
          </div>
        )}
      </label>
    </div>
  );
}
