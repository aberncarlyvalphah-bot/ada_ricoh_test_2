'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import QuickActions from '@/components/home/QuickActions';
import ChatInput from '@/components/home/ChatInput';
import type { TaskMode } from '@/types';

export default function Home() {
  const [activeMode, setActiveMode] = useState<TaskMode | null>(null);
  const router = useRouter();

  const handleSend = (message: string) => {
    // Will be implemented with real navigation to workbench
    console.log('Sending message:', message, 'with mode:', activeMode);
    // For now, just log - will navigate to workbench when backend is ready
    // router.push('/workbench/[id]');
  };

  return (
    <AppLayout>
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
          />
        </div>
      </div>
    </AppLayout>
  );
}
