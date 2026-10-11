import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Sparkles,
  RotateCcw,
  Zap,
  BookmarkCheck,
  Copy,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { PATTERNS } from '../../data';
import type { Pattern } from '../../pattern-types';
import {
  CAUSES_OF_REDESIGN,
  ENGINEERING_CONSTRAINTS,
  CAUSE_GOF_MAPPING,
} from './decision-data';
import type { GoFDecisionVerdict } from './ai-service';
import { AppTooltip } from '../../components/ui/app-tooltip';

interface DiagnosticWizardProps {
  onVerdictGenerated: (v: GoFDecisionVerdict) => void;
  onSaveToLedger?: (v: GoFDecisionVerdict) => void;
  onOpenDrawerVerdict?: () => void;
}

export function DiagnosticWizard({
  onVerdictGenerated,
  onSaveToLedger,
  onOpenDrawerVerdict,
}: DiagnosticWizardProps) {
  const [family, setFamily] = useState<'All' | 'Creational' | 'Structural' | 'Behavioral'>('All');
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [localVerdict, setLocalVerdict] = useState<GoFDecisionVerdict | null>(null);
  const [savedToLedger, setSavedToLedger] = useState(false);
  const [copiedADR, setCopiedADR] = useState(false);

  const localVerdictRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to trigger bar when calculated
  useEffect(() => {
    if (localVerdict) {
      localVerdictRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localVerdict]);

  const toggleConstraint = (key: string) => {
    setConstraints((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSelectFamily = (f: 'All' | 'Creational' | 'Structural' | 'Behavioral') => {
    setFamily(f);
    if (f !== 'All' && selectedCause) {
      const allowed = CAUSE_GOF_MAPPING[selectedCause]?.families || [];
      if (!allowed.includes(f)) {
        setSelectedCause(null);
      }
    }
  };

  const handleReset = () => {
    setFamily('All');
    setSelectedCause(null);
    setConstraints([]);
    setLocalVerdict(null);
    setSavedToLedger(false);
  };

  const isGated = !selectedCause || constraints.length === 0;

  // Deterministic scoring with hard GoF Table 1.1 candidate boundaries
  const calculation = useMemo(() => {
    if (!selectedCause || constraints.length === 0) return null;

    const causeMeta = CAUSE_GOF_MAPPING[selectedCause];
    if (!causeMeta) return null;

    // Hard candidate boundary: strictly limit to GoF Table 1.1 canonical patterns for this cause
    let candidatePatterns = PATTERNS.filter((p: Pattern) =>
      causeMeta.canonicalPatterns.includes(p.id)
    );

    // If family is chosen, filter to that family
    if (family !== 'All') {
      candidatePatterns = candidatePatterns.filter((p: Pattern) => p.category === family);
    }

    if (candidatePatterns.length === 0) return null;

    // Base scores for candidates
    const scores: Record<string, number> = {};
    candidatePatterns.forEach((p) => {
      scores[p.id] = 30;
    });

    // Cause-specific weights
    switch (selectedCause) {
      case 'creation':
        if (scores['abstract-factory']) scores['abstract-factory'] += 45;
        if (scores['factory-method']) scores['factory-method'] += 40;
        if (scores.builder) scores.builder += 35;
        if (scores.prototype) scores.prototype += 30;
        if (scores.singleton) scores.singleton += 15;
        break;
      case 'operations':
        if (scores.command) scores.command += 50;
        if (scores['chain-of-responsibility']) scores['chain-of-responsibility'] += 45;
        if (scores.mediator) scores.mediator += 30;
        break;
      case 'platform':
        if (scores.bridge) scores.bridge += 55;
        if (scores['abstract-factory']) scores['abstract-factory'] += 45;
        if (scores.adapter) scores.adapter += 35;
        break;
      case 'algorithm':
        if (scores.strategy) scores.strategy += 50;
        if (scores['template-method']) scores['template-method'] += 40;
        if (scores.visitor) scores.visitor += 35;
        if (scores.builder) scores.builder += 25;
        if (scores.iterator) scores.iterator += 25;
        break;
      case 'coupling':
        if (scores.mediator) scores.mediator += 50;
        if (scores.observer) scores.observer += 50;
        if (scores.facade) scores.facade += 35;
        if (scores['abstract-factory']) scores['abstract-factory'] += 30;
        if (scores.bridge) scores.bridge += 30;
        if (scores['chain-of-responsibility']) scores['chain-of-responsibility'] += 25;
        if (scores.command) scores.command += 25;
        break;
      case 'inheritance':
        if (scores.decorator) scores.decorator += 50;
        if (scores.composite) scores.composite += 40;
        if (scores.strategy) scores.strategy += 45;
        if (scores.bridge) scores.bridge += 35;
        if (scores.observer) scores.observer += 30;
        break;
      case 'interface':
        if (scores.adapter) scores.adapter += 55;
        if (scores.decorator) scores.decorator += 45;
        if (scores.visitor) scores.visitor += 35;
        break;
      case 'state':
        if (scores.state) scores.state += 60;
        if (scores.strategy) scores.strategy += 30;
        break;
    }

    // Constraints weighting
    if (constraints.includes('avoid-subclasses')) {
      if (scores.strategy) scores.strategy += 25;
      if (scores.decorator) scores.decorator += 25;
      if (scores.composite) scores.composite += 20;
      if (scores['factory-method']) scores['factory-method'] -= 20;
      if (scores['template-method']) scores['template-method'] -= 20;
    }
    if (constraints.includes('preserve-api')) {
      if (scores.adapter) scores.adapter += 40;
      if (scores.facade) scores.facade += 30;
      if (scores.proxy) scores.proxy += 25;
    }
    if (constraints.includes('runtime-swap')) {
      if (scores.strategy) scores.strategy += 30;
      if (scores.state) scores.state += 30;
      if (scores.decorator) scores.decorator += 20;
    }
    if (constraints.includes('undo-history')) {
      if (scores.command) scores.command += 55;
      if (scores.memento) scores.memento += 45;
    }
    if (constraints.includes('tree-hierarchy')) {
      if (scores.composite) scores.composite += 50;
      if (scores.visitor) scores.visitor += 35;
    }
    if (constraints.includes('memory-footprint')) {
      if (scores.flyweight) scores.flyweight += 50;
      if (scores.singleton) scores.singleton += 20;
    }
    if (constraints.includes('encapsulate-state')) {
      if (scores.memento) scores.memento += 50;
      if (scores.state) scores.state += 30;
    }
    if (constraints.includes('pipeline-handlers')) {
      if (scores['chain-of-responsibility']) scores['chain-of-responsibility'] += 55;
      if (scores.decorator) scores.decorator += 25;
    }

    // Sort ranked candidates
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topId = ranked[0][0];
    const runnerUpId = ranked.length > 1 ? ranked[1][0] : ranked[0][0];

    const topP = candidatePatterns.find((p) => p.id === topId) || candidatePatterns[0];
    const runnerUpP = candidatePatterns.find((p) => p.id === runnerUpId) || candidatePatterns[0];

    const selectedCauseObj = CAUSES_OF_REDESIGN.find((c) => c.key === selectedCause);

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: topP.id,
        name: topP.name,
        category: topP.category,
        confidence: Math.min(96, Math.max(82, 72 + Math.floor(ranked[0][1] / 3))),
        architecturalRationale: `Chosen based on the canonical GoF Table 1.1 axis of change: "${selectedCauseObj?.label || 'Variable requirements'}". Encapsulates variation behind clean contracts.`,
        structuralApplicability: `Satisfies constraints through ${topP.name} structure, fulfilling ${topP.intent.toLowerCase()}`,
      },
      runnerUpPattern: {
        id: runnerUpP.id,
        name: runnerUpP.name,
        category: runnerUpP.category,
        confidence: Math.min(88, Math.max(70, 60 + Math.floor((ranked[1]?.[1] ?? ranked[0][1] * 0.8) / 3))),
        whyConsidered: `Secondary canonical candidate in the ${runnerUpP.category.toLowerCase()} category for this redesign cause.`,
        whenToChooseRunnerUpOverPrimary: `Choose ${runnerUpP.name} if your team prefers ${runnerUpP.memoryHook.toLowerCase()} instead of ${topP.memoryHook.toLowerCase()}.`,
      },
      tradeOffDilemma: {
        primaryGains: [
          'Directly addresses your selected cause of redesign in GoF Table 1.1',
          'Eliminates compile-time locks to concrete variants',
          'Conforms to GoF Principle: "Program to an interface, not an implementation"',
        ],
        primaryTaxes: [
          'Introduces an extra layer of abstraction / indirection',
          'Requires the team to adhere to the pattern lifecycle',
        ],
        decisiveDifferentiator: `${topP.name} directly decouples ${topP.memoryHook.toLowerCase()}, whereas ${runnerUpP.name} focuses on ${runnerUpP.memoryHook.toLowerCase()}.`,
      },
      codeSmellWarning: 'Avoid introducing this pattern if you only have one static implementation that will never vary (YAGNI).',
    };

    return { topP, runnerUpP, verdict };
  }, [family, selectedCause, constraints]);

  const handleApplyVerdict = () => {
    if (!calculation) return;
    setLocalVerdict(calculation.verdict);
    setSavedToLedger(false);
    onVerdictGenerated(calculation.verdict);
  };

  const handleRecordToLedger = () => {
    if (!localVerdict) return;
    onSaveToLedger?.(localVerdict);
    setSavedToLedger(true);
    setTimeout(() => setSavedToLedger(false), 3000);
  };

  const handleCopyADR = () => {
    if (!localVerdict) return;
    const adr = `# Architectural Decision Record: ${localVerdict.primaryPattern.name}
**Status:** Proposed  
**Confidence Score:** ${localVerdict.primaryPattern.confidence}%  
**Pattern Family:** ${localVerdict.primaryPattern.category}  

## Context & Selected Cause of Redesign
${localVerdict.primaryPattern.architecturalRationale}

## Structural Move
${localVerdict.primaryPattern.structuralApplicability}

## Consequences & Trade-offs
### Gains
${localVerdict.tradeOffDilemma.primaryGains.map((g) => `- ${g}`).join('\n')}

### Taxes & Drawbacks
${localVerdict.tradeOffDilemma.primaryTaxes.map((t) => `- ${t}`).join('\n')}

## Alternative Considered: ${localVerdict.runnerUpPattern.name} (${localVerdict.runnerUpPattern.confidence}%)
- **When to Choose Instead:** ${localVerdict.runnerUpPattern.whenToChooseRunnerUpOverPrimary}

## Decisive Rule
${localVerdict.tradeOffDilemma.decisiveDifferentiator}
`;
    navigator.clipboard.writeText(adr);
    setCopiedADR(true);
    setTimeout(() => setCopiedADR(false), 2500);
  };

  return (
    <div className="wizard-layout-container">
      <div className="wizard-form-card">
        {/* Step 1: Pressure Family */}
        <div className="wizard-step">
          <div className="step-badge">01</div>
          <div className="step-body">
            <label className="step-heading">What is the primary nature of the problem?</label>
            <p className="step-caption">Filter by Gang of Four pattern family or keep all 23 open.</p>
            <div className="family-pills-row">
              {(['All', 'Creational', 'Structural', 'Behavioral'] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`family-pill-btn ${family === f ? 'active' : ''}`}
                  onClick={() => handleSelectFamily(f)}
                >
                  {f === 'All' ? 'All 23 Patterns' : `${f} Family`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Axis of Change (Cascading GoF Table 1.1 Gating) */}
        <div className="wizard-step">
          <div className="step-badge">02</div>
          <div className="step-body">
            <label className="step-heading">
              What is changing most frequently? (GoF Cause of Redesign) <span className="required-tag">*Mandatory</span>
            </label>
            <p className="step-caption">Identify what varies in your codebase to find where the abstraction belongs.</p>
            <div className="cause-list-grid">
              {CAUSES_OF_REDESIGN.map((c) => {
                const causeMeta = CAUSE_GOF_MAPPING[c.key];
                const isCompatible = family === 'All' || causeMeta?.families.includes(family);
                const isSelected = selectedCause === c.key;

                return (
                  <button
                    type="button"
                    key={c.key}
                    disabled={!isCompatible}
                    className={`cause-item-btn ${isSelected ? 'active' : ''} ${!isCompatible ? 'cause-disabled' : ''}`}
                    onClick={() => isCompatible && setSelectedCause(c.key)}
                    title={!isCompatible ? `Disabled: incompatible with selected ${family} family in GoF Table 1.1` : undefined}
                  >
                    <div className="cause-radio-circle" />
                    <div className="cause-text-group">
                      <div className="flex items-center gap-2">
                        <span className="cause-title">{c.label}</span>
                        {!isCompatible && causeMeta?.familyBadge && (
                          <span className="cause-family-tag">[{causeMeta.familyBadge}]</span>
                        )}
                      </div>
                      <span className="cause-hint">
                        {!isCompatible
                          ? `Incompatible with ${family} family. GoF Table 1.1 maps this to ${causeMeta?.families.join(', ')} patterns.`
                          : c.hint}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Engineering Constraints (Dual-Requirement Gating) */}
        <div className="wizard-step">
          <div className="step-badge">03</div>
          <div className="step-body">
            <label className="step-heading">
              Which engineering constraints must you honor? <span className="required-tag">*Mandatory (Select ≥ 1)</span>
            </label>
            <p className="step-caption">Select all constraints that apply to decisively narrow down candidate patterns.</p>
            <div className="constraints-checkbox-grid">
              {ENGINEERING_CONSTRAINTS.map((c) => {
                const isSelected = constraints.includes(c.key);
                return (
                  <button
                    type="button"
                    key={c.key}
                    className={`constraint-chip-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleConstraint(c.key)}
                  >
                    <span className="checkbox-indicator">{isSelected && <Check size={12} />}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit & Reset Bar (Dual-Requirement Gating) */}
        <div className="wizard-footer-bar">
          <button type="button" className="subtle-btn reset-btn" onClick={handleReset}>
            <RotateCcw size={14} /> Reset All
          </button>

          <div className="wizard-submit-group">
            {!selectedCause ? (
              <span className="wizard-gated-hint">
                <AlertTriangle size={13} /> Select a Cause in Step 2 to compute verdict
              </span>
            ) : constraints.length === 0 ? (
              <span className="wizard-gated-hint">
                <AlertTriangle size={13} /> Select at least 1 constraint in Step 3
              </span>
            ) : null}
            <button
              type="button"
              className="primary-btn wizard-calculate-btn"
              disabled={isGated}
              onClick={handleApplyVerdict}
            >
              <Sparkles size={16} />
              <span>
                {calculation
                  ? `Compute Verdict: ${calculation.topP.name} (${calculation.verdict.primaryPattern.confidence}%)`
                  : 'Compute GoF Verdict'}
              </span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Verdict Action Trigger Bar (Stage-3 Replacement for Truncated Card) */}
      {localVerdict && (
        <div ref={localVerdictRef} className="verdict-action-trigger-bar">
          <div className="trigger-bar-info">
            <div className="trigger-bar-eyebrow">
              <span className={`category-tag cat-${localVerdict.primaryPattern.category.toLowerCase()}`}>
                {localVerdict.primaryPattern.category}
              </span>
              <span className="confidence-badge">
                <Zap size={12} /> {localVerdict.primaryPattern.confidence}% FIT
              </span>
            </div>
            <h4 className="trigger-bar-title">{localVerdict.primaryPattern.name}</h4>
            <p className="trigger-bar-rationale">{localVerdict.primaryPattern.architecturalRationale}</p>
          </div>
          <div className="trigger-bar-actions">
            <AppTooltip content="Open full Architectural Decision Record in side drawer">
              <button
                type="button"
                className="primary-btn view-full-adr-btn"
                onClick={() => onOpenDrawerVerdict?.()}
              >
                <BookOpen size={14} />
                <span>Open Full ADR in Drawer →</span>
              </button>
            </AppTooltip>
            {onSaveToLedger && (
              <AppTooltip content="Save this verdict to session decision ledger">
                <button
                  type="button"
                  className={`subtle-action-btn ${savedToLedger ? 'saved-btn' : ''}`}
                  onClick={handleRecordToLedger}
                >
                  {savedToLedger ? <Check size={14} /> : <BookmarkCheck size={14} />}
                  <span>{savedToLedger ? 'Saved to Ledger!' : 'Record to Ledger'}</span>
                </button>
              </AppTooltip>
            )}
            <AppTooltip content="Copy decision record as Markdown to clipboard">
              <button
                type="button"
                className={`subtle-action-btn ${copiedADR ? 'copied-btn' : ''}`}
                onClick={handleCopyADR}
              >
                {copiedADR ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedADR ? 'Copied ADR!' : 'Copy ADR'}</span>
              </button>
            </AppTooltip>
          </div>
        </div>
      )}
    </div>
  );
}
