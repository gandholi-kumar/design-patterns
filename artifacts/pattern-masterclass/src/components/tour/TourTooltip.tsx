import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lightbulb,
  CheckCheck,
} from 'lucide-react';
import type { TourPlacement, TourStep } from '../../types/tour';

interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  dontShowAgain: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onToggleDontShowAgain: (checked: boolean) => void;
}

const TOOLTIP_WIDTH = 420;
const TOOLTIP_OFFSET = 12;
const VIEWPORT_PADDING = 16;

export function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  targetRect,
  dontShowAgain,
  onNext,
  onPrev,
  onSkip,
  onToggleDontShowAgain,
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(260);

  // Measure tooltip height when step content changes
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [step]);

  // Keyboard shortcut listener for active tour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onSkip]);

  // Compute fixed positioning coordinates
  const coords = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (!targetRect) {
      // Fallback: Centered dialog if target element is not found
      return {
        top: Math.max(VIEWPORT_PADDING, (vh - tooltipHeight) / 2),
        left: Math.max(VIEWPORT_PADDING, (vw - TOOLTIP_WIDTH) / 2),
        placement: 'center' as const,
      };
    }

    const placement: TourPlacement = step.placement || 'bottom';
    let top = 0;
    let left = 0;

    if (placement.startsWith('bottom')) {
      top = targetRect.bottom + TOOLTIP_OFFSET;
      if (placement === 'bottom-start') {
        left = targetRect.left;
      } else if (placement === 'bottom-end') {
        left = targetRect.right - TOOLTIP_WIDTH;
      } else {
        left = targetRect.left + (targetRect.width - TOOLTIP_WIDTH) / 2;
      }

      // Flip to top if overflowing bottom viewport
      if (top + tooltipHeight > vh - VIEWPORT_PADDING) {
        top = targetRect.top - tooltipHeight - TOOLTIP_OFFSET;
      }
    } else if (placement.startsWith('top')) {
      top = targetRect.top - tooltipHeight - TOOLTIP_OFFSET;
      if (placement === 'top-start') {
        left = targetRect.left;
      } else if (placement === 'top-end') {
        left = targetRect.right - TOOLTIP_WIDTH;
      } else {
        left = targetRect.left + (targetRect.width - TOOLTIP_WIDTH) / 2;
      }

      // Flip to bottom if overflowing top
      if (top < VIEWPORT_PADDING) {
        top = targetRect.bottom + TOOLTIP_OFFSET;
      }
    } else if (placement === 'right') {
      left = targetRect.right + TOOLTIP_OFFSET;
      top = targetRect.top + (targetRect.height - tooltipHeight) / 2;

      // Flip to left if overflowing right viewport
      if (left + TOOLTIP_WIDTH > vw - VIEWPORT_PADDING) {
        left = targetRect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET;
      }
    } else if (placement === 'left') {
      left = targetRect.left - TOOLTIP_WIDTH - TOOLTIP_OFFSET;
      top = targetRect.top + (targetRect.height - tooltipHeight) / 2;

      // Flip to right if overflowing left
      if (left < VIEWPORT_PADDING) {
        left = targetRect.right + TOOLTIP_OFFSET;
      }
    }

    // Viewport clamping
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - tooltipHeight - VIEWPORT_PADDING));

    return { top, left, placement };
  }, [targetRect, step.placement, tooltipHeight]);

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      className="tour-tooltip-card fixed z-[9999] rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-2xl transition-all duration-200"
      style={{
        width: `${TOOLTIP_WIDTH}px`,
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      }}
      data-testid="tour-tooltip"
    >
      {/* 1. Header Bar: Counter, Badge & Close Button */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-accent">
            {step.badge}
          </span>
        </div>
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip application tour"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          data-testid="tour-skip-button"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Body: Title and Description */}
      <div className="mt-3.5 space-y-2">
        <h3
          id="tour-step-title"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {step.content}
        </p>

        {/* Pro-Tip Callout Box */}
        {step.tip && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-accent/25 bg-accent/10 p-2.5 text-xs text-foreground">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent" />
            <span className="leading-snug">{step.tip}</span>
          </div>
        )}
      </div>

      {/* 3. Footer Bar: Don't show again toggle, Dots, Navigation buttons */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5">
        {/* Don't show again checkbox */}
        <label
          className="flex cursor-pointer items-center gap-2 select-none text-xs text-muted-foreground transition-colors hover:text-foreground"
          title="Save preference to local storage"
        >
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => onToggleDontShowAgain(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border text-accent accent-amber-500 focus:ring-1 focus:ring-amber-500"
            data-testid="tour-dont-show-checkbox"
          />
          <span>Don't show again</span>
        </label>

        {/* Navigation Buttons & Progress Dots */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isFirst
                ? 'cursor-not-allowed opacity-40 text-muted-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            data-testid="tour-prev-button"
            aria-label="Previous tour step"
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          {/* Next or Finish Button */}
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-transform active:scale-95 shadow hover:brightness-110"
            data-testid="tour-next-button"
            aria-label={isLast ? 'Finish tour' : 'Next tour step'}
          >
            <span>{isLast ? 'Finish' : 'Next'}</span>
            {isLast ? <CheckCheck size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Subtle Step Progress Dots */}
      <div
        className="mt-3 flex items-center justify-center gap-1.5"
        aria-label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStepIndex
                ? 'w-4 bg-accent'
                : 'w-1.5 bg-border opacity-60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
