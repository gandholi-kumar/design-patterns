import { useState } from 'react';
import { Zap, ArrowUpRight, Code2, Copy, Check, AlertTriangle, ShieldCheck, X, BookOpen } from 'lucide-react';
import type { GoFDecisionVerdict } from './ai-service';
import { AppTooltip } from '../../components/ui/app-tooltip';

interface DecisionVerdictCardProps {
  verdict: GoFDecisionVerdict;
  onSelectPattern: (patternId: string) => void;
  onOpenPlayground: (patternId: string) => void;
  onCloseDrawer?: () => void;
  onSwitchToGuide?: () => void;
  hideHeader?: boolean;
}

export function DecisionVerdictCard({
  verdict,
  onSelectPattern,
  onOpenPlayground,
  onCloseDrawer,
  onSwitchToGuide,
  hideHeader = false,
}: DecisionVerdictCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyADR = () => {
    const adr = `# Architectural Decision Record: ${verdict.primaryPattern.name}
**Status:** Proposed  
**Confidence Score:** ${verdict.primaryPattern.confidence}%  
**Pattern Family:** ${verdict.primaryPattern.category}  

## Context & Architectural Move
${verdict.primaryPattern.architecturalRationale}

## Structural Collaboration
${verdict.primaryPattern.structuralApplicability}

## Consequences & Trade-offs
### Gains
${verdict.tradeOffDilemma.primaryGains.map((g) => `- ${g}`).join('\n')}

### Taxes & Drawbacks
${verdict.tradeOffDilemma.primaryTaxes.map((t) => `- ${t}`).join('\n')}

## Alternative Considered: ${verdict.runnerUpPattern.name} (${verdict.runnerUpPattern.confidence}%)
- **Why Considered:** ${verdict.runnerUpPattern.whyConsidered}
- **Pivot Rule (When to Choose Instead):** ${verdict.runnerUpPattern.whenToChooseRunnerUpOverPrimary}

## Decisive Rule
${verdict.tradeOffDilemma.decisiveDifferentiator}

## Code Smell Warning
${verdict.codeSmellWarning}
`;

    navigator.clipboard.writeText(adr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className={`verdict-card-container ${hideHeader ? 'in-drawer' : ''}`}>
      {!hideHeader && (
        <div className="verdict-drawer-header">
          <div className="drawer-segmented-toggle">
            <button type="button" className="drawer-seg-btn active">
              <Zap size={14} /> Verdict
            </button>
            <button type="button" className="drawer-seg-btn" onClick={onSwitchToGuide}>
              <BookOpen size={14} /> Field Guide
            </button>
          </div>
          {onCloseDrawer && (
            <AppTooltip content="Close drawer panel" shortcut="Esc">
              <button
                type="button"
                className="drawer-close-btn"
                onClick={onCloseDrawer}
                aria-label="Collapse side panel"
              >
                <X size={16} />
              </button>
            </AppTooltip>
          )}
        </div>
      )}

      <div className="verdict-body">
        {/* Primary Verdict Header */}
        <div className="verdict-header-banner">
          <div className="verdict-eyebrow-row">
            <span className={`category-tag cat-${verdict.primaryPattern.category.toLowerCase()}`}>
              {verdict.primaryPattern.category}
            </span>
            <span className="confidence-badge">
              <Zap size={12} /> {verdict.primaryPattern.confidence}% MATCH
            </span>
          </div>
          <h3 className="verdict-title">{verdict.primaryPattern.name}</h3>
          <p className="verdict-rationale">{verdict.primaryPattern.architecturalRationale}</p>
        </div>

        {/* Structural Move Box */}
        <div className="verdict-section-box">
          <span className="section-label">THE STRUCTURAL MOVE</span>
          <p className="section-body">{verdict.primaryPattern.structuralApplicability}</p>
        </div>

        {/* Runner-Up Pivot Card */}
        <div className="runner-up-card">
          <div className="runner-up-header">
            <span className="runner-up-tag">RUNNER-UP ALTERNATIVE</span>
            <span className="runner-up-score">{verdict.runnerUpPattern.confidence}% fit</span>
          </div>
          <div className="runner-up-name-row">
            <h4>{verdict.runnerUpPattern.name}</h4>
            <span className="runner-up-family">{verdict.runnerUpPattern.category}</span>
          </div>
          <p className="runner-up-why">
            <b>Why considered:</b> {verdict.runnerUpPattern.whyConsidered}
          </p>
          <div className="pivot-rule-callout">
            <span className="pivot-label">CHOOSE THIS INSTEAD IF:</span>
            <p className="pivot-text">{verdict.runnerUpPattern.whenToChooseRunnerUpOverPrimary}</p>
          </div>
        </div>

        {/* Gains vs Taxes Trade-Off Grid */}
        <div className="trade-off-block">
          <span className="section-label">GAINS VS TAXES</span>
          <div className="trade-off-grid">
            <div className="gains-col">
              <span className="col-subhead gains-subhead">
                <Check size={13} /> Architecture Gains
              </span>
              <ul>
                {verdict.tradeOffDilemma.primaryGains.map((gain, i) => (
                  <li key={i}>{gain}</li>
                ))}
              </ul>
            </div>
            <div className="taxes-col">
              <span className="col-subhead taxes-subhead">
                <AlertTriangle size={13} /> Design Taxes
              </span>
              <ul>
                {verdict.tradeOffDilemma.primaryTaxes.map((tax, i) => (
                  <li key={i}>{tax}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="code-smell-callout">
          <ShieldCheck size={16} />
          <p>
            <b>Architect's Caveat:</b> {verdict.codeSmellWarning}
          </p>
        </div>

        {/* Action Pathways */}
        <div className="verdict-actions-footer">
          <button
            type="button"
            className="primary-btn action-full-btn"
            onClick={() => onSelectPattern(verdict.primaryPattern.id)}
          >
            <span>Open Blueprint Notes</span>
            <ArrowUpRight size={15} />
          </button>
          <div className="secondary-action-row">
            <button
              type="button"
              className="subtle-action-btn"
              onClick={() => onOpenPlayground(verdict.primaryPattern.id)}
            >
              <Code2 size={15} /> Playground
            </button>
            <button
              type="button"
              className={`subtle-action-btn ${copied ? 'copied-btn' : ''}`}
              onClick={handleCopyADR}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied ADR!' : 'Copy ADR'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
