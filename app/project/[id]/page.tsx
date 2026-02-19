'use client';

import Sidebar from '@/components/layout/Sidebar';
import ChatPanel from '@/components/workbench/ChatPanel';
import CanvasPanel from '@/components/workbench/CanvasPanel';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function WorkbenchPage({ params }: { params: { id: string } }) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-y-auto bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex min-h-0">
          {/* Left Panel: Chat (30%) */}
          <div className="w-[30%] flex flex-col min-w-0 min-h-0">
            <ChatPanel />
          </div>

          {/* Right Panel: Canvas (70%) - 固定高度 + 超出滚动，与左侧消息区一致出现垂直滚动条 */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-y-auto overflow-x-hidden">
            <CanvasPanel />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
