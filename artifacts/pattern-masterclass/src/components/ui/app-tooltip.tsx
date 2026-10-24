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
          className="app-tooltip-content inline-flex items-center gap-1.5 text-[0.75rem] font-medium py-1 px-2.5 z-50 pointer-events-none whitespace-nowrap select-none"
        >
          <span className="whitespace-nowrap inline-block">{content}</span>
          {shortcut && (
            <kbd className="app-tooltip-kbd inline-flex items-center justify-center font-mono text-[0.625rem] font-semibold px-1.5 py-0.5 rounded text-primary-foreground bg-primary-foreground/15 border border-primary-foreground/30 leading-none shadow-xs whitespace-nowrap shrink-0">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
