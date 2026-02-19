'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThinkingSteps from './ThinkingSteps';
import ChatInput from '@/components/home/ChatInput';

export default function ChatPanel() {
  const router = useRouter();

  // Mock thinking steps
  const mockThinkingSteps = [
    { id: '1', status: 'completed' as const, text: '正在读取文件表头...' },
    { id: '2', status: 'completed' as const, text: '已提取 WONG TSZ YING 的 12 门科目成绩' },
    { id: '3', status: 'loading' as const, text: '正在生成雷达图结构...' },
  ];

  // Mock final conclusion
  const mockConclusion = `根据对 WONG TSZ YING 同学成绩的分析，得出以下结论：

**优势科目**：
- 美术：95分，表现最为突出
- 数学：92分，逻辑思维能力较强
- 音乐：92分，艺术素养优秀

**需要关注的科目**：
- 生物：75分，相对较弱，建议加强基础知识复习
- 物理：78分，需要多做练习题

**总体评价**：
该同学文理科发展较为均衡，艺术类科目表现优异。理科中的物理和生物需要重点关注，建议通过增加练习时间和针对性辅导来提升。整体而言，该同学具有良好的学习潜力，保持当前的学习态度和方法，成绩会有进一步提升。`;

  return (
    <div className="h-full flex flex-col border-r">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold truncate">WONG TSZ YING 成绩分析</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-4 min-h-0">
        <div className="space-y-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm max-w-md text-sm">
              帮我分析一下 WONG TSZ YING 的各科成绩分布。
            </div>
          </div>

          {/* AI thinking steps */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Analysis Steps
            </h4>
            <ThinkingSteps steps={mockThinkingSteps} />
          </div>

          {/* AI conclusion */}
          <div className="bg-card border rounded-xl p-4 text-sm space-y-2">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{mockConclusion}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="w-full">
          <ChatInput activeMode={null} onClearMode={() => {}} onSend={() => {}} />
        </div>
      </div>
    </div>
  );
}
