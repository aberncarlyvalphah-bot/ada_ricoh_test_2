'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import QuickActions from '@/components/home/QuickActions';
import ChatInput from '@/components/home/ChatInput';
import type { TaskMode } from '@/types';

export default function Home() {
  const [activeMode, setActiveMode] = useState<TaskMode | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: number; rowCount?: number; columnCount?: number }[]>([]);

  const handleUploadComplete = (uploadedFile: { id: string; name: string; size: number; rowCount?: number; columnCount?: number }) => {
    setAttachedFiles(prev => {
      // 检查是否已存在相同的文件
      const exists = prev.some(f => f.id === uploadedFile.id);
      if (exists) {
        return prev;
      }
      return [...prev, uploadedFile];
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSend = (message: string) => {
    console.log('Sending message:', message, 'with mode:', activeMode, 'with attached files:', attachedFiles);
    // Will be implemented with real navigation to workbench
  };

  return (
    <AppLayout onUploadComplete={handleUploadComplete}>
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-0">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Hi <span className="text-primary">User</span>, ready to turn
            </h2>
            <h2 className="text-3xl font-bold text-foreground">
              data into insights in seconds?
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <QuickActions
              activeMode={activeMode}
              onModeSelect={(m) => setActiveMode(m === activeMode ? null : m)}
            />
          </div>

          {/* Input */}
          <ChatInput
            activeMode={activeMode}
            onClearMode={() => setActiveMode(null)}
            onSend={handleSend}
            onUploadComplete={handleUploadComplete}
            onRemoveFile={handleRemoveFile}
            attachedFiles={attachedFiles}
          />
        </div>
      </div>
    </AppLayout>
  );
}
