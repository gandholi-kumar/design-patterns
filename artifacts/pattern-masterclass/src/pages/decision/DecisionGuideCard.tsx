import { BookOpen, Zap, Compass, X, ShieldCheck, Scale, AlertOctagon, HelpCircle } from 'lucide-react';
import { GOF_PRINCIPLES, RAPID_HEURISTICS } from './decision-data';
import { AppTooltip } from '../../components/ui/app-tooltip';

interface DecisionGuideCardProps {
  hasVerdict: boolean;
  onSwitchToVerdict?: () => void;
  onCloseDrawer?: () => void;
  hideHeader?: boolean;
}

const CAUSES_OF_REDESIGN_TABLE = [
  {
    cause: '1. Creating an object by specifying a class explicitly',
    rationale: 'Binds the caller to concrete types, preventing future variants without modifying code.',
    patterns: 'Abstract Factory, Factory Method, Prototype',
  },
  {
    cause: '2. Dependence on specific operations / requests',
    rationale: 'Hardcodes request routing; prevents undo, replay, queuing, or dynamic dispatch.',
    patterns: 'Chain of Responsibility, Command',
  },
  {
    cause: '3. Dependence on hardware and software platforms',
    rationale: 'Ties system to specific vendor SDKs or OS primitives.',
    patterns: 'Abstract Factory, Bridge',
  },
  {
    cause: '4. Dependence on object representation or state storage',
    rationale: 'Exposing internal memory layout breaks encapsulation when representation evolves.',
    patterns: 'Abstract Factory, Bridge, Memento, Proxy',
  },
  {
    cause: '5. Algorithmic dependencies & calculation shifts',
    rationale: 'Inlining calculation logic into consumers makes them hard to test, swap, and extend.',
    patterns: 'Builder, Iterator, Strategy, Template Method, Visitor',
  },
  {
    cause: '6. Tight coupling between collaborating classes',
    rationale: 'A change to one object ripples uncontrollably through an interconnected web of classes.',
    patterns: 'Abstract Factory, Bridge, Command, Facade, Mediator, Observer',
  },
  {
    cause: '7. Extending functionality by subclassing (class explosion)',
    rationale: 'Creating subclasses for every combination leads to exponential combinatorial bloat.',
    patterns: 'Bridge, Composite, Decorator, Observer, Strategy',
  },
  {
    cause: '8. Inability to alter existing classes conveniently',
    rationale: 'Legacy code or external packages cannot be refactored or recompiled directly.',
    patterns: 'Adapter, Decorator, Visitor',
  },
];

