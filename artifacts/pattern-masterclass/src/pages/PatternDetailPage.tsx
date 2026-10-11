import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  CheckCheck,
  Lightbulb,
  X,
  ArrowRight,
  AlertTriangle,
  Building2,
  GraduationCap,
  RotateCcw,
  Server,
  Sparkles,
} from 'lucide-react';
import { PATTERNS, type Pattern } from '../data';
import type { Perspective } from '../pattern-types';
import { PatternDiagrams } from '../PatternDiagrams';
import { AppTooltip } from '../components/ui/app-tooltip';

export type DetailTab = 'overview' | 'code' | 'diagrams' | 'trade-offs';

const categoryStyle: Record<string, string> = {
  Creational: 'tag-create',
  Structural: 'tag-structure',
  Behavioral: 'tag-behave',
};

interface PatternDetailPageProps {
  id: string;
  saved: {
    theme: 'light' | 'dark';
    bookmarks: string[];
  };
  globalPerspective?: Perspective;
  onBookmark: (id: string) => void;
  goPlayground: (patternId: string) => void;
}

export function PatternDetailPage({
  id,
  saved,
  globalPerspective = 'canonical',
  onBookmark,
  goPlayground,
}: PatternDetailPageProps) {
  const [, setLoc] = useLocation();
  const [tab, setTab] = useState<DetailTab>('overview');
  const [codeCopied, setCodeCopied] = useState(false);

  // Decoupled local perspective state: initialized to the active global selection
  const [localPerspective, setLocalPerspective] = useState<Perspective>(globalPerspective);

  // When switching between patterns using Left/Right arrow, navigation dock, or URL change (id changes),
  // OR when user toggles the global perspective in the topbar, the pattern ALWAYS resets to the global selection.
  useEffect(() => {
    setLocalPerspective(globalPerspective);
  }, [id, globalPerspective]);

  // Secondary local toggle: explicitly decoupled, affects ONLY the local pattern view and NEVER alters global
  const handleLocalToggle = (target: Perspective) => {
    setLocalPerspective(target);
  };

  const activePerspective = localPerspective;

  const pattern = useMemo(() => PATTERNS.find(p => p.id === id), [id]);

  const activeVariant = useMemo(() => {
    if (!pattern) return null;
    return activePerspective === 'canonical' ? pattern.canonical : pattern.enterprise;
  }, [pattern, activePerspective]);

  const sortedSolidPrinciples = useMemo(() => {
    if (!pattern) return [];
    const solidOrder = [
      'Single Responsibility Principle',
      'Open/Closed Principle',
      'Liskov Substitution Principle',
      'Interface Segregation Principle',
      'Dependency Inversion Principle',
    ];
    return [...pattern.solidPrinciples].sort((a, b) => {
      if (a.impact !== b.impact) {
        return a.impact === 'adheres' ? -1 : 1;
      }
      return solidOrder.indexOf(a.principle) - solidOrder.indexOf(b.principle);
    });
  }, [pattern]);

  // Extract preserved search and filter parameters from URL
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const familyFilter = queryParams.get('family');

  const handleBack = () => {
    const qs = window.location.search;
    setLoc(`/${qs}`);
  };

  // Determine current category list for previous / next navigation
  const activeList = useMemo(() => {
    if (familyFilter && familyFilter !== 'All patterns') {
      return PATTERNS.filter(p => p.category === familyFilter);
    }
    return PATTERNS;
  }, [familyFilter]);

  const currentIndex = useMemo(() => {
    if (!pattern) return 0;
    const idx = activeList.findIndex(p => p.id === pattern.id);
    return idx >= 0 ? idx : 0;
  }, [pattern, activeList]);

  const prevPattern = activeList[(currentIndex - 1 + activeList.length) % activeList.length];
  const nextPattern = activeList[(currentIndex + 1) % activeList.length];

  const navigateToPattern = (targetId: string) => {
    const qs = window.location.search;
    setLoc(`/pattern/${targetId}${qs}`);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'ArrowLeft' && prevPattern) {
        navigateToPattern(prevPattern.id);
      } else if (e.key === 'ArrowRight' && nextPattern) {
        navigateToPattern(nextPattern.id);
      } else if ((e.key === 'b' || e.key === 'B') && pattern && !e.ctrlKey && !e.metaKey) {
        onBookmark(pattern.id);
      } else if ((e.key === 'p' || e.key === 'P') && pattern && !e.ctrlKey && !e.metaKey) {
        goPlayground(pattern.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPattern, nextPattern, pattern]);

  const handleCopyCode = async () => {
    const code = activeVariant?.typeScript.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  if (!pattern || !activeVariant) {
    return (
      <div className="pattern-studio-layout not-found-studio">
        <span className="eyebrow">404 / PATTERN NOT FOUND</span>
        <h2>Unknown design pattern: {id}</h2>
        <p>The pattern you are looking for does not exist in this catalog.</p>
        <button className="primary-btn" onClick={() => setLoc('/')}>
          Return to library
        </button>
      </div>
    );
  }

  const tabs: DetailTab[] = ['overview', 'code', 'diagrams', 'trade-offs'];

  return (
    <div className="pattern-studio-layout" data-testid="pattern-studio-page">
      {/* 1. Hero Banner with Perspective Switcher */}
      <header className="studio-hero-banner" role="banner">
        <div className="studio-hero-row1">
          <div className="studio-identity">
            <div className="studio-meta">
              <span className={`category-tag ${categoryStyle[pattern.category]}`}>
                {pattern.category.toUpperCase()}
              </span>
              <span className="studio-counter">
                PATTERN {String(currentIndex + 1).padStart(2, '0')} OF {String(activeList.length).padStart(2, '0')}
              </span>
            </div>
            <h1 className="studio-title">
              {pattern.name}
              <span className="title-accent">.</span>
            </h1>
          </div>

          <div className="studio-hero-actions">
            {/* Secondary Local Perspective Switcher inside Pattern (Icon-Only Decoupled) */}
            <div className="studio-perspective-toggle local-pattern-toggle" role="radiogroup" aria-label="Pattern Perspective">
              {activePerspective !== globalPerspective && (
                <AppTooltip content={`Locally overridden for this pattern. Click to reset to global default (${globalPerspective === 'canonical' ? 'Canonical' : 'Enterprise Cloud'}).`}>
                  <button
                    type="button"
                    className="perspective-sync-btn"
                    onClick={() => setLocalPerspective(globalPerspective)}
                    data-testid="reset-perspective-sync"
                    aria-label="Reset to global perspective"
                  >
                    <RotateCcw size={14} />
                  </button>
                </AppTooltip>
              )}

              <AppTooltip content="Canonical (Refactoring Guru / GoF Academic)">
                <button
                  type="button"
                  role="radio"
                  aria-checked={activePerspective === 'canonical'}
                  aria-label="Canonical Refactoring Guru perspective"
                  className={`perspective-icon-pill ${activePerspective === 'canonical' ? 'active' : ''}`}
                  onClick={() => handleLocalToggle('canonical')}
                  data-testid="hero-perspective-canonical"
                >
                  <GraduationCap size={15} />
                </button>
              </AppTooltip>

              <AppTooltip content="Enterprise Cloud (Production Distributed Systems)">
                <button
                  type="button"
                  role="radio"
                  aria-checked={activePerspective === 'enterprise'}
                  aria-label="Enterprise Cloud perspective"
                  className={`perspective-icon-pill ${activePerspective === 'enterprise' ? 'active' : ''}`}
                  onClick={() => handleLocalToggle('enterprise')}
                  data-testid="hero-perspective-enterprise"
                >
                  <Building2 size={15} />
                </button>
              </AppTooltip>
            </div>

            <div className="studio-memory-hook" title="Memory Hook">
              <Lightbulb size={16} />
              <span className="memory-text">{pattern.memoryHook}</span>
              <span className="memory-badge">MEMORY HOOK</span>
            </div>
          </div>
        </div>

        <div className="studio-hero-row2">
          {activePerspective === 'canonical' ? (
            <p className="studio-tagline">{pattern.tagline}</p>
          ) : (
            <div className="studio-enterprise-tagline-wrap">
              <span className="enterprise-context-badge">
                <Building2 size={13} />
                <span>PRODUCTION CLOUD ARCHITECTURE</span>
              </span>
              <p className="studio-tagline enterprise-tagline">
                <strong className="text-foreground">{pattern.enterprise.title}:</strong>{' '}
                <span>{pattern.enterprise.scenario}</span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* 2. The 4 Standard Tabs Bar */}
      <div className="studio-tabs-bar" role="tablist" aria-label="Pattern detail tabs">
        {tabs.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`studio-tab-pill ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            data-testid={`studio-tab-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 3. Main Viewport-Pinned Tab Workspace */}
      <main className="studio-workspace-area" role="tabpanel">
        {tab === 'overview' && (
          <div className="studio-editorial-overview studio-stacked-overview" data-testid="studio-overview">
            {/* 1. THE INTENT */}
            <section className="editorial-section section-intent">
              <div className="section-label-row">
                <span className="overview-label">THE INTENT</span>
                {activePerspective === 'enterprise' && (
                  <span className="perspective-flag enterprise">
                    <Building2 size={12} /> ENTERPRISE SCOPE: {pattern.enterprise.title}
                  </span>
                )}
                {activePerspective === 'canonical' && (
                  <span className="perspective-flag canonical">
                    <GraduationCap size={12} /> CANONICAL GoF / REFACTORING GURU
                  </span>
                )}
              </div>
              <p className="intent-statement">{pattern.intent}</p>
            </section>

            <div className="overview-divider" />

            {/* 2. THE PROBLEM, THE SOLUTION & IN THE WILD */}
            <section className="editorial-section section-core">
              <div className="overview-columns">
                <div className="overview-col">
                  <span className="overview-label">THE PROBLEM</span>
                  <p>{activeVariant.problem}</p>
                </div>
                <div className="overview-col">
                  <span className="overview-label">THE SOLUTION</span>
                  <p>{activeVariant.solution}</p>
                </div>
              </div>

              <div className="overview-wild">
                <span className="overview-label">
                  {activePerspective === 'canonical' ? 'IN THE WILD (CLASSIC)' : 'IN THE WILD (ENTERPRISE CLOUD)'}
                </span>
                <p>{activeVariant.scenario}</p>
              </div>
            </section>

            <div className="overview-divider" />

            {/* 3. USE IT WHEN & THINK TWICE WHEN */}
            <section className="editorial-section section-usage">
              <div className="overview-columns">
                <div className="overview-col">
                  <span className="overview-label">USE IT WHEN</span>
                  <div className="bullet-stack">
                    {activeVariant.whenToUse.map(v => (
                      <p className="bullet-item yes" key={v}>
                        <Check size={15} />
                        <span>{v}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="overview-col">
                  <span className="overview-label">THINK TWICE WHEN</span>
                  <div className="bullet-stack">
                    {activeVariant.whenNotToUse.map(v => (
                      <p className="bullet-item no" key={v}>
                        <X size={15} />
                        <span>{v}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. COLLABORATION SHAPE (Single Framed Container) */}
            <section className="editorial-shape-frame">
              <span className="overview-label">
                COLLABORATION SHAPE · {activePerspective === 'canonical' ? 'OBJECT GRAPH' : 'CLOUD INFRASTRUCTURE'}
              </span>
              <pre className="shape-ascii">{activeVariant.asciiShape}</pre>
            </section>
          </div>
        )}

        {tab === 'code' && (
          <div className="studio-code-layout" data-testid="studio-code">
            {/* Left Narrative Pane */}
            <div className="code-narrative-pane">
              <div className="bento-card code-spec-card">
                <span className="bento-eyebrow">
                  IMPLEMENTATION STRATEGY · {activePerspective === 'canonical' ? 'GoF CLASSIC' : 'ENTERPRISE CLOUD'}
                </span>
                <p className="code-explanation-text">
                  {activeVariant.typeScript.explanation}
                </p>
              </div>

              <div className="bento-card code-meta-card">
                <span className="bento-eyebrow">TARGET ENVIRONMENT</span>
                <div className="code-meta-list">
                  <div className="meta-row">
                    <span>Language</span>
                    <b>TypeScript 5.x</b>
                  </div>
                  <div className="meta-row">
                    <span>Architecture</span>
                    <b>{activePerspective === 'canonical' ? 'In-Memory OOP' : 'Distributed Cloud'}</b>
                  </div>
                  <div className="meta-row">
                    <span>File</span>
                    <code>{activeVariant.typeScript.fileName}</code>
                  </div>
                </div>
              </div>

              <div className="code-launch-card">
                <button
                  className="primary-btn playground-launch-btn"
                  onClick={() => goPlayground(pattern.id)}
                  data-testid="studio-launch-playground"
                >
                  <Code2 size={16} />
                  <span>Open in Playground</span>
                  <ArrowRight size={15} />
                </button>
                <small>Inspect and execute interactively in the REPL environment</small>
              </div>
            </div>

            {/* Right Syntax-Highlighted Code Editor Viewer */}
            <div className="code-editor-pane">
              <div className="code-editor-header">
                <div className="editor-file-info">
                  <span className="file-dot" />
                  <span className="editor-filename">
                    {activeVariant.typeScript.fileName}
                  </span>
                  <span className="perspective-file-badge">
                    {activePerspective === 'canonical' ? 'Refactoring Guru' : 'Enterprise Cloud'}
                  </span>
                </div>
                <div className="editor-actions">
                  <AppTooltip content={codeCopied ? 'Copied to clipboard!' : 'Copy source code'}>
                    <button
                      className="icon-btn editor-copy-btn"
                      onClick={handleCopyCode}
                      aria-label="Copy source code"
                    >
                      {codeCopied ? <CheckCheck size={15} className="text-emerald-500" /> : <Copy size={15} />}
                      <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </AppTooltip>
                </div>
              </div>
              <pre className="code-editor-viewport">
                <code>{activeVariant.typeScript.code}</code>
              </pre>
            </div>
          </div>
        )}

        {tab === 'diagrams' && (
          <div className="studio-diagrams-layout" data-testid="studio-diagrams">
            <PatternDiagrams
              patternId={pattern.id}
              patternName={pattern.name}
              theme={saved.theme}
              perspective={activePerspective}
            />
          </div>
        )}

        {tab === 'trade-offs' && (
          <div className="studio-editorial-tradeoffs studio-tradeoffs-layout" data-testid="studio-tradeoffs">
            {/* Enterprise Architectural Trade-off Banner */}
            {activePerspective === 'enterprise' && (
              <div className="enterprise-tradeoff-banner">
                <div className="banner-icon">
                  <Server size={18} />
                </div>
                <div className="banner-content">
                  <span className="banner-eyebrow">ENTERPRISE CLOUD ARCHITECTURAL PROFILE</span>
                  <p className="banner-text">
                    In distributed microservices, applying <strong>{pattern.name}</strong> introduces trade-offs between clean domain abstraction and operational complexity: network latency over boundaries, serialization overhead, vendor SDK blast radius, and saga consistency.
                  </p>
                </div>
              </div>
            )}

            {/* 1. WHAT IT SUPPORTS */}
            <section className="tradeoffs-editorial-section">
              <span className="overview-label">WHAT IT SUPPORTS</span>
              <div className="overview-divider" />

              <div className="tradeoffs-solid-stack">
                {sortedSolidPrinciples.map((x) => (
                  <div key={x.principle} className="solid-editorial-item">
                    <div className="solid-badge-col">
                      <span className={`tradeoff-impact-badge ${x.impact.toLowerCase()}`}>
                        {x.impact}
                      </span>
                    </div>
                    <div className="solid-body-col">
                      <h4 className="solid-principle-title">{x.principle}</h4>
                      <p className="solid-principle-desc">{x.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. EASY TO CONFUSE WITH */}
            <section className="tradeoffs-editorial-section">
              <span className="overview-label">EASY TO CONFUSE WITH</span>
              <div className="overview-divider" />

              <div className="tradeoffs-confused-stack">
                {pattern.confusedWith.map((x, idx) => (
                  <div key={x.targetPattern} className="confused-editorial-item">
                    <h4 className="confused-pattern-title">{x.targetPattern}</h4>
                    <p className="confused-pattern-desc">{x.keyDifference}</p>
                    <div className="tradeoff-decision-rule">
                      <span className="rule-badge">DECISION RULE</span>
                      <span className="rule-dot">·</span>
                      <span className="rule-text">{x.decisionRule}</span>
                    </div>
                    {idx < pattern.confusedWith.length - 1 && (
                      <div className="overview-divider item-divider" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. INTERVIEW TRAPS */}
            <section className="tradeoffs-editorial-section">
              <span className="overview-label">INTERVIEW TRAPS</span>
              <div className="tradeoffs-traps-stack">
                {pattern.interviewTraps.map(trap => (
                  <div key={trap} className="trap-editorial-item">
                    <span className="trap-bang">!</span>
                    <p className="trap-text">{trap}</p>
                  </div>
                ))}
              </div>
              <div className="overview-divider" />
            </section>
          </div>
        )}
      </main>

      {/* 4. Pinned Bottom Navigation Dock (2.625rem) */}
      <footer className="studio-bottom-dock" role="navigation" aria-label="Sequential pattern navigation">
        {prevPattern ? (
          <AppTooltip content={`Previous: ${prevPattern.name} (← arrow key)`} side="top">
            <button
              className="dock-nav-btn dock-prev"
              onClick={() => navigateToPattern(prevPattern.id)}
              data-testid="dock-prev-pattern"
            >
              <ChevronLeft size={16} />
              <div className="dock-btn-info">
                <span className="dock-sub">PREVIOUS</span>
                <span className="dock-name">{prevPattern.name}</span>
              </div>
            </button>
          </AppTooltip>
        ) : (
          <div className="dock-placeholder" />
        )}

        <div className="dock-center">
          <span className="dock-counter">
            {pattern.category.toUpperCase()} PATTERN {String(currentIndex + 1).padStart(2, '0')} OF {String(activeList.length).padStart(2, '0')}
          </span>
          <span className="dock-keys">Press ← or → to browse</span>
        </div>

        {nextPattern ? (
          <AppTooltip content={`Next: ${nextPattern.name} (→ arrow key)`} side="top">
            <button
              className="dock-nav-btn dock-next"
              onClick={() => navigateToPattern(nextPattern.id)}
              data-testid="dock-next-pattern"
            >
              <div className="dock-btn-info text-right">
                <span className="dock-sub">NEXT</span>
                <span className="dock-name">{nextPattern.name}</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </AppTooltip>
        ) : (
          <div className="dock-placeholder" />
        )}
      </footer>
    </div>
  );
}
