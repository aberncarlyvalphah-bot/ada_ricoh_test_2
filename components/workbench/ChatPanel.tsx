'use client';

import { ArrowLeft, RefreshCw, Download, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThinkingSteps from './ThinkingSteps';
import ChatInput from '@/components/home/ChatInput';
import { useChat, type ChatMessage } from '@/lib/hooks/useChat';
import type { TaskMode, ChartConfig } from '@/types';

interface ChatPanelProps {
  projectId: string;
  initialMode?: TaskMode;
  onChartUpdate?: (chart: ChartConfig) => void;
}

export default function ChatPanel({ projectId, initialMode, onChartUpdate }: ChatPanelProps) {
  const router = useRouter();
  const {
    messages,
    isLoading,
    activeMode,
    setActiveMode,
    sendMessage,
    retryLastMessage,
    clearMessages,
    exportChat,
    cancelRequest,
  } = useChat(projectId, initialMode);

  const handleSend = (message: string) => {
    sendMessage(message, undefined, onChartUpdate);
  };

  const handleClearMode = () => {
    setActiveMode(null);
  };

  return (
    <div className="h-full flex flex-col border-r">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="gap-1 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            {messages.length > 0 ? '数据分析对话' : '新对话'}
          </h2>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={exportChat}
              title="导出对话"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearMessages}
              title="清空对话"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={message.role === 'assistant' ? retryLastMessage : undefined}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 shrink-0">
        {isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRequest}
            className="mb-2 text-destructive hover:text-destructive"
          >
            取消请求
          </Button>
        )}
        <div className="w-full">
          <ChatInput
            activeMode={activeMode}
            onClearMode={handleClearMode}
            onSend={handleSend}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="text-muted-foreground mb-4">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-sm mb-2">开始新的数据分析对话</p>
        <p className="text-xs text-muted-foreground">
          上传数据文件，或直接输入您的问题
        </p>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={`max-w-md ${
          isUser
            ? 'bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm'
            : 'w-full'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <AssistantMessage message={message} onRetry={onRetry} />
        )}
      </div>
    </div>
  );
}

function AssistantMessage({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: () => void;
}) {
  if (message.error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm">
        <p className="text-destructive font-medium mb-2">出错了</p>
        <p className="text-destructive/80">{message.error}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Thinking Steps */}
      {message.thinkingSteps && message.thinkingSteps.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Analysis Steps
          </h4>
          <ThinkingSteps steps={message.thinkingSteps} />
        </div>
      )}

      {/* Conclusion */}
      {message.content && (
        <div className="bg-card border rounded-xl p-4 text-sm space-y-2">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {message.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              ●
            </span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>
              ●
            </span>
          </div>
          <span>AI 正在思考...</span>
        </div>
      )}
    </div>
  );
}
