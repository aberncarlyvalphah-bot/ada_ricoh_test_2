'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import QuickActions from '@/components/home/QuickActions';
import ChatInput from '@/components/home/ChatInput';
import type { TaskMode } from '@/types';
import { supabase } from '@/lib/supabase/client';

// Mock user ID - will be replaced with real user authentication
const MOCK_USER_ID = 'user_001';

export default function Home() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<TaskMode | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: number; rowCount?: number; columnCount?: number }[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSend = async (message: string) => {
    console.log('Sending message:', message, 'with mode:', activeMode, 'with attached files:', attachedFiles);

    if (isCreating) {
      console.log('Project creation already in progress');
      return;
    }

    if (!message.trim() && attachedFiles.length === 0) {
      console.log('Empty message and no files, skipping');
      return;
    }

    setIsCreating(true);

    try {
      // Generate project name based on first message
      const projectName = message.slice(0, 30) || 'New Project';

      // Create project in Supabase
      if (!supabase) {
        console.error('Supabase not configured, using mock navigation');
        // Navigate with mock project ID
        router.push(`/project/demo-${Date.now()}`);
        return;
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: message.slice(0, 200),
          user_id: MOCK_USER_ID,
          mode: activeMode,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create project:', error);
        alert('创建项目失败，请重试');
        setIsCreating(false);
        return;
      }

      if (!project) {
        console.error('Project creation returned no data');
        alert('创建项目失败，请重试');
        setIsCreating(false);
        return;
      }

      console.log('Project created successfully:', project);

      // Navigate to workbench with new project ID
      router.push(`/project/${project.id}`);

    } catch (error) {
      console.error('Error creating project:', error);
      alert('创建项目失败，请重试');
      setIsCreating(false);
    }
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
            disabled={isCreating}
          />

          {/* Creating indicator */}
          {isCreating && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>正在创建项目...</span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
