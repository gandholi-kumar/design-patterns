import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Sparkles,
  Compass,
  Briefcase,
  ArrowLeftRight,
  BookOpen,
  Zap,
  BookmarkCheck,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Code2,
} from 'lucide-react';
import { PATTERNS } from '../data';
import type { Pattern } from '../pattern-types';
import { NotesDrawer } from '../components/NotesDrawer';
import { AIArchitectBar } from './decision/AIArchitectBar';
import { DiagnosticWizard } from './decision/DiagnosticWizard';
import { ScenarioMatcher } from './decision/ScenarioMatcher';
import { DisambiguationMatrix } from './decision/DisambiguationMatrix';
import { DecisionVerdictCard } from './decision/DecisionVerdictCard';
import { DecisionGuideCard } from './decision/DecisionGuideCard';
import { MobileVerdictBar } from './decision/MobileVerdictBar';
import { BYOKModal } from './decision/BYOKModal';
import type { GoFDecisionVerdict, AIProviderConfig } from './decision/ai-service';
import { AppTooltip } from '../components/ui/app-tooltip';
import { useSession } from '../lib/auth-client';
import { getDecisionLedger, type DecisionLedgerItem } from '@workspace/api-client-react';

interface DecisionEnginePageProps {
  onSelect: (pattern: Pattern) => void;
}

type MainModeKey = 'diagnostic' | 'versus' | 'scenarios';
type DiagnosticSubTab = 'ai' | 'wizard';
type DrawerTabKey = 'verdict' | 'guide' | 'ledger';

