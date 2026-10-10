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
} from 'lucide-react';
import { PATTERNS, type Pattern } from '../data';
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
  onBookmark: (id: string) => void;
  goPlayground: (patternId: string) => void;
}

export function PatternDetailPage({
  id,
  saved,
  onBookmark,
  goPlayground,
}: PatternDetailPageProps) {
  const [, setLoc] = useLocation();
  const [tab, setTab] = useState<DetailTab>('overview');
  const [codeCopied, setCodeCopied] = useState(false);

  const pattern = useMemo(() => PATTERNS.find(p => p.id === id), [id]);

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
    if (!pattern?.typeScriptImplementation.code) return;
    try {
      await navigator.clipboard.writeText(pattern.typeScriptImplementation.code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  if (!pattern) {
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
      {/* 1. Hero Banner: Layout matching Untitled-1:L3-L8 */}
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

          <div className="studio-memory-hook" title="Memory Hook">
            <Lightbulb size={16} />
            <span className="memory-text">{pattern.memoryHook}</span>
            <span className="memory-badge">MEMORY HOOK</span>
          </div>
        </div>

        <div className="studio-hero-row2">
          <p className="studio-tagline">{pattern.tagline}</p>
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
          <div className="studio-bento-grid" data-testid="studio-overview">
            {/* Column 1: Core Foundation */}
            <div className="bento-column bento-col-core">
              <div className="bento-card card-intent">
                <span className="bento-eyebrow">THE INTENT</span>
                <blockquote className="bento-intent-quote">
                  "{pattern.intent}"
                </blockquote>
              </div>
              <div className="bento-card card-problem">
                <span className="bento-eyebrow">THE PROBLEM</span>
                <p>{pattern.problem}</p>
              </div>
              <div className="bento-card card-solution">
                <span className="bento-eyebrow">THE SOLUTION</span>
                <p>{pattern.solution}</p>
              </div>
            </div>

            {/* Column 2: Application & Usage */}
            <div className="bento-column bento-col-app">
              <div className="bento-card card-wild">
                <span className="bento-eyebrow">IN THE WILD · PRODUCTION SCENARIO</span>
                <p>{pattern.realWorldEnterpriseScenario}</p>
              </div>
              <div className="bento-card card-when">
                <span className="bento-eyebrow">USE IT WHEN</span>
                <ul className="bento-bullet-list">
                  {pattern.whenToUse.map(v => (
                    <li key={v} className="bento-bullet yes">
                      <Check size={14} />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bento-card card-avoid">
                <span className="bento-eyebrow">THINK TWICE WHEN</span>
                <ul className="bento-bullet-list">
                  {pattern.whenNotToUse.map(v => (
                    <li key={v} className="bento-bullet no">
                      <X size={14} />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 3: Collaboration Shape & Decision Rule */}
            <div className="bento-column bento-col-shape">
              <div className="bento-card card-shape">
                <span className="bento-eyebrow">COLLABORATION SHAPE</span>
                <pre className="bento-ascii-shape">{pattern.asciiShape}</pre>
              </div>
              <div className="bento-card card-rule">
                <span className="bento-eyebrow">DECISION RULE</span>
                <p className="bento-rule-text">
                  <b>Rule:</b> {pattern.memoryHook}
                </p>
                <small className="bento-rule-sub">
                  Applied in {pattern.category.toLowerCase()} architecture boundaries.
                </small>
              </div>
            </div>
          </div>
        )}

        {tab === 'code' && (
          <div className="studio-code-layout" data-testid="studio-code">
            {/* Left Narrative Pane */}
            <div className="code-narrative-pane">
              <div className="bento-card code-spec-card">
                <span className="bento-eyebrow">IMPLEMENTATION STRATEGY</span>
                <p className="code-explanation-text">
                  {pattern.typeScriptImplementation.explanation}
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
                    <span>Execution</span>
                    <b>Node / Web Worker</b>
                  </div>
                  <div className="meta-row">
                    <span>File</span>
                    <code>{pattern.typeScriptImplementation.fileName}</code>
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
                    {pattern.typeScriptImplementation.fileName}
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
                <code>{pattern.typeScriptImplementation.code}</code>
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
            />
          </div>
        )}

        {tab === 'trade-offs' && (
          <div className="studio-tradeoffs-layout" data-testid="studio-tradeoffs">
            {/* Left: SOLID Principles Impact */}
            <div className="tradeoffs-column tradeoffs-solid-col">
              <div className="tradeoffs-header-card">
                <span className="bento-eyebrow">WHAT IT SUPPORTS & IMPACTS</span>
                <h3>SOLID Principles Alignment</h3>
                <p>How this pattern interacts with fundamental design principles.</p>
              </div>

              <div className="solid-principles-list">
                {pattern.solidPrinciples.map(x => (
                  <div className="solid-item-card" key={x.principle}>
                    <div className="solid-item-head">
                      <span className={`impact-badge ${x.impact}`}>
                        {x.impact}
                      </span>
                      <b>{x.principle}</b>
                    </div>
                    <p>{x.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Confused With & Interview Traps */}
            <div className="tradeoffs-column tradeoffs-traps-col">
              <div className="tradeoffs-header-card">
                <span className="bento-eyebrow">EDGE CASES & EVALUATION</span>
                <h3>Distinctions & Pitfalls</h3>
                <p>Common conflations and questions asked in architecture reviews.</p>
              </div>

              {/* Easy to Confuse With */}
              <div className="confused-section">
                <span className="confused-title">EASY TO CONFUSE WITH</span>
                {pattern.confusedWith.map(x => (
                  <div className="confused-card" key={x.targetPattern}>
                    <div className="confused-head">
                      <b>vs. {x.targetPattern}</b>
                      <span className="decision-pill">DECISION RULE</span>
                    </div>
                    <p className="confused-diff">{x.keyDifference}</p>
                    <div className="confused-rule">
                      <small>{x.decisionRule}</small>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interview Traps */}
              <div className="traps-section">
                <span className="traps-title">
                  <AlertTriangle size={14} /> INTERVIEW TRAPS & COMMON MISTAKES
                </span>
                <div className="traps-grid">
                  {pattern.interviewTraps.map(trap => (
                    <div className="trap-item" key={trap}>
                      <span className="trap-icon">!</span>
                      <p>{trap}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Pinned Bottom Navigation Dock (42px) */}
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
