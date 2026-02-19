'use client';

import { useState, useCallback, useRef } from 'react';
import type { TaskMode, ThinkingStep, ChartConfig, DataPreview } from '@/types';
import { apiClient } from '@/lib/api/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinkingSteps?: ThinkingStep[];
  chart?: ChartConfig;
  isLoading?: boolean;
  error?: string;
}

export function useChat(projectId: string, initialMode?: TaskMode) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TaskMode | null>(initialMode || null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Add a new user message
   */
  const addUserMessage = useCallback(
    (content: string, _files?: File[]) => {
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      return userMessage.id;
    },
    []
  );

  /**
   * Add an assistant message with loading state
   */
  const addAssistantMessage = useCallback(() => {
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      thinkingSteps: [],
      isLoading: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage.id;
  }, []);

  /**
   * Update assistant message (thinking steps, content, etc.)
   */
  const updateAssistantMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      );
    },
    []
  );

  /**
   * Send message to AI
   */
  const sendMessage = useCallback(
    async (content: string, files?: File[], onChartUpdate?: (chart: ChartConfig) => void) => {
      if (isLoading || !content.trim()) return;

      setIsLoading(true);

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Add user message
      addUserMessage(content, files);

      // Add assistant message with loading state
      const assistantId = addAssistantMessage();

      try {
        // Send to API
        await apiClient.sendChat(
          {
            projectId,
            message: content,
            files: files?.map((f) => ({
              id: `file_${Date.now()}`,
              name: f.name,
              size: f.size,
              type: f.type,
            })),
            mode: activeMode || undefined,
          },
          // Handle chunk
          (chunk) => {
            switch (chunk.type) {
              case 'thinking_step':
                updateAssistantMessage(assistantId, {
                  thinkingSteps: [chunk.data as ThinkingStep],
                });
                break;

              case 'conclusion':
                updateAssistantMessage(assistantId, {
                  content: (chunk.data as { content: string; isComplete: boolean }).content,
                  isLoading: !(chunk.data as { content: string; isComplete: boolean }).isComplete,
                });
                break;

              case 'chart':
                updateAssistantMessage(assistantId, {
                  chart: chunk.data as ChartConfig,
                });
                onChartUpdate?.(chunk.data as ChartConfig);
                break;

              case 'data':
                // Handle data preview
                console.log('Data preview:', chunk.data);
                break;

              case 'error':
                updateAssistantMessage(assistantId, {
                  error: (chunk.data as { message: string; retryable: boolean }).message,
                  isLoading: false,
                });
                break;

              case 'done':
                updateAssistantMessage(assistantId, {
                  isLoading: false,
                });
                break;
            }
          },
          // On complete
          () => {
            setIsLoading(false);
            updateAssistantMessage(assistantId, {
              isLoading: false,
            });
          },
          // On error
          (error) => {
            setIsLoading(false);
            updateAssistantMessage(assistantId, {
              error: error.message,
              isLoading: false,
            });
          }
        );
      } catch (error) {
        setIsLoading(false);
        updateAssistantMessage(assistantId, {
          error: error instanceof Error ? error.message : 'An error occurred',
          isLoading: false,
        });
      }
    },
    [projectId, isLoading, activeMode, addUserMessage, addAssistantMessage, updateAssistantMessage]
  );

  /**
   * Retry last message
   */
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user');

    if (lastUserMessage) {
      // Remove last assistant response
      setMessages((prev) => {
        const lastIndex = prev.findLastIndex((msg) => msg.role === 'assistant');
        return lastIndex >= 0 ? prev.slice(0, lastIndex) : prev;
      });

      // Resend
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
  }, []);

  /**
   * Export chat history
   */
  const exportChat = useCallback(() => {
    const exportText = messages
      .map((msg) => {
        const time = new Date(msg.timestamp).toLocaleString();
        const role = msg.role === 'user' ? 'User' : 'AI';
        let content = `[${time}] ${role}:\n${msg.content}`;

        if (msg.thinkingSteps && msg.thinkingSteps.length > 0) {
          content += '\n\nThinking Steps:\n' +
            msg.thinkingSteps.map((step, i) =>
              `${i + 1}. ${step.text} [${step.status}]`
            ).join('\n');
        }

        return content;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `chat_export_${Date.now()}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [messages]);

  /**
   * Cancel current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      // Update last message to show cancelled state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.role === 'assistant' && msg.isLoading
            ? { ...msg, isLoading: false, error: 'Request cancelled' }
            : msg
        )
      );
    }
  }, []);

  return {
    messages,
    isLoading,
    activeMode,
    setActiveMode,
    sendMessage,
    retryLastMessage,
    clearMessages,
    exportChat,
    cancelRequest,
  };
}
