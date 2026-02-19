'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Globe, AtSign, CalendarDays, Sparkles, X, ArrowUp, FileText, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFiles } from '@/lib/supabase/fileService';
import type { TaskMode } from '@/types';

const modeLabels: Record<TaskMode, string> = {
  chart: 'Create Chart',
  dashboard: 'Build Dashboard',
  extract: 'Extract Data',
  report: 'Write Report',
};

const modeColors: Record<TaskMode, string> = {
  chart: 'bg-primary/10 text-primary border border-primary/20',
  dashboard: 'bg-primary/10 text-primary border border-primary/20',
  extract: 'bg-primary/10 text-primary border border-primary/20',
  report: 'bg-primary/10 text-primary border border-primary/20',
};

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  rowCount?: number;
  columnCount?: number;
}

interface ChatInputProps {
  activeMode: TaskMode | null;
  onClearMode: () => void;
  onSend: (message: string) => void;
  onUploadComplete?: (uploadedFile: { id: string; name: string; size: number; rowCount?: number; columnCount?: number }) => void;
  onRemoveFile?: (fileId: string) => void;
  attachedFiles?: AttachedFile[];
  disabled?: boolean;
}

// Mock user ID - will be replaced with real user authentication
const MOCK_USER_ID = 'user_001';

export default function ChatInput({
  activeMode,
  onClearMode,
  onSend,
  onUploadComplete,
  onRemoveFile,
  attachedFiles = [],
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddDataClick = () => {
    if (isUploading || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);

      setIsUploading(true);

      try {
        const result = await uploadFiles(fileList, MOCK_USER_ID);

        if (result.success) {
          // 上传成功后，将文件添加到附件列表
          for (const uploadedFile of fileList) {
            onUploadComplete?.({
              id: `${Date.now()}-${uploadedFile.name}`,
              name: uploadedFile.name,
              size: uploadedFile.size,
            });
          }

          // 显示上传成功消息
          if (fileList.length === 1) {
            const file = fileList[0];
            setValue(prev => prev + `[上传成功: ${file.name}]\n`);
          } else {
            setValue(prev => prev + `[上传成功: ${fileList.length} 个文件]\n`);
          }
        } else {
          // 上传失败，显示错误
          const errorMsg = result.errors?.join('\n') || '未知错误';
          console.error('Upload failed:', errorMsg);
          alert(`上传失败：\n${errorMsg}`);
        }
      } finally {
        setIsUploading(false);
      }

      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRemoveAttachment = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveFile?.(fileId);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        multiple
        style={{
          position: 'absolute',
          width: '0.1px',
          height: '0.1px',
          opacity: '0',
          overflow: 'hidden',
          zIndex: '-1',
        }}
      />
      <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
        {/* Upload loading indicator */}
        {isUploading && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-transparent"></div>
              <span>上传中...</span>
            </div>
          </div>
        )}

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="px-3 pt-2 pb-0 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs"
                  title={`分析 ${file.name}`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  {file.rowCount && file.columnCount && (
                    <span className="text-muted-foreground/70 ml-1">
                      {file.rowCount}行×{file.columnCount}列
                    </span>
                  )}
                  <button
                    onClick={(e) => handleRemoveAttachment(file.id, e)}
                    className="hover:bg-primary/10 rounded p-0.5 transition-colors"
                    title="移除附件"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode badge */}
        {activeMode && (
          <div className="px-4 pt-2 pb-0">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium", modeColors[activeMode])}>
              {modeLabels[activeMode]}
              <button onClick={onClearMode} className="ml-1 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={attachedFiles.length > 0
            ? "基于已上传的文件进行分析..."
            : "Ask questions with data from files, URLs, or @ references"
          }
          rows={4}
          disabled={disabled || isUploading}
          className="w-full px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddDataClick}
              disabled={isUploading}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Paperclip className="h-4 w-4" />
              {isUploading ? "上传中..." : "Add Data"}
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Globe className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <AtSign className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!value.trim() || disabled}
              className={cn(
                "p-2 rounded-full transition-colors",
                value.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
