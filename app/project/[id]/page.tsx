'use client';

import Sidebar from '@/components/layout/Sidebar';
import ChatPanel from '@/components/workbench/ChatPanel';
import CanvasPanel from '@/components/workbench/CanvasPanel';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function WorkbenchPage({ params }: { params: { id: string } }) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel: Chat (30%) */}
          <div className="w-[30%] flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
            <ChatPanel />
          </div>

          {/* Right Panel: Canvas (70%) */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
            <CanvasPanel />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
