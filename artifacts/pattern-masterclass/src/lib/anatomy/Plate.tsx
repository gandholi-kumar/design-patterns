import React from 'react';
import './iso.css';
import { Lightbulb, Activity } from 'lucide-react';

export interface PlateProps {
  fig: string;
  title: string;
  category?: string;
  guidancePrompt?: string;
  hint?: string;
  readout?: string;
  telemetryHud?: string;
  caption?: string;
  viewBox?: string;
  theme?: string;
  className?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  overlays?: React.ReactNode;
}

export function Plate({
  fig,
  title,
  category,
  guidancePrompt,
  hint,
  readout,
  telemetryHud,
  caption,
  viewBox = '0 0 720 440',
  theme = 'dark',
  className = '',
  children,
  actions,
  overlays,
}: PlateProps) {
  return (
    <figure
      className={`iso rounded-xl border border-border/50 bg-[var(--anatomy-card)] p-4 shadow-xl transition-colors duration-300 ${className}`}
      data-theme={theme}
      style={{
        boxShadow: 'var(--anatomy-lift)',
      }}
    >
      {/* Plate Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/30 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold tracking-wider text-[var(--anatomy-strong)] bg-muted/60 px-2.5 py-1 rounded-md border border-border/40 shadow-xs">
            {fig}
          </span>
          <span className="text-sm font-semibold text-[var(--anatomy-text)] tracking-wide">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {category && (
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded bg-muted/30 border border-border/20">
              {category}
            </span>
          )}
          {actions}
        </div>
      </div>

      {/* Top Guidance Prompt Banner (if provided) */}
      {guidancePrompt && (
        <div className="mb-3 px-3.5 py-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-foreground/90">
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium">{guidancePrompt}</span>
        </div>
      )}

      {/* Isometric Canvas Stage */}
      <div className="relative w-full overflow-hidden rounded-lg bg-[var(--anatomy-page)] border border-border/20 flex flex-col items-center justify-center p-2 min-h-[380px]">
        <svg
          viewBox={viewBox}
          className="iso-svg max-h-[480px] w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${title} isometric diagram`}
        >
          {children}
        </svg>

        {/* Floating In-Canvas Overlays */}
        {overlays && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {overlays}
          </div>
        )}
      </div>

      {/* High-Contrast Telemetry Status HUD */}
      {telemetryHud && (
        <div className="mt-3 px-3.5 py-2 rounded-lg bg-zinc-950/90 text-zinc-100 border border-zinc-800 shadow-md flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-emerald-400">TELEMETRY HUD:</span>
            <span className="text-zinc-200">{telemetryHud}</span>
          </div>
          <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0 opacity-70" />
        </div>
      )}

      {/* Plate Footer / HUD Readout */}
      {(hint || readout) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/20 text-xs">
          {hint ? (
            <div className="flex items-center gap-2 text-[var(--anatomy-muted)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
              <span>{hint}</span>
            </div>
          ) : <div />}
          {readout ? (
            <div className="font-mono text-xs font-medium tracking-tight text-[var(--anatomy-strong)] bg-muted/40 px-3 py-1 rounded-md border border-border/40">
              {readout}
            </div>
          ) : null}
        </div>
      )}

      {/* Caption Footnote */}
      {caption && (
        <figcaption className="mt-2 text-xs leading-relaxed text-[var(--anatomy-muted)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

