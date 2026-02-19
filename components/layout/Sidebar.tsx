'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquarePlus, Database, FolderOpen, ChevronDown, FileSpreadsheet, BarChart3, LayoutDashboard, FileText, Table2, Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskMode } from '@/types';

const modeIcons: Record<TaskMode, React.ReactNode> = {
  chart: <BarChart3 className="h-4 w-4" />,
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  extract: <Table2 className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
};

// Mock data - will be replaced with real data from Supabase
const mockProjects = [
  { id: '1', title: '各地区销售额对比分析', mode: 'chart' as TaskMode, createdAt: '2天前' },
  { id: '2', title: '学生成绩仪表盘', mode: 'dashboard' as TaskMode, createdAt: '5天前' },
];

const mockFiles = [
  { id: '1', name: 'Q1销售数据.xlsx' },
  { id: '2', name: '学生成绩单.csv' },
  { id: '3', name: '2024年度报表.xlsx' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [filesOpen, setFilesOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      console.log('File selected:', file.name, 'Size:', file.size);

      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`❌ 文件过大！\n最大支持 10 MB\n当前文件大小: ${Math.round(file.size / 1024 / 1024)} MB`);
        return;
      }

      const fileName = file.name.toLowerCase();
      const isCSV = fileName.endsWith('.csv');
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

      if (!isCSV && !isExcel) {
        alert('❌ 不支持的文件格式！\n仅支持 CSV 或 Excel 文件 (.csv, .xlsx, .xls)');
        return;
      }

      // TODO: Process and upload the file
      alert(`✅ 文件已选择:\n\n文件名: ${file.name}\n大小: ${Math.round(file.size / 1024)} KB\n格式: ${isCSV ? 'CSV' : 'Excel'}\n\n文件正在解析...\n\n实际上传功能待实现`);
    }
  };

  return (
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

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{
          position: 'fixed',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
        onChange={handleFileUpload}
      />

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
      <div className="px-3 pt-4 flex-1 overflow-y-auto">
        <div
          className="flex items-center justify-between w-full px-3 py-1.5"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                // Trigger file upload using ref
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="p-1 hover:bg-accent/50 rounded transition-colors"
              title="上传文件"
            >
              <Upload className="h-3 w-3" />
            </button>
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="p-1 hover:bg-accent/50 rounded transition-colors"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", !projectsOpen && "-rotate-90")} />
            </button>
          </div>
        </div>

        {projectsOpen && (
          <div className="mt-1 space-y-0.5">
            {mockProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors truncate",
                  pathname === `/project/${project.id}`
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                {modeIcons[project.mode]}
                <span className="truncate">{project.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* File Library */}
        <div className="mt-4">
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
              {mockFiles.map((file) => (
                <button
                  key={file.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent/50 text-foreground transition-colors truncate group"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
  );
}
