'use client';

import { BarChart3, LayoutDashboard, Table2, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskMode } from '@/types';

interface QuickActionsProps {
  activeMode: TaskMode | null;
  onModeSelect: (mode: TaskMode) => void;
}

const actions: { mode: TaskMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'chart', label: 'Create Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { mode: 'dashboard', label: 'Build Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { mode: 'extract', label: 'Extract Data', icon: <Table2 className="h-4 w-4" /> },
  { mode: 'report', label: 'Write Report', icon: <FileText className="h-4 w-4" /> },
];

export default function QuickActions({ activeMode, onModeSelect }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {actions.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
            activeMode === mode
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          {icon}
          {label}
        </button>
      ))}
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5 text-sm font-medium transition-all">
        <MoreHorizontal className="h-4 w-4" />
        More
      </button>
    </div>
  );
}