export function DecisionGuideCard({
  hasVerdict,
  onSwitchToVerdict,
  onCloseDrawer,
  hideHeader = false,
}: DecisionGuideCardProps) {
  return (
    <article className={`guide-card-container ${hideHeader ? 'in-drawer' : ''}`}>
      {!hideHeader && (
        <div className="verdict-drawer-header">
          <div className="drawer-segmented-toggle">
            {hasVerdict && onSwitchToVerdict ? (
              <button type="button" className="drawer-seg-btn" onClick={onSwitchToVerdict}>
                <Zap size={14} /> Verdict (Active)
              </button>
            ) : (
              <span className="drawer-empty-badge">No Verdict Yet</span>
            )}
            <button type="button" className="drawer-seg-btn active">
              <BookOpen size={14} /> Field Guide
            </button>
          </div>
          {onCloseDrawer && (
            <AppTooltip content="Close drawer panel (Esc)">
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

      <div className="guide-body">
        {/* Intro */}
        <div className="guide-hero-banner">
          <div className="orbit-mini">
            <Compass size={22} />
          </div>
          <span className="eyebrow">FIELD GUIDE & ARCHITECTURAL HEURISTICS</span>
          <h3>How to Decide</h3>
          <p>
            A design pattern is not an architectural goal or an off-the-shelf library. It is a formalized vocabulary for an architectural trade-off that isolates a specific axis of change.
          </p>
        </div>

        {/* 3 Principles */}
        <div className="guide-section">
          <span className="section-label">THE 3 GOF CORE DESIGN PRINCIPLES</span>
          <div className="principles-stack">
            {GOF_PRINCIPLES.map((p) => (
              <div key={p.num} className="principle-item">
                <div className="principle-num">{p.num}</div>
                <div className="principle-copy">
                  <h5>{p.title}</h5>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GoF Chapter 1.7 Causes of Redesign */}
        <div className="guide-section">
          <span className="section-label">CAUSES OF REDESIGN (GOF TABLE 1.1)</span>
          <p className="section-subtext">
            Gang of Four Chapter 1.7 classifies design patterns by the exact problem forces that necessitate redesign when software evolves.
          </p>
          <div className="causes-redesign-table">
            {CAUSES_OF_REDESIGN_TABLE.map((row, idx) => (
              <div key={idx} className="redesign-row-card">
                <div className="redesign-cause-header">
                  <h6>{row.cause}</h6>
                </div>
                <p className="redesign-rationale">{row.rationale}</p>
                <div className="redesign-pattern-tags">
                  <span className="tags-label">Patterns:</span>
                  <span className="tags-content">{row.patterns}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Relationship Taxonomy */}
        <div className="guide-section">
          <span className="section-label">PATTERN RELATIONSHIP TAXONOMY</span>
          <div className="taxonomy-grid">
            <div className="taxonomy-card competitor-tax">
              <div className="taxonomy-tag text-rose-700 dark:text-rose-400 font-bold">🔴 SIBLING COMPETITORS</div>
              <h6>Structural Isomorphism</h6>
              <p>
                Patterns share identical UML class diagrams (e.g. Strategy vs. State) but solve competing architectural intents. Disambiguate using the Decisive Pivot Rule.
              </p>
            </div>
            <div className="taxonomy-card collaborator-tax">
              <div className="taxonomy-tag text-emerald-700 dark:text-emerald-400 font-bold">🟢 SYNERGISTIC COLLABORATORS</div>
              <h6>Pipeline Partners</h6>
              <p>
                Patterns that do not compete, but layer together in production subsystems (e.g. Composite + Visitor, Command + Memento).
              </p>
            </div>
            <div className="taxonomy-card orthogonal-tax">
              <div className="taxonomy-tag text-slate-700 dark:text-zinc-400 font-bold">⚪ ORTHOGONAL CONCERNS</div>
              <h6>Independent Problem Spaces</h6>
              <p>
                Patterns operating on completely separate axes of change (e.g. Singleton vs. Visitor). Comparing them is an architectural false dilemma.
              </p>
            </div>
          </div>
        </div>

        {/* Anti-Pattern Guardrail (Kerievsky & Fowler) */}
        <div className="guide-section">
          <span className="section-label">ANTI-PATTERN & PREMATURE ABSTRACTION GUARDRAILS</span>
          <div className="guardrail-callout-box">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1.5 font-bold text-xs tracking-wider uppercase">
              <AlertOctagon size={15} /> The Rule of Three (Joshua Kerievsky)
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">
              "Never introduce a pattern on the first occurrence. Refactor to a pattern only when the third variation emerges and the true axis of change becomes undeniable."
            </p>
            <div className="guardrail-subpoints">
              <div className="subpoint">
                <b>• Beware "Patternitis":</b> Forcing design patterns into problems where simple procedural or functional code suffices is technical debt.
              </div>
              <div className="subpoint">
                <b>• Honor YAGNI:</b> Every design pattern incurs a cognitive and class count tax. If an algorithm never changes, Strategy is an anti-pattern.
              </div>
            </div>
          </div>
        </div>

        {/* Rapid Heuristic Cheat-Sheet */}
        <div className="guide-section">
          <span className="section-label">RAPID HEURISTIC CHEAT-SHEET</span>
          <div className="heuristics-table">
            {RAPID_HEURISTICS.map((h, i) => (
              <div key={i} className="heuristic-row">
                <span className="heuristic-trigger">{h.trigger}</span>
                <span className="heuristic-arrow">→</span>
                <span className="heuristic-rec">{h.recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Trust Notice */}
        <div className="guide-privacy-box">
          <ShieldCheck size={16} />
          <p>
            <b>Zero-Trust Privacy:</b> API keys exist solely in volatile browser RAM and are never persisted to disk or sent to telemetry. Deterministic offline analysis is always available.
          </p>
        </div>
      </div>
    </article>
  );
}