export function DecisionEnginePage({ onSelect }: DecisionEnginePageProps) {
  const [, setLoc] = useLocation();
  const { data: session } = useSession();

  // Helper to parse query parameters from the browser URL
  const parseUrlParams = () => {
    if (typeof window === 'undefined') {
      return {
        mode: 'diagnostic' as MainModeKey,
        diagSubTab: 'ai' as DiagnosticSubTab,
        vSubTab: 'curated' as 'curated' | 'custom',
        dilemma: '',
        pA: '',
        pB: '',
      };
    }
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    const mode: MainModeKey = m === 'versus' || m === 'scenarios' || m === 'diagnostic' ? m : 'diagnostic';
    const t = params.get('tab');
    const diagSubTab: DiagnosticSubTab = t === 'wizard' ? 'wizard' : 'ai';
    const vSubTab: 'curated' | 'custom' = t === 'custom' ? 'custom' : 'curated';
    const dilemma = params.get('dilemma') || '';
    const pA = params.get('pA') || '';
    const pB = params.get('pB') || '';
    return { mode, diagSubTab, vSubTab, dilemma, pA, pB };
  };

  const initialParams = parseUrlParams();
  const [activeMode, setActiveMode] = useState<MainModeKey>(initialParams.mode);
  const [diagnosticSubTab, setDiagnosticSubTab] = useState<DiagnosticSubTab>(initialParams.diagSubTab);
  const [versusSubTab, setVersusSubTab] = useState<'curated' | 'custom'>(initialParams.vSubTab);
  const [activeDilemmaId, setActiveDilemmaId] = useState<string>(initialParams.dilemma);
  const [patternAId, setPatternAId] = useState<string>(initialParams.pA);
  const [patternBId, setPatternBId] = useState<string>(initialParams.pB);

  const [verdict, setVerdict] = useState<GoFDecisionVerdict | null>(null);
  const [ledger, setLedger] = useState<GoFDecisionVerdict[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTabKey>('guide');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [copiedAllLedger, setCopiedAllLedger] = useState(false);

  // Sync state changes to browser URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeMode !== 'diagnostic') {
      params.set('mode', activeMode);
    }
    if (activeMode === 'diagnostic') {
      if (diagnosticSubTab !== 'ai') params.set('tab', diagnosticSubTab);
    } else if (activeMode === 'versus') {
      if (versusSubTab !== 'curated') params.set('tab', versusSubTab);
      if (versusSubTab === 'curated' && activeDilemmaId) params.set('dilemma', activeDilemmaId);
      if (versusSubTab === 'custom') {
        if (patternAId) params.set('pA', patternAId);
        if (patternBId) params.set('pB', patternBId);
      }
    }
    const searchString = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== searchString) {
      const newUrl = `${window.location.pathname}${searchString}${window.location.hash}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [activeMode, diagnosticSubTab, versusSubTab, activeDilemmaId, patternAId, patternBId]);

  // Listen to popstate (back/forward browser navigation)
  useEffect(() => {
    const handlePopState = () => {
      const p = parseUrlParams();
      setActiveMode(p.mode);
      setDiagnosticSubTab(p.diagSubTab);
      setVersusSubTab(p.vSubTab);
      setActiveDilemmaId(p.dilemma);
      setPatternAId(p.pA);
      setPatternBId(p.pB);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Default to Built-in Pro AI (managed) with fallback to BYOK
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>({
    provider: 'managed',
    apiKey: '',
  });

  // Switch drawer tab to Verdict mode without auto-opening drawer (non-intrusive flow)
  const handleVerdictGenerated = (v: GoFDecisionVerdict) => {
    setVerdict(v);
    setDrawerTab('verdict');
  };

  // Direct user inspection of a production scenario explicitly opens the side drawer
  const handleSelectScenarioVerdict = (v: GoFDecisionVerdict) => {
    setVerdict(v);
    setDrawerTab('verdict');
    setIsDrawerOpen(true);
  };

  const handleOpenDrawerVerdict = () => {
    setDrawerTab('verdict');
    setIsDrawerOpen(true);
  };

  // Add a verdict to the session ledger (in-memory RAM)
  const handleSaveToLedger = (v: GoFDecisionVerdict) => {
    setLedger((prev) => [
      v,
      ...prev.filter((item) => item.primaryPattern.id !== v.primaryPattern.id),
    ]);
  };

  const handleRemoveFromLedger = (id: string) => {
    setLedger((prev) => prev.filter((item) => item.primaryPattern.id !== id));
  };

  const handleCopyLedgerAsMarkdown = () => {
    if (ledger.length === 0) return;
    const md = ledger
      .map(
        (v, i) => `# ADR 00${i + 1}: Adopt ${v.primaryPattern.name} Pattern
**Category:** ${v.primaryPattern.category}
**Confidence:** ${v.primaryPattern.confidence}%
**Date:** ${new Date().toISOString().split('T')[0]}

## Status
Accepted

## Context & Rationale
${v.primaryPattern.architecturalRationale}

## Structural Applicability
${v.primaryPattern.structuralApplicability}

## Considered Alternative
- **Runner-Up:** ${v.runnerUpPattern.name} (${v.runnerUpPattern.confidence}%)
- **Why Considered:** ${v.runnerUpPattern.whyConsidered}
- **When to Choose Runner-Up:** ${v.runnerUpPattern.whenToChooseRunnerUpOverPrimary}

## Decisive Differentiator
${v.tradeOffDilemma.decisiveDifferentiator}

## Code Smell & Anti-Pattern Guardrail
${v.codeSmellWarning}
`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(md).then(() => {
      setCopiedAllLedger(true);
      setTimeout(() => setCopiedAllLedger(false), 2500);
    });
  };

  const handleSelectPatternById = (id: string) => {
    const p = PATTERNS.find((item: Pattern) => item.id === id);
    if (p) {
      setIsDrawerOpen(false);
      const currentQuery = window.location.search;
      const returnUrl = `/decision-engine${currentQuery}`;
      setLoc(`/pattern/${p.id}?from=${encodeURIComponent(returnUrl)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenPlayground = (id: string) => {
    window.location.href = `/playground?pattern=${id}`;
  };

  // Keyboard shortcuts: Ctrl+\ for Guide, Alt+D for Decision Ledger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setDrawerTab('ledger');
        setIsDrawerOpen((prev) => !prev);
      } else if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        setDrawerTab('guide');
        setIsDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cloud synchronization: Fetch persisted decision ledger from PostgreSQL for authenticated users
  useEffect(() => {
    if (!session?.user) return;
    getDecisionLedger()
      .then((entries: DecisionLedgerItem[]) => {
        if (Array.isArray(entries) && entries.length > 0) {
          const verdicts: GoFDecisionVerdict[] = entries.map((e) => {
            const primary = PATTERNS.find(
              (p: Pattern) => p.name.toLowerCase() === (e.primaryPattern || '').toLowerCase()
            );
            const runnerUp = PATTERNS.find(
              (p: Pattern) => p.name.toLowerCase() === (e.runnerUpPattern || '').toLowerCase()
            );
            return {
              primaryPattern: {
                id: primary?.id || (e.primaryPattern || 'pattern').toLowerCase().replace(/\s+/g, '-'),
                name: e.primaryPattern || 'Design Pattern',
                category: (primary?.category || 'Behavioral') as 'Creational' | 'Structural' | 'Behavioral',
                confidence: e.confidence || 85,
                architecturalRationale: e.problemStatement || 'Consulted from architectural session.',
                structuralApplicability: `Saved decision recorded on ${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'recent session'}.`,
              },
              runnerUpPattern: {
                id: runnerUp?.id || 'runner-up',
                name: e.runnerUpPattern || 'Alternative Pattern',
                category: (runnerUp?.category || 'Behavioral') as 'Creational' | 'Structural' | 'Behavioral',
                confidence: Math.max(50, (e.confidence || 85) - 15),
                whyConsidered: 'Considered during architectural tradeoff consultation.',
                whenToChooseRunnerUpOverPrimary: 'Choose runner-up when system constraints shift.',
              },
              tradeOffDilemma: {
                primaryGains: Array.isArray(e.tradeOffs) ? e.tradeOffs.slice(0, 3) : ['Modular decoupling', 'Open/closed extensibility'],
                primaryTaxes: Array.isArray(e.tradeOffs) ? e.tradeOffs.slice(3) : ['Indirection complexity'],
                decisiveDifferentiator: 'Primary pattern solves key architectural axis of change.',
              },
              codeSmellWarning: 'Ensure interface contracts remain lean and cohesive.',
            };
          });
          setLedger((prev) => {
            const existingIds = new Set(prev.map((v) => v.primaryPattern.id));
            const newFromCloud = verdicts.filter((v) => !existingIds.has(v.primaryPattern.id));
            return [...prev, ...newFromCloud];
          });
        }
      })
      .catch(() => {});
  }, [session?.user]);


  return (
    <div className="page-content reveal decision-engine-page">
      {/* 1. Header intro matching Playground & Pattern Library layout */}
      <section className="page-intro" aria-label="Decision Engine Header">
        <div className="intro-left">
          <span className="eyebrow">
            <i className="eyebrow-line" />
            02 / ARCHITECTURAL DECISION ENGINE
          </span>
          <h1>
            Find the pattern
            <br />
            <em>behind the forces.</em>
          </h1>
        </div>

        <div className="intro-right">
          <p>
            Start with what hurts. Diagnose architectural problems with the GoF 3-question decision tree or AI Copilot, disambiguate classic sibling dilemmas, and explore 16+ production enterprise implementations.
          </p>
        </div>

        <div className="intro-actions-cluster">
          {/* Quick Icon Tools with Tooltips */}
          <div className="intro-icon-group" role="toolbar" aria-label="Decision Engine Quick Actions">
            {verdict && (
              <AppTooltip
                content={`Latest Verdict: ${verdict.primaryPattern.name} (${verdict.primaryPattern.confidence}%) — View in side drawer`}
              >
                <button
                  type="button"
                  className="intro-icon-btn verdict-active"
                  onClick={() => {
                    setDrawerTab('verdict');
                    setIsDrawerOpen(true);
                  }}
                  aria-label={`Latest Verdict: ${verdict.primaryPattern.name}`}
                  data-testid="header-action-verdict"
                >
                  <Zap size={16} />
                  <span className="intro-btn-pulse-dot" />
                </button>
              </AppTooltip>
            )}

            <AppTooltip
              content={
                ledger.length > 0
                  ? `Decision Ledger (${ledger.length} recorded) — Alt+D`
                  : 'Open Decision Ledger (0 recorded) — Alt+D'
              }
              shortcut="Alt+D"
            >
              <button
                type="button"
                className={`intro-icon-btn ${ledger.length > 0 ? 'active' : ''}`}
                onClick={() => {
                  setDrawerTab('ledger');
                  setIsDrawerOpen(true);
                }}
                aria-label="Open Decision Ledger"
                data-testid="header-action-ledger"
              >
                <BookmarkCheck size={16} />
                {ledger.length > 0 && (
                  <span className="intro-icon-badge">{ledger.length}</span>
                )}
              </button>
            </AppTooltip>

            <AppTooltip content="Gang of Four Field Guide & Principles" shortcut="Ctrl+\">
              <button
                type="button"
                className="intro-icon-btn"
                onClick={() => {
                  setDrawerTab('guide');
                  setIsDrawerOpen(true);
                }}
                aria-label="Open Gang of Four Field Guide & Rules"
                data-testid="header-action-guide"
              >
                <BookOpen size={16} />
              </button>
            </AppTooltip>
          </div>

          <div className="intro-stamp" aria-hidden="true">
            <Compass size={17} />
            <span>
              DECISION
              <br />
              ENGINE
            </span>
          </div>
        </div>
      </section>

      {/* Primary Intent-Driven Navigation Tabs */}
      <nav className="decision-intent-nav" aria-label="Decision Engine Modes">
        <div className="decision-intent-track">
          <button
            type="button"
            className={`decision-intent-btn ${activeMode === 'diagnostic' ? 'active' : ''}`}
            onClick={() => setActiveMode('diagnostic')}
            data-testid="tab-problem-diagnostic"
          >
            <Compass size={18} />
            <div className="intent-label-group">
              <span className="intent-title">Problem Diagnostic</span>
              <span className="intent-desc">AI Copilot & GoF Redesign Tree</span>
            </div>
          </button>

          <button
            type="button"
            className={`decision-intent-btn ${activeMode === 'versus' ? 'active' : ''}`}
            onClick={() => setActiveMode('versus')}
            data-testid="tab-versus-dilemmas"
          >
            <ArrowLeftRight size={18} />
            <div className="intent-label-group">
              <span className="intent-title">Versus Dilemmas</span>
              <span className="intent-desc">Disambiguate Similar Patterns</span>
            </div>
          </button>

          <button
            type="button"
            className={`decision-intent-btn ${activeMode === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveMode('scenarios')}
            data-testid="tab-production-scenarios"
          >
            <Briefcase size={18} />
            <div className="intent-label-group">
              <span className="intent-title">Production Scenarios</span>
              <span className="intent-desc">16+ Enterprise Reference Cases</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Full-Width Workspace Layout */}
      <main className="decision-workspace-layout">
        {/* Mode 1: Problem Diagnostic */}
        {activeMode === 'diagnostic' && (
          <section className="diagnostic-view-wrapper">
            {/* High-Contrast Segmented Switcher */}
            <div className="diagnostic-subnav-bar">
              <div
                className="segmented-diagnostic-control"
                role="tablist"
                aria-label="Diagnostic Engine Mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={diagnosticSubTab === 'ai'}
                  className={`segmented-tab-btn ${diagnosticSubTab === 'ai' ? 'active' : ''}`}
                  onClick={() => setDiagnosticSubTab('ai')}
                >
                  <Sparkles size={16} className="tab-icon" />
                  <div className="tab-meta">
                    <span className="tab-primary-title">AI Architect Copilot</span>
                    <span className="tab-sub-hint">Interactive Requirements & Debate</span>
                  </div>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={diagnosticSubTab === 'wizard'}
                  className={`segmented-tab-btn ${diagnosticSubTab === 'wizard' ? 'active' : ''}`}
                  onClick={() => setDiagnosticSubTab('wizard')}
                >
                  <Compass size={16} className="tab-icon" />
                  <div className="tab-meta">
                    <span className="tab-primary-title">GoF Causes of Redesign</span>
                    <span className="tab-sub-hint">Deterministic 3-Step Decision Tree</span>
                  </div>
                </button>
              </div>

              <span className="diagnostic-subnav-hint">
                {diagnosticSubTab === 'ai'
                  ? 'Type your architectural requirements or select prompt chips for AI analysis.'
                  : 'Follow the 3-step decision flow mapped to the original GoF book Chapter 1.7.'}
              </span>
            </div>

            {/* Diagnostic Content */}
            {diagnosticSubTab === 'ai' ? (
              <AIArchitectBar
                config={aiConfig}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
                onVerdictGenerated={handleVerdictGenerated}
                onSaveToLedger={handleSaveToLedger}
                onOpenDrawerVerdict={handleOpenDrawerVerdict}
              />
            ) : (
              <DiagnosticWizard
                onVerdictGenerated={handleVerdictGenerated}
                onSaveToLedger={handleSaveToLedger}
                onOpenDrawerVerdict={handleOpenDrawerVerdict}
              />
            )}
          </section>
        )}

        {/* Mode 2: Versus Dilemmas Matrix */}
        {activeMode === 'versus' && (
          <section className="versus-view-wrapper">
            <DisambiguationMatrix
              initialSubTab={versusSubTab}
              initialDilemmaId={activeDilemmaId}
              initialPatternAId={patternAId}
              initialPatternBId={patternBId}
              onStateChange={(state) => {
                setVersusSubTab(state.subTab);
                setActiveDilemmaId(state.dilemmaId);
                setPatternAId(state.patternAId);
                setPatternBId(state.patternBId);
              }}
              onPublishVerdict={handleVerdictGenerated}
              onSaveToLedger={handleSaveToLedger}
            />
          </section>
        )}

        {/* Mode 3: Production Scenarios Catalog */}
        {activeMode === 'scenarios' && (
          <section className="scenarios-view-wrapper">
            <ScenarioMatcher onSelectScenarioVerdict={handleSelectScenarioVerdict} />
          </section>
        )}
      </main>

      {/* Slide-Over Overlay NotesDrawer */}
      <NotesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        eyebrow={
          drawerTab === 'verdict' && verdict
            ? 'ARCHITECTURAL DECISION RECORD'
            : drawerTab === 'ledger'
            ? 'SESSION DECISION LEDGER'
            : 'FIELD GUIDE & HEURISTICS'
        }
        title={
          drawerTab === 'verdict' && verdict ? (
            <span className="drawer-title-flex">
              {verdict.primaryPattern.name}
              <span className="drawer-confidence-badge">
                <Zap size={12} /> {verdict.primaryPattern.confidence}% MATCH
              </span>
            </span>
          ) : drawerTab === 'ledger' ? (
            <span className="drawer-title-flex">
              Session Decision Ledger
              <span className="drawer-confidence-badge">
                <BookmarkCheck size={12} /> {ledger.length} RECORDED
              </span>
            </span>
          ) : (
            'How to Select a GoF Pattern'
          )
        }
        subtitle={
          drawerTab === 'verdict' && verdict
            ? `Recommended ${verdict.primaryPattern.category} pattern for your architectural requirements.`
            : drawerTab === 'ledger'
            ? 'Architectural choices accumulated during this browser session.'
            : 'Canonical heuristics from Gang of Four Chapter 1.7.'
        }
        headerActions={
          <div className="drawer-segmented-toggle">
            {verdict && (
              <AppTooltip content="Active Verdict ADR">
                <button
                  type="button"
                  className={`drawer-icon-btn ${drawerTab === 'verdict' ? 'active' : ''}`}
                  onClick={() => setDrawerTab('verdict')}
                  aria-label="Active Verdict"
                >
                  <Zap size={14} />
                </button>
              </AppTooltip>
            )}
            <AppTooltip content={`Session Decision Ledger (${ledger.length} recorded)`}>
              <button
                type="button"
                className={`drawer-icon-btn ${drawerTab === 'ledger' ? 'active' : ''}`}
                onClick={() => setDrawerTab('ledger')}
                aria-label="Decision Ledger"
              >
                <BookmarkCheck size={14} />
                {ledger.length > 0 && <span className="drawer-badge">{ledger.length}</span>}
              </button>
            </AppTooltip>
            <AppTooltip content="Gang of Four Field Guide & Rules">
              <button
                type="button"
                className={`drawer-icon-btn ${drawerTab === 'guide' ? 'active' : ''}`}
                onClick={() => setDrawerTab('guide')}
                aria-label="Field Guide"
              >
                <BookOpen size={14} />
              </button>
            </AppTooltip>
          </div>
        }
        width="38rem"
      >
        {drawerTab === 'verdict' && verdict ? (
          <DecisionVerdictCard
            verdict={verdict}
            onSelectPattern={handleSelectPatternById}
            onOpenPlayground={handleOpenPlayground}
            hideHeader={true}
          />
        ) : drawerTab === 'ledger' ? (
          <div className="ledger-drawer-view">
            <div className="ledger-drawer-topbar">
              <p className="ledger-drawer-intro">
                Decisions saved from AI Copilot, Diagnostic Wizard, or Versus Dilemmas during this
                session.
              </p>
              {ledger.length > 0 && (
                <button
                  type="button"
                  className="copy-ledger-md-btn"
                  onClick={handleCopyLedgerAsMarkdown}
                >
                  {copiedAllLedger ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedAllLedger ? 'Copied ADRs!' : 'Copy All as ADR Markdown'}</span>
                </button>
              )}
            </div>

            {ledger.length === 0 ? (
              <div className="ledger-empty-state">
                <BookmarkCheck size={36} className="text-zinc-600 mb-2" />
                <h4>No Decisions Recorded Yet</h4>
                <p>
                  Click "Record to Decision Ledger" on any verdict in AI Copilot, Diagnostic Wizard,
                  or Versus Dilemmas to collect architectural decisions here.
                </p>
              </div>
            ) : (
              <div className="ledger-cards-stack">
                {ledger.map((item, idx) => (
                  <div key={item.primaryPattern.id} className="ledger-card-item">
                    <div className="ledger-card-header">
                      <div className="flex items-center gap-2">
                        <span className="ledger-item-index">0{idx + 1}</span>
                        <h5>{item.primaryPattern.name}</h5>
                        <span className="ledger-item-category">
                          {item.primaryPattern.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="ledger-confidence-pill">
                          {item.primaryPattern.confidence}% Match
                        </span>
                        <AppTooltip content="Remove from session ledger">
                          <button
                            type="button"
                            className="ledger-trash-btn"
                            onClick={() => handleRemoveFromLedger(item.primaryPattern.id)}
                            aria-label="Remove from session ledger"
                          >
                            <Trash2 size={13} />
                          </button>
                        </AppTooltip>
                      </div>
                    </div>

                    <p className="ledger-card-rationale">
                      {item.primaryPattern.architecturalRationale}
                    </p>

                    <div className="ledger-card-meta">
                      <span>
                        <b>Runner-Up:</b> {item.runnerUpPattern.name} (
                        {item.runnerUpPattern.confidence}%)
                      </span>
                    </div>

                    <div className="ledger-card-actions">
                      <AppTooltip content="Open interactive blueprint in a new browser tab">
                        <a
                          href={`/playground?pattern=${item.primaryPattern.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="blueprint-link-btn"
                        >
                          <Code2 size={13} />
                          <span>Open Blueprint ↗</span>
                          <ExternalLink size={11} />
                        </a>
                      </AppTooltip>
                      <button
                        type="button"
                        className="set-active-verdict-btn"
                        onClick={() => {
                          setVerdict(item);
                          setDrawerTab('verdict');
                        }}
                      >
                        <Zap size={12} /> Set as Active Verdict
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <DecisionGuideCard
            hasVerdict={Boolean(verdict)}
            onSwitchToVerdict={() => setDrawerTab('verdict')}
            hideHeader={true}
          />
        )}
      </NotesDrawer>

      {/* Mobile Sticky Bottom Summary Bar (Hidden on Desktop via CSS) */}
      <MobileVerdictBar
        verdict={verdict}
        onOpenSheet={() => {
          setDrawerTab('verdict');
          setIsDrawerOpen(true);
        }}
      />

      {/* Zero-Trust BYOK Security Modal */}
      <BYOKModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        config={aiConfig}
        onSaveConfig={(cfg) => setAiConfig(cfg)}
        onPurgeConfig={() => setAiConfig({ provider: 'gemini', apiKey: '' })}
      />
    </div>
  );
}
