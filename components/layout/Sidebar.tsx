'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquarePlus, FolderOpen, ChevronDown, FileSpreadsheet, BarChart3, LayoutDashboard, FileText, Table2, Sparkles, Trash2, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskMode } from '@/types';
import { useFileLibrary } from '@/lib/hooks/useFileLibrary';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modeIcons: Record<TaskMode, React.ReactNode> = {
  chart: <BarChart3 className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  extract: <Table2 className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
};

// Mock user ID - will be replaced with real user authentication
const MOCK_USER_ID = 'user_001';

interface SidebarProps {
  onUploadComplete?: (uploadedFile: { id: string; name: string; size: number; rowCount?: number; columnCount?: number }) => void;
}

export default function Sidebar({ onUploadComplete }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [filesOpen, setFilesOpen] = useState(true);

  // Use file library hook
  const { files, handleDelete } = useFileLibrary(MOCK_USER_ID);

  const handleAttachFile = (file: { id: string; name: string; size: number; rowCount?: number; columnCount?: number }) => {
    onUploadComplete?.(file);
  };

  return (
    <>
      <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-border shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-border">
          <h1
            className="text-xl font-bold text-foreground tracking-tight cursor-pointer flex items-center gap-2"
            onClick={() => router.push('/')}
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-primary italic">A</span>da<span className="text-muted-foreground font-normal text-sm">.ai</span>
          </h1>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Projects */}
        <div className="px-3 pt-4 flex-none overflow-y-auto">
          <div
            className="flex items-center justify-between w-full px-3 py-1.5"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="p-1 hover:bg-accent/50 rounded transition-colors"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", !projectsOpen && "-rotate-90")} />
            </button>
          </div>

          {projectsOpen && (
            <div className="mt-1 space-y-0.5">
              {/* Mock projects - will be replaced with real data */}
              <button
                onClick={() => router.push('/project/demo')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors truncate",
                  pathname === '/project/demo'
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="truncate">数据分析演示</span>
              </button>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                项目历史将在这里显示...
              </div>
            </div>
          )}
        </div>

        {/* File Library */}
        <div className="mt-4 flex-1 flex flex-col min-h-0">
          <button
            onClick={() => setFilesOpen(!filesOpen)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3 w-3" />
              <span>File Library</span>
            </div>
            <ChevronDown className={cn("h-3 w-3 transition-transform", !filesOpen && "-rotate-90")} />
          </button>

          {filesOpen && (
            <div className="mt-1 space-y-0.5">
              {files.length === 0 ? (
                <div className="px-3 py-4 text-xs text-center text-muted-foreground">
                  还没有上传的文件
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    <span className="flex-1 min-w-0 truncate">{file.name}</span>
                    <button
                      onClick={() => handleAttachFile(file)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                      title="引用此文件"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-all"
                      title="删除文件"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">User</p>
              <p className="text-xs text-muted-foreground truncate">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
