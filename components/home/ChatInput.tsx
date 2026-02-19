'use client';

import { useState, useRef } from 'react';
import { Paperclip, Globe, AtSign, CalendarDays, Sparkles, X, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskMode } from '@/types';

const modeLabels: Record<TaskMode, string> = {
  chart: 'Create Chart',
  dashboard: 'Build Dashboard',
  extract: 'Extract Data',
  report: 'Write Report',
};

const modeColors: Record<TaskMode, string> = {
  chart: 'bg-primary/10 text-primary border border-primary/20',
  dashboard: 'bg-primary/10 text-primary border border-primary/20',
  extract: 'bg-primary/10 text-primary border border-primary/20',
  report: 'bg-primary/10 text-primary border border-primary/20',
};

interface ChatInputProps {
  activeMode: TaskMode | null;
  onClearMode: () => void;
  onSend: (message: string) => void;
}

export default function ChatInput({ activeMode, onClearMode, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
        {/* Mode badge */}
        {activeMode && (
          <div className="px-4 pt-3 pb-0">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium", modeColors[activeMode])}>
              {modeLabels[activeMode]}
              <button onClick={onClearMode} className="ml-1 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask questions with data from files, URLs, or @ references"
          rows={4}
          className="w-full px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
              <Paperclip className="h-4 w-4" />
              Add Data
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Globe className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <AtSign className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className={cn(
                "p-2 rounded-full transition-colors",
                value.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
