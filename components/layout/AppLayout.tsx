import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TooltipProvider>
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
}
