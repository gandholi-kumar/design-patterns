import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeftRight,
  Check,
  Code,
  Zap,
  Scale,
  FlaskConical,
  ExternalLink,
  BookmarkCheck,
  BookOpen,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { PATTERNS } from '../../data';
import {
  SIBLING_DILEMMAS,
  GOF_PATTERN_ASPECTS,
  classifyGoFRelationship,
} from './decision-data';
import type { GoFDecisionVerdict } from './ai-service';
import { AppTooltip } from '../../components/ui/app-tooltip';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { cn } from '../../lib/utils';

export type VersusSubTab = 'curated' | 'custom';

interface DisambiguationMatrixProps {
  onPublishVerdict: (v: GoFDecisionVerdict) => void;
  onSaveToLedger?: (v: GoFDecisionVerdict) => void;
  initialSubTab?: VersusSubTab;
  initialDilemmaId?: string;
  initialPatternAId?: string;
  initialPatternBId?: string;
  onStateChange?: (state: {
    subTab: VersusSubTab;
    dilemmaId: string;
    patternAId: string;
    patternBId: string;
  }) => void;
}

type CategoryFilter = 'All' | 'Behavioral' | 'Structural' | 'Creational';

export function DisambiguationMatrix({
  onPublishVerdict,
  onSaveToLedger,
  initialSubTab = 'curated',
  initialDilemmaId = 'strategy-vs-state',
  initialPatternAId = 'strategy',
  initialPatternBId = 'state',
  onStateChange,
}: DisambiguationMatrixProps) {
  // Top-level switcher: 7 Curated GoF Dilemmas vs. Custom 2-Pattern Comparator
  const [versusSubTab, setVersusSubTab] = useState<VersusSubTab>(initialSubTab);

  // Curated state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [activeDilemmaId, setActiveDilemmaId] = useState<string>(initialDilemmaId);
  const [selectedSide, setSelectedSide] = useState<'A' | 'B'>('A');

  // Custom 2-Pattern Comparator state
  const [patternAId, setPatternAId] = useState<string>(initialPatternAId || 'strategy');
  const [patternBId, setPatternBId] = useState<string>(initialPatternBId || 'state');

  useEffect(() => {
    if (initialPatternAId) setPatternAId(initialPatternAId);
  }, [initialPatternAId]);

  useEffect(() => {
    if (initialPatternBId) setPatternBId(initialPatternBId);
  }, [initialPatternBId]);

  const patternA = useMemo(() => PATTERNS.find((p) => p.id === patternAId), [patternAId]);
  const patternB = useMemo(() => PATTERNS.find((p) => p.id === patternBId), [patternBId]);

  // Notify parent of state changes to synchronize URL search parameters
  useEffect(() => {
    onStateChange?.({
      subTab: versusSubTab,
      dilemmaId: activeDilemmaId,
      patternAId,
      patternBId,
    });
  }, [versusSubTab, activeDilemmaId, patternAId, patternBId, onStateChange]);

  // Feedback notifications
  const [recordedNotice, setRecordedNotice] = useState<string | null>(null);

  // Filter curated dilemmas
  const filteredDilemmas = useMemo(() => {
    if (categoryFilter === 'All') return SIBLING_DILEMMAS;
    return SIBLING_DILEMMAS.filter((d) => d.category === categoryFilter);
  }, [categoryFilter]);

  // Active curated dilemma
  const dilemma = useMemo(() => {
    const found = filteredDilemmas.find((d) => d.id === activeDilemmaId);
    return found || filteredDilemmas[0] || SIBLING_DILEMMAS[0];
  }, [filteredDilemmas, activeDilemmaId]);

  // Automated GoF relationship analysis for Custom Comparator
  const customRelationship = useMemo(() => {
    return classifyGoFRelationship(patternAId, patternBId);
  }, [patternAId, patternBId]);

  const metaA = GOF_PATTERN_ASPECTS[patternAId] || {
    id: patternAId,
    name: patternAId,
    category: 'Behavioral' as const,
    aspectThatVaries: 'General variation',
    intent: 'Encapsulates architectural responsibility.',
    antiPatternWarning: 'Avoid premature complexity.',
    commonCollaborators: [],
    commonCompetitors: [],
  };

  const metaB = GOF_PATTERN_ASPECTS[patternBId] || {
    id: patternBId,
    name: patternBId,
    category: 'Behavioral' as const,
    aspectThatVaries: 'General variation',
    intent: 'Encapsulates architectural responsibility.',
    antiPatternWarning: 'Avoid premature complexity.',
    commonCollaborators: [],
    commonCompetitors: [],
  };

  // Publish / Record Curated Verdict
  const handlePublishCurated = (side: 'A' | 'B') => {
    setSelectedSide(side);
    const chosen = side === 'A' ? dilemma.patternA : dilemma.patternB;
    const other = side === 'A' ? dilemma.patternB : dilemma.patternA;

    const chosenMeta = GOF_PATTERN_ASPECTS[chosen.id];
    const otherMeta = GOF_PATTERN_ASPECTS[other.id];

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: chosen.id,
        name: chosen.name,
        category: chosenMeta?.category ?? dilemma.category,
        confidence: 94,
        architecturalRationale: chosen.intent,
        structuralApplicability: chosen.structure,
      },
      runnerUpPattern: {
        id: other.id,
        name: other.name,
        category: otherMeta?.category ?? dilemma.category,
        confidence: 82,
        whyConsidered: other.intent,
        whenToChooseRunnerUpOverPrimary:
          side === 'A' ? dilemma.whenToPickB.join(' ') : dilemma.whenToPickA.join(' '),
      },
      tradeOffDilemma: {
        primaryGains: side === 'A' ? dilemma.whenToPickA : dilemma.whenToPickB,
        primaryTaxes: ['Must be consciously chosen over its structural sibling'],
        decisiveDifferentiator: dilemma.decisiveRule,
      },
      codeSmellWarning: `Beware conflating ${chosen.name} with ${other.name}. Decisive pivot: ${dilemma.decisiveRule}`,
    };

    onPublishVerdict(verdict);
  };

  const handleSaveCuratedToLedger = (side: 'A' | 'B') => {
    setSelectedSide(side);
    const chosen = side === 'A' ? dilemma.patternA : dilemma.patternB;
    const other = side === 'A' ? dilemma.patternB : dilemma.patternA;
    const chosenMeta = GOF_PATTERN_ASPECTS[chosen.id];
    const otherMeta = GOF_PATTERN_ASPECTS[other.id];

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: chosen.id,
        name: chosen.name,
        category: chosenMeta?.category ?? dilemma.category,
        confidence: 94,
        architecturalRationale: chosen.intent,
        structuralApplicability: chosen.structure,
      },
      runnerUpPattern: {
        id: other.id,
        name: other.name,
        category: otherMeta?.category ?? dilemma.category,
        confidence: 82,
        whyConsidered: other.intent,
        whenToChooseRunnerUpOverPrimary:
          side === 'A' ? dilemma.whenToPickB.join(' ') : dilemma.whenToPickA.join(' '),
      },
      tradeOffDilemma: {
        primaryGains: side === 'A' ? dilemma.whenToPickA : dilemma.whenToPickB,
        primaryTaxes: ['Must be consciously chosen over its structural sibling'],
        decisiveDifferentiator: dilemma.decisiveRule,
      },
      codeSmellWarning: `Beware conflating ${chosen.name} with ${other.name}. Decisive pivot: ${dilemma.decisiveRule}`,
    };

    if (onSaveToLedger) {
      onSaveToLedger(verdict);
      setRecordedNotice(`Recorded ${chosen.name} to Decision Ledger!`);
      setTimeout(() => setRecordedNotice(null), 3000);
    }
  };

  // Publish / Record Custom Verdict
  const handlePublishCustomVerdict = (side: 'A' | 'B') => {
    const chosenMeta = side === 'A' ? metaA : metaB;
    const otherMeta = side === 'A' ? metaB : metaA;

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: chosenMeta.id,
        name: chosenMeta.name,
        category: chosenMeta.category,
        confidence: 91,
        architecturalRationale: chosenMeta.intent,
        structuralApplicability: `Varies: ${chosenMeta.aspectThatVaries}`,
      },
      runnerUpPattern: {
        id: otherMeta.id,
        name: otherMeta.name,
        category: otherMeta.category,
        confidence: 76,
        whyConsidered: otherMeta.intent,
        whenToChooseRunnerUpOverPrimary: `Varies: ${otherMeta.aspectThatVaries}`,
      },
      tradeOffDilemma: {
        primaryGains: [`Encapsulates ${chosenMeta.aspectThatVaries}`],
        primaryTaxes: [chosenMeta.antiPatternWarning],
        decisiveDifferentiator:
          customRelationship.decisiveRule ??
          `Relationship: ${customRelationship.headline}`,
      },
      codeSmellWarning: chosenMeta.antiPatternWarning,
    };

    onPublishVerdict(verdict);
  };

  const handleSaveCustomToLedger = (side: 'A' | 'B') => {
    const chosenMeta = side === 'A' ? metaA : metaB;
    const otherMeta = side === 'A' ? metaB : metaA;

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: chosenMeta.id,
        name: chosenMeta.name,
        category: chosenMeta.category,
        confidence: 91,
        architecturalRationale: chosenMeta.intent,
        structuralApplicability: `Varies: ${chosenMeta.aspectThatVaries}`,
      },
      runnerUpPattern: {
        id: otherMeta.id,
        name: otherMeta.name,
        category: otherMeta.category,
        confidence: 76,
        whyConsidered: otherMeta.intent,
        whenToChooseRunnerUpOverPrimary: `Varies: ${otherMeta.aspectThatVaries}`,
      },
      tradeOffDilemma: {
        primaryGains: [`Encapsulates ${chosenMeta.aspectThatVaries}`],
        primaryTaxes: [chosenMeta.antiPatternWarning],
        decisiveDifferentiator:
          customRelationship.decisiveRule ??
          `Relationship: ${customRelationship.headline}`,
      },
      codeSmellWarning: chosenMeta.antiPatternWarning,
    };

    if (onSaveToLedger) {
      onSaveToLedger(verdict);
      setRecordedNotice(`Recorded ${chosenMeta.name} to Decision Ledger!`);
      setTimeout(() => setRecordedNotice(null), 3000);
    }
  };

  return (
    <div className="versus-matrix-container">
      {/* Sub-Tab Header Switcher */}
      <div className="versus-mode-switcher-bar">
        <div className="versus-mode-pills" role="tablist" aria-label="Versus Engine Mode">
          <button
            type="button"
            role="tab"
            aria-selected={versusSubTab === 'curated'}
            className={`versus-mode-btn ${versusSubTab === 'curated' ? 'active' : ''}`}
            onClick={() => setVersusSubTab('curated')}
          >
            <Scale size={15} />
            <span>⚖️ 7 Curated GoF Dilemmas</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={versusSubTab === 'custom'}
            className={`versus-mode-btn ${versusSubTab === 'custom' ? 'active' : ''}`}
            onClick={() => setVersusSubTab('custom')}
          >
            <FlaskConical size={15} />
            <span>🔬 Custom 2-Pattern Comparator</span>
          </button>
        </div>

        {recordedNotice && (
          <span className="versus-save-toast">
            <BookmarkCheck size={14} /> {recordedNotice}
          </span>
        )}
      </div>

      {/* VIEW 1: CURATED GOF DILEMMAS */}
      {versusSubTab === 'curated' && (
        <>
          {/* Option B: Single-Row Category Filter + Dilemma Scroll Ribbon (~42px high) */}
          <div className="single-row-dilemma-ribbon">
            <div className="ribbon-filter-group" aria-label="Filter Dilemmas by Category">
              <span className="ribbon-filter-label">CATEGORY:</span>
              {(['All', 'Behavioral', 'Structural', 'Creational'] as const).map((cat) => {
                const count =
                  cat === 'All'
                    ? SIBLING_DILEMMAS.length
                    : SIBLING_DILEMMAS.filter((d) => d.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`ribbon-filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => {
                      setCategoryFilter(cat);
                      const targetList =
                        cat === 'All'
                          ? SIBLING_DILEMMAS
                          : SIBLING_DILEMMAS.filter((d) => d.category === cat);
                      if (targetList.length > 0) {
                        setActiveDilemmaId(targetList[0].id);
                      }
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="ribbon-v-divider" />

            <div className="ribbon-dilemma-track" role="tablist">
              {filteredDilemmas.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  className={`dilemma-tab-btn ${activeDilemmaId === d.id ? 'active' : ''}`}
                  onClick={() => setActiveDilemmaId(d.id)}
                >
                  <ArrowLeftRight size={13} />
                  <span>{d.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Dilemma Header */}
          <div className="versus-header-banner">
            <div className="versus-title-row">
              <div className="title-with-badge">
                <span className="dilemma-category-badge">{dilemma.category}</span>
                <h3>{dilemma.title}</h3>
              </div>
              <span className="versus-subhead">{dilemma.subtitle}</span>
            </div>
            <div className="decisive-pivot-banner">
              <span className="pivot-badge">DECISIVE PIVOT RULE</span>
              <p>{dilemma.decisiveRule}</p>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid (100% Full-Width) */}
          <div className="versus-dual-grid">
            {/* Pattern A Column */}
            <div className={`versus-col ${selectedSide === 'A' ? 'chosen-col' : ''}`}>
              <div className="col-top-banner">
                <div className="col-title-group">
                  <span className="col-label">CANDIDATE 01</span>
                  <h4>{dilemma.patternA.name}</h4>
                </div>
                <div className="col-action-btns">
                  <AppTooltip content={`Open interactive Code Playground for ${dilemma.patternA.name} (runs in new tab)`}>
                    <a
                      href={`/playground?pattern=${dilemma.patternA.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-icon-btn playground-btn"
                      aria-label={`Open Code Playground for ${dilemma.patternA.name}`}
                    >
                      <Code2 size={15} />
                    </a>
                  </AppTooltip>
                  <AppTooltip content={`Adopt ${dilemma.patternA.name} as active session verdict`}>
                    <button
                      type="button"
                      className="col-icon-btn pick-verdict-btn"
                      onClick={() => handlePublishCurated('A')}
                      aria-label={`Adopt ${dilemma.patternA.name} as verdict`}
                    >
                      <Zap size={15} />
                    </button>
                  </AppTooltip>
                  {onSaveToLedger && (
                    <AppTooltip content={`Save ${dilemma.patternA.name} decision to session ledger`}>
                      <button
                        type="button"
                        className="col-icon-btn ledger-btn"
                        onClick={() => handleSaveCuratedToLedger('A')}
                        aria-label={`Save ${dilemma.patternA.name} to ledger`}
                      >
                        <BookmarkCheck size={15} />
                      </button>
                    </AppTooltip>
                  )}
                </div>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">ARCHITECTURAL INTENT</span>
                <p>{dilemma.patternA.intent}</p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">COLLABORATION STRUCTURE</span>
                <p>{dilemma.patternA.structure}</p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">SWAPPABILITY & LIFECYCLE</span>
                <p>{dilemma.patternA.swappability}</p>
              </div>

              <div className="versus-checklist-card">
                <span className="metric-label">CHOOSE THIS PATTERN WHEN:</span>
                <ul>
                  {dilemma.whenToPickA.map((item, i) => (
                    <li key={i}>
                      <Check size={14} /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="versus-code-snippet">
                <div className="snippet-head">
                  <Code size={13} />
                  <span>CODE SHAPE · {dilemma.patternA.name.toUpperCase()}</span>
                </div>
                <pre>
                  <code>{dilemma.patternA.codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Pattern B Column */}
            <div className={`versus-col ${selectedSide === 'B' ? 'chosen-col' : ''}`}>
              <div className="col-top-banner">
                <div className="col-title-group">
                  <span className="col-label">CANDIDATE 02</span>
                  <h4>{dilemma.patternB.name}</h4>
                </div>
                <div className="col-action-btns">
                  <AppTooltip content={`Open interactive Code Playground for ${dilemma.patternB.name} (runs in new tab)`}>
                    <a
                      href={`/playground?pattern=${dilemma.patternB.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-icon-btn playground-btn"
                      aria-label={`Open Code Playground for ${dilemma.patternB.name}`}
                    >
                      <Code2 size={15} />
                    </a>
                  </AppTooltip>
                  <AppTooltip content={`Adopt ${dilemma.patternB.name} as active session verdict`}>
                    <button
                      type="button"
                      className="col-icon-btn pick-verdict-btn"
                      onClick={() => handlePublishCurated('B')}
                      aria-label={`Adopt ${dilemma.patternB.name} as verdict`}
                    >
                      <Zap size={15} />
                    </button>
                  </AppTooltip>
                  {onSaveToLedger && (
                    <AppTooltip content={`Save ${dilemma.patternB.name} decision to session ledger`}>
                      <button
                        type="button"
                        className="col-icon-btn ledger-btn"
                        onClick={() => handleSaveCuratedToLedger('B')}
                        aria-label={`Save ${dilemma.patternB.name} to ledger`}
                      >
                        <BookmarkCheck size={15} />
                      </button>
                    </AppTooltip>
                  )}
                </div>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">ARCHITECTURAL INTENT</span>
                <p>{dilemma.patternB.intent}</p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">COLLABORATION STRUCTURE</span>
                <p>{dilemma.patternB.structure}</p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">SWAPPABILITY & LIFECYCLE</span>
                <p>{dilemma.patternB.swappability}</p>
              </div>

              <div className="versus-checklist-card">
                <span className="metric-label">CHOOSE THIS PATTERN WHEN:</span>
                <ul>
                  {dilemma.whenToPickB.map((item, i) => (
                    <li key={i}>
                      <Check size={14} /> <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="versus-code-snippet">
                <div className="snippet-head">
                  <Code size={13} />
                  <span>CODE SHAPE · {dilemma.patternB.name.toUpperCase()}</span>
                </div>
                <pre>
                  <code>{dilemma.patternB.codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: CUSTOM 2-PATTERN COMPARATOR */}
      {versusSubTab === 'custom' && (
        <div className="custom-comparator-lab">
          {/* Dropdown Selectors */}
          <div className="custom-selectors-bar">
            <div className="selector-group">
              <label htmlFor="custom-pattern-a" id="label-candidate-a">CANDIDATE 01:</label>
              <Select value={patternAId} onValueChange={(val) => val && setPatternAId(val)}>
                <SelectTrigger
                  id="custom-pattern-a"
                  aria-labelledby="label-candidate-a"
                  data-testid="custom-pattern-a"
                  className="h-11 w-full rounded-md border-border bg-card px-3.5 text-sm font-semibold text-foreground shadow-2xs hover:bg-muted/40 focus:ring-1 focus:ring-accent"
                >
                  <SelectValue placeholder="Select candidate 01">
                    {patternA ? `${patternA.name} (${patternA.category})` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80 w-[var(--radix-select-trigger-width)] min-w-[16rem]">
                  {(['Creational', 'Structural', 'Behavioral'] as const).map((cat, idx) => (
                    <SelectGroup key={cat}>
                      {idx > 0 && <SelectSeparator className="my-1" />}
                      <SelectLabel
                        className={cn(
                          'text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1.5',
                          cat === 'Creational' && 'text-amber-500',
                          cat === 'Structural' && 'text-blue-500',
                          cat === 'Behavioral' && 'text-emerald-500',
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            cat === 'Creational' && 'bg-amber-500',
                            cat === 'Structural' && 'bg-blue-500',
                            cat === 'Behavioral' && 'bg-emerald-500',
                          )}
                        />
                        {cat} Patterns
                      </SelectLabel>
                      {PATTERNS.filter((p) => p.category === cat).map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="cursor-pointer py-2 px-2.5 text-sm rounded-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="font-medium text-foreground">{p.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">({cat})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="comparator-vs-badge">
              <span>VS</span>
            </div>

            <div className="selector-group">
              <label htmlFor="custom-pattern-b" id="label-candidate-b">CANDIDATE 02:</label>
              <Select value={patternBId} onValueChange={(val) => val && setPatternBId(val)}>
                <SelectTrigger
                  id="custom-pattern-b"
                  aria-labelledby="label-candidate-b"
                  data-testid="custom-pattern-b"
                  className="h-11 w-full rounded-md border-border bg-card px-3.5 text-sm font-semibold text-foreground shadow-2xs hover:bg-muted/40 focus:ring-1 focus:ring-accent"
                >
                  <SelectValue placeholder="Select candidate 02">
                    {patternB ? `${patternB.name} (${patternB.category})` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80 w-[var(--radix-select-trigger-width)] min-w-[16rem]">
                  {(['Creational', 'Structural', 'Behavioral'] as const).map((cat, idx) => (
                    <SelectGroup key={cat}>
                      {idx > 0 && <SelectSeparator className="my-1" />}
                      <SelectLabel
                        className={cn(
                          'text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 flex items-center gap-1.5',
                          cat === 'Creational' && 'text-amber-500',
                          cat === 'Structural' && 'text-blue-500',
                          cat === 'Behavioral' && 'text-emerald-500',
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            cat === 'Creational' && 'bg-amber-500',
                            cat === 'Structural' && 'bg-blue-500',
                            cat === 'Behavioral' && 'bg-emerald-500',
                          )}
                        />
                        {cat} Patterns
                      </SelectLabel>
                      {PATTERNS.filter((p) => p.category === cat).map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="cursor-pointer py-2 px-2.5 text-sm rounded-sm focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="font-medium text-foreground">{p.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">({cat})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Relationship Classifier Banner */}
          <div className={`relationship-verdict-banner tone-${customRelationship.badgeTone}`}>
            <div className="rel-header-row">
              <span className={`rel-badge tone-${customRelationship.badgeTone}`}>
                {customRelationship.badgeText}
              </span>
              <h4>{customRelationship.headline}</h4>
            </div>

            <p className="rel-summary">{customRelationship.summary}</p>

            {customRelationship.decisiveRule && (
              <div className="rel-decisive-box">
                <span className="decisive-tag">🎯 DECISIVE PIVOT RULE:</span>
                <p>{customRelationship.decisiveRule}</p>
              </div>
            )}

            {customRelationship.collaborationWorkflow && (
              <div className="rel-workflow-box">
                <span className="workflow-tag">🤝 HOW THEY COLLABORATE IN REAL SYSTEMS:</span>
                <ol>
                  {customRelationship.collaborationWorkflow.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {customRelationship.whyNotDirectCompetitors && (
              <div className="rel-orthogonal-box">
                <span className="orthogonal-tag">💡 ARCHITECTURAL REALITY & CAUTION:</span>
                <p>{customRelationship.whyNotDirectCompetitors}</p>
              </div>
            )}

            <div className="rel-citation-row">
              <BookOpen size={13} />
              <span>
                <b>Literature Reference:</b> {customRelationship.literatureReference.citation} —{' '}
                {customRelationship.literatureReference.detail}
              </span>
              <AppTooltip content="Read architectural discussion on Martin Fowler Architecture Guide (runs in new tab)">
                <a
                  href="https://martinfowler.com/architecture/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fowler-ref-link"
                >
                  <span>Fowler Architecture Reference ↗</span>
                </a>
              </AppTooltip>
            </div>
          </div>

          {/* Dual Candidate Inspection Grid */}
          <div className="versus-dual-grid">
            {/* Candidate A Card */}
            <div className="versus-col">
              <div className="col-top-banner">
                <div className="col-title-group">
                  <div className="flex items-center gap-2">
                    <span className="col-label">CANDIDATE 01</span>
                    <span className="dilemma-category-badge">{metaA.category}</span>
                  </div>
                  <h4>{metaA.name}</h4>
                </div>
                <div className="col-action-btns">
                  <AppTooltip content={`Open interactive Code Playground for ${metaA.name} (runs in new tab)`}>
                    <a
                      href={`/playground?pattern=${metaA.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-icon-btn playground-btn"
                      aria-label={`Open Code Playground for ${metaA.name}`}
                    >
                      <Code2 size={15} />
                    </a>
                  </AppTooltip>
                  <AppTooltip content={`Adopt ${metaA.name} as active session verdict`}>
                    <button
                      type="button"
                      className="col-icon-btn pick-verdict-btn"
                      onClick={() => handlePublishCustomVerdict('A')}
                      aria-label={`Adopt ${metaA.name} as verdict`}
                    >
                      <Zap size={15} />
                    </button>
                  </AppTooltip>
                  {onSaveToLedger && (
                    <AppTooltip content={`Save ${metaA.name} decision to session ledger`}>
                      <button
                        type="button"
                        className="col-icon-btn ledger-btn"
                        onClick={() => handleSaveCustomToLedger('A')}
                        aria-label={`Save ${metaA.name} to ledger`}
                      >
                        <BookmarkCheck size={15} />
                      </button>
                    </AppTooltip>
                  )}
                </div>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">AXIS OF CHANGE (GOF TABLE 1.2)</span>
                <p>
                  <b>{metaA.aspectThatVaries}</b>
                </p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">ARCHITECTURAL INTENT</span>
                <p>{metaA.intent}</p>
              </div>

              <div className="versus-metric-card anti-pattern-card">
                <span className="metric-label flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                  <AlertTriangle size={13} /> ANTI-PATTERN WARNING TO AVOID
                </span>
                <p>{metaA.antiPatternWarning}</p>
              </div>

              <div className="versus-citation-card">
                <span className="metric-label">AUTHORITATIVE REFERENCES & BLUEPRINTS</span>
                <div className="citation-links-list">
                  <a
                    href={`https://refactoring.guru/design-patterns/${metaA.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-ext-link"
                    title={`Open Refactoring Guru catalog guide for ${metaA.name}`}
                  >
                    <BookOpen size={13} />
                    <span>Refactoring Guru: {metaA.name}</span>
                    <ExternalLink size={11} />
                  </a>
                  <a
                    href={`/pattern/${metaA.id}?from=${encodeURIComponent('/decision-engine' + window.location.search)}`}
                    className="citation-int-link"
                    title={`Study ${metaA.name} masterclass blueprint and trade-offs`}
                  >
                    <Code2 size={13} />
                    <span>Study Masterclass Blueprint & Trade-offs →</span>
                  </a>
                  {metaA.referenceCitation && (
                    <div className="citation-gof-text">
                      <span className="citation-label">Classic Literature:</span> {metaA.referenceCitation}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate B Card */}
            <div className="versus-col">
              <div className="col-top-banner">
                <div className="col-title-group">
                  <div className="flex items-center gap-2">
                    <span className="col-label">CANDIDATE 02</span>
                    <span className="dilemma-category-badge">{metaB.category}</span>
                  </div>
                  <h4>{metaB.name}</h4>
                </div>
                <div className="col-action-btns">
                  <AppTooltip content={`Open interactive Code Playground for ${metaB.name} (runs in new tab)`}>
                    <a
                      href={`/playground?pattern=${metaB.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-icon-btn playground-btn"
                      aria-label={`Open Code Playground for ${metaB.name}`}
                    >
                      <Code2 size={15} />
                    </a>
                  </AppTooltip>
                  <AppTooltip content={`Adopt ${metaB.name} as active session verdict`}>
                    <button
                      type="button"
                      className="col-icon-btn pick-verdict-btn"
                      onClick={() => handlePublishCustomVerdict('B')}
                      aria-label={`Adopt ${metaB.name} as verdict`}
                    >
                      <Zap size={15} />
                    </button>
                  </AppTooltip>
                  {onSaveToLedger && (
                    <AppTooltip content={`Save ${metaB.name} decision to session ledger`}>
                      <button
                        type="button"
                        className="col-icon-btn ledger-btn"
                        onClick={() => handleSaveCustomToLedger('B')}
                        aria-label={`Save ${metaB.name} to ledger`}
                      >
                        <BookmarkCheck size={15} />
                      </button>
                    </AppTooltip>
                  )}
                </div>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">AXIS OF CHANGE (GOF TABLE 1.2)</span>
                <p>
                  <b>{metaB.aspectThatVaries}</b>
                </p>
              </div>

              <div className="versus-metric-card">
                <span className="metric-label">ARCHITECTURAL INTENT</span>
                <p>{metaB.intent}</p>
              </div>

              <div className="versus-metric-card anti-pattern-card">
                <span className="metric-label flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                  <AlertTriangle size={13} /> ANTI-PATTERN WARNING TO AVOID
                </span>
                <p>{metaB.antiPatternWarning}</p>
              </div>

              <div className="versus-citation-card">
                <span className="metric-label">AUTHORITATIVE REFERENCES & BLUEPRINTS</span>
                <div className="citation-links-list">
                  <a
                    href={`https://refactoring.guru/design-patterns/${metaB.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-ext-link"
                    title={`Open Refactoring Guru catalog guide for ${metaB.name}`}
                  >
                    <BookOpen size={13} />
                    <span>Refactoring Guru: {metaB.name}</span>
                    <ExternalLink size={11} />
                  </a>
                  <a
                    href={`/pattern/${metaB.id}?from=${encodeURIComponent('/decision-engine' + window.location.search)}`}
                    className="citation-int-link"
                    title={`Study ${metaB.name} masterclass blueprint and trade-offs`}
                  >
                    <Code2 size={13} />
                    <span>Study Masterclass Blueprint & Trade-offs →</span>
                  </a>
                  {metaB.referenceCitation && (
                    <div className="citation-gof-text">
                      <span className="citation-label">Classic Literature:</span> {metaB.referenceCitation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
