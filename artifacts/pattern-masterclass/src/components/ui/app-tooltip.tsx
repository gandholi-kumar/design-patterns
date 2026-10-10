import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface AppTooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  children: React.ReactNode;
}

export function AppTooltip({
  content,
  shortcut,
  side = 'bottom',
  align = 'center',
  delayDuration = 150,
  children,
}: AppTooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="app-tooltip-content flex items-center gap-1.5 text-[12px] font-medium py-1 px-2.5 z-50 pointer-events-none"
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="app-tooltip-kbd text-[10px] px-1 py-0.5 rounded bg-muted/30 border border-border/40 font-mono opacity-80">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
