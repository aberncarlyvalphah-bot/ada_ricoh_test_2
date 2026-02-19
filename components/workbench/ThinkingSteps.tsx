'use client';

import { Check, Loader2 } from 'lucide-react';

interface ThinkingStep {
  id: string;
  status: 'completed' | 'loading' | 'pending';
  text: string;
}

interface ThinkingStepsProps {
  steps: ThinkingStep[];
}

export default function ThinkingSteps({ steps }: ThinkingStepsProps) {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div key={step.id} className="flex items-start gap-3 text-sm">
          <div className="mt-0.5 shrink-0">
            {step.status === 'completed' && (
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            {step.status === 'loading' && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
              </div>
            )}
            {step.status === 'pending' && (
              <div className="h-5 w-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1 pt-0.5">
            <p className={step.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}>
              {step.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
