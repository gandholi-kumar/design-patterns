import React, { useState } from 'react';
import { ExternalLink, Terminal, Shield, Layers, Play, RefreshCw, Info, CheckCircle2, ChevronRight, Copy } from 'lucide-react';
import type { StudioPerspective } from './PerspectiveSwitch';

export interface MethodDispatch {
  id: string;
  timestamp: string;
  caller: string;
  method: string;
  status: 'ok' | 'blocked' | 'dispatched' | 'reverted';
  detail?: string;
}

export interface GofRole {
  role: string;
  implementation: string;
  description: string;
}

export interface CorrelationDockProps {
  patternName: string;
  patternId: string;
  perspective: StudioPerspective;
  dispatches: MethodDispatch[];
  roles: GofRole[];
  codeSnippet: string;
  codeFileName: string;
  conceptSummary?: string;
  controls?: React.ReactNode;
  onClearDispatches?: () => void;
  onOpenPlayground: () => void;
  className?: string;
}

export function CorrelationDock({
  patternName,
  patternId,
  perspective,
  dispatches,
  roles,
  codeSnippet,
  codeFileName,
  conceptSummary,
  controls,
  onClearDispatches,
  onOpenPlayground,
  className = '',
}: CorrelationDockProps) {
  const [activeTab, setActiveTab] = useState<'trace' | 'roles' | 'code'>('trace');
  const [copied, setCopied] = useState(false);

  // Default concept summary if none provided
  const defaultSummary = conceptSummary || (
    perspective === 'enterprise'
      ? `Ensures isolated cloud topologies where compute, storage, and networking belong to the same cloud provider, preventing catastrophic multi-cloud configuration drift.`
      : perspective === 'canonical'
      ? `Enforces consistent OS widget hierarchies (macOS vs Windows) at instantiation time, preventing mixed-GUI glitches across window frames, buttons, and dialogs.`
      : `Coordinates matched toolhead dies and stamping fixtures so that industrial workpieces are formed with uniform tolerances and geometry.`
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <aside
      className={`flex flex-col h-full min-h-[580px] rounded-xl border border-border/50 bg-card shadow-xl backdrop-blur-md overflow-hidden ${className}`}
      aria-label="Architecture and Code Correlation Dock"
    >
      {/* Dock Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground">
              Architecture Correlation
            </h3>
            <p className="text-xs text-muted-foreground font-sans">
              Live runtime trace & GoF participant mapping
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenPlayground}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs font-medium shadow-sm transition-all"
          title="Open in Code Playground"
        >
          <span>Open in Playground</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Concept in a Nutshell Card */}
      <div className="p-4 border-b border-border/30 bg-muted/15">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Pattern Concept In A Nutshell
            </div>
            <p className="text-sm text-foreground/90 font-sans leading-relaxed">
              {defaultSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Section (if provided) */}
      {controls && (
        <div className="p-4 border-b border-border/30 bg-muted/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Interactive Controls
          </div>
          {controls}
        </div>
      )}

      {/* Sub-Tabs: Trace | Roles | Code */}
      <div className="flex border-b border-border/30 px-3 bg-muted/20 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('trace')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'trace'
              ? 'border-primary text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Play className="h-3.5 w-3.5" />
          <span>Live Call Trace</span>
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.2 text-[11px] font-mono text-primary font-bold">
            {dispatches.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-primary text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>GoF Roles</span>
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 text-[11px] font-mono text-muted-foreground">
            {roles.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-primary text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Source Code</span>
        </button>
      </div>

      {/* Dock Content Body: Full-height, no 360px cap */}
      <div className="flex-1 p-4 overflow-y-auto text-sm font-sans min-h-[300px]">
        {activeTab === 'trace' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/20">
              <span className="font-medium tracking-wide">LIVE CALL STACK DISPATCHES</span>
              {onClearDispatches && dispatches.length > 0 && (
                <button
                  type="button"
                  onClick={onClearDispatches}
                  className="hover:text-foreground underline transition-colors"
                >
                  Clear log
                </button>
              )}
            </div>

            {dispatches.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                <RefreshCw className="h-8 w-8 text-primary/40 animate-pulse" />
                <div className="text-sm font-medium text-foreground">Awaiting Execution</div>
                <p className="text-xs max-w-[260px] text-muted-foreground">
                  Trigger an action from the top toolbar or click on the apparatus canvas to dispatch factory methods and inspect live execution.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dispatches.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg bg-muted/25 border border-border/30 hover:border-primary/40 flex flex-col gap-1.5 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{d.timestamp}</span>
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          d.status === 'ok'
                            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            : d.status === 'blocked'
                            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                            : 'bg-primary/15 text-primary border-primary/30'
                        }`}
                      >
                        {d.status === 'ok' ? '✓ OK' : d.status}
                      </span>
                    </div>

                    <div className="text-sm font-mono font-semibold text-foreground flex items-center gap-1">
                      <span>{d.caller}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-primary">{d.method}()</span>
                    </div>

                    {d.detail && (
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                        {d.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground pb-2 border-b border-border/20 font-medium tracking-wide">
              PARTICIPANTS & RESPONSIBILITIES IN {patternName.toUpperCase()}
            </div>
            <div className="space-y-2.5">
              {roles.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/25 border border-border/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary text-sm font-mono">{r.role}</span>
                    <span className="font-mono text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/30">
                      {r.implementation}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/20">
              <span className="font-mono font-medium text-foreground">{codeFileName}</span>
              <div className="flex items-center gap-2">
                <span className="uppercase font-semibold text-primary">{perspective}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 rounded-lg bg-black/60 border border-border/40 overflow-x-auto text-xs font-mono leading-relaxed text-zinc-200">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
}

