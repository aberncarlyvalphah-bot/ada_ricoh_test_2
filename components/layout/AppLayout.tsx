import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppLayoutProps {
  children: ReactNode;
  onUploadComplete?: (uploadedFile: { id: string; name: string; size: number; rowCount?: number; columnCount?: number }) => void;
}

export default function AppLayout({ children, onUploadComplete }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TooltipProvider>
        <Sidebar onUploadComplete={onUploadComplete} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
}
