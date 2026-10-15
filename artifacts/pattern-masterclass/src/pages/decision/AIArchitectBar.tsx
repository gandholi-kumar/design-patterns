import { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  KeyRound,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Send,
  CheckCircle2,
  Check,
  Copy,
  ExternalLink,
  Code2,
  BookmarkCheck,
  BookOpen,
} from 'lucide-react';
import {
  type GoFDecisionVerdict,
  type AIProviderConfig,
  type ChatTurn,
  analyzeProblemWithAI,
  analyzeProblemOffline,
} from './ai-service';
import { AppTooltip } from '../../components/ui/app-tooltip';

interface AIArchitectBarProps {
  config: AIProviderConfig;
  onOpenKeyModal: () => void;
  onVerdictGenerated: (v: GoFDecisionVerdict) => void;
  onSaveToLedger?: (v: GoFDecisionVerdict) => void;
  onOpenPlayground?: (id: string) => void;
  onOpenDrawerVerdict?: () => void;
}

const PROMPT_CHIPS = [
  'Dynamic Pricing Rules & Discounts',
  'Multi-Cloud Consistent Resource Suites',
  'Legacy SOAP to Modern REST Translation',
  'Editor Command Buffer with Undo/Redo',
  'Complex SQL Query Builder Chaining',
  'Distributed Order Lifecycle Transitions',
];

export function AIArchitectBar({
  config,
  onOpenKeyModal,
  onVerdictGenerated,
  onSaveToLedger,
  onOpenPlayground,
  onOpenDrawerVerdict,
}: AIArchitectBarProps) {
  const [problemText, setProblemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryNotice, setRetryNotice] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [challengeInput, setChallengeInput] = useState('');
  const [lastVerdict, setLastVerdict] = useState<GoFDecisionVerdict | null>(null);
  const [savedToLedger, setSavedToLedger] = useState(false);
  const [copiedADR, setCopiedADR] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const verdictSectionRef = useRef<HTMLDivElement>(null);

  const maxTurns = 5;
  const turnsRemaining = maxTurns - Math.floor(turns.length / 2);

  // Clear any existing error message when API key is successfully connected or changed
  useEffect(() => {
    if (config.apiKey) {
      setErrorMessage('');
    }
  }, [config.apiKey]);

  // Auto-scroll to latest chat turn
  useEffect(() => {
    if (turns.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns]);

  // Auto-scroll to verdict when newly produced
  useEffect(() => {
    if (lastVerdict) {
      verdictSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastVerdict]);

  const handleChipClick = (chip: string) => {
    setErrorMessage('');
    setProblemText(
      `Our system architecture requires handling ${chip.toLowerCase()}. We need to decouple callers from concrete implementations and support future extensions cleanly.`
    );
  };

  const handleRunOffline = () => {
    if (problemText.trim().length < 15) {
      setErrorMessage('Please enter at least 15 characters describing your problem statement to calculate the offline heuristic.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setStatusText('Running deterministic GoF heuristic classifier...');

    setTimeout(() => {
      try {
        const v = analyzeProblemOffline(problemText);
        setLastVerdict(v);
        setSavedToLedger(false);
        onVerdictGenerated(v);
        setTurns([
          { role: 'user', content: problemText },
          {
            role: 'assistant',
            content: `[Deterministic Heuristic Analysis] Recommendation: ${v.primaryPattern.name} (${v.primaryPattern.confidence}% match). Pivot alternative: ${v.runnerUpPattern.name}.`,
          },
        ]);
        setIsLoading(false);
        setStatusText('');
      } catch (err: unknown) {
        setIsLoading(false);
        setErrorMessage(err instanceof Error ? err.message : 'Error during offline analysis.');
      }
    }, 250);
  };

  const handleRunAI = async () => {
    if (problemText.trim().length < 15) {
      setErrorMessage('Please provide at least 15 characters describing your architectural problem before running AI analysis.');
      return;
    }
    if (!config.apiKey && config.provider !== 'ollama' && config.provider !== 'managed') {
      onOpenKeyModal();
      return;
    }

    setErrorMessage('');
    setRetryNotice('');
    setIsLoading(true);
    setStatusText('Extracting architectural forces & intent...');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Simulated progress stage updates
    const t1 = setTimeout(() => setStatusText('Evaluating 23 Gang of Four patterns...'), 1200);
    const t2 = setTimeout(() => setStatusText('Calculating primary vs runner-up trade-offs...'), 2400);

    try {
      const v = await analyzeProblemWithAI(
        problemText,
        config,
        turns,
        (msg) => setRetryNotice(msg),
        controller.signal
      );

      clearTimeout(t1);
      clearTimeout(t2);
      setLastVerdict(v);
      setSavedToLedger(false);
      onVerdictGenerated(v);
      setTurns([
        { role: 'user', content: problemText },
        {
          role: 'assistant',
          content: `Recommended ${v.primaryPattern.name} (${v.primaryPattern.confidence}%). Rationale: ${v.primaryPattern.architecturalRationale}. Alternative: ${v.runnerUpPattern.name}.`,
        },
      ]);
      setIsLoading(false);
      setStatusText('');
      setRetryNotice('');
    } catch (err: unknown) {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsLoading(false);
      setStatusText('');
      setRetryNotice('');
      setErrorMessage(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  const handleSendChallenge = async () => {
    if (!challengeInput.trim() || isLoading) return;
    if (turnsRemaining <= 0) return;

    const userMsg = challengeInput.trim();
    setChallengeInput('');
    setIsLoading(true);
    setStatusText('Analyzing architectural pushback...');

    const updatedHistory: ChatTurn[] = [...turns, { role: 'user', content: userMsg }];
    setTurns(updatedHistory);

    if (config.apiKey || config.provider === 'ollama' || config.provider === 'managed') {
      try {
        const v = await analyzeProblemWithAI(
          `Developer challenge: "${userMsg}". Previous context was: ${problemText}`,
          config,
          updatedHistory,
          (msg) => setRetryNotice(msg)
        );
        setLastVerdict(v);
        setSavedToLedger(false);
        onVerdictGenerated(v);
        setTurns([
          ...updatedHistory,
          {
            role: 'assistant',
            content: `Staff Architect assessment: ${v.primaryPattern.architecturalRationale} (Pivot if: ${v.runnerUpPattern.whenToChooseRunnerUpOverPrimary})`,
          },
        ]);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Follow-up query failed.');
      }
    } else {
      // Offline follow-up answer
      setTimeout(() => {
        const offlineV = analyzeProblemOffline(`${problemText} ${userMsg}`);
        setLastVerdict(offlineV);
        setSavedToLedger(false);
        onVerdictGenerated(offlineV);
        setTurns([
          ...updatedHistory,
          {
            role: 'assistant',
            content: `Heuristic check: In light of "${userMsg}", consider whether YAGNI applies. If complexity is justified, ${offlineV.primaryPattern.name} maintains separation of concerns.`,
          },
        ]);
        setIsLoading(false);
        setStatusText('');
      }, 400);
    }

    setIsLoading(false);
    setStatusText('');
  };

  const handleReset = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setProblemText('');
    setTurns([]);
    setChallengeInput('');
    setLastVerdict(null);
    setSavedToLedger(false);
    setErrorMessage('');
    setRetryNotice('');
    setIsLoading(false);
    setStatusText('');
  };

  const handleRecordToLedger = () => {
    if (!lastVerdict) return;
    onSaveToLedger?.(lastVerdict);
    setSavedToLedger(true);
    setTimeout(() => setSavedToLedger(false), 3000);
  };

  const handleCopyADR = () => {
    if (!lastVerdict) return;
    const adr = `# Architectural Decision Record: ${lastVerdict.primaryPattern.name}
**Status:** Proposed  
**Confidence Score:** ${lastVerdict.primaryPattern.confidence}%  
**Pattern Family:** ${lastVerdict.primaryPattern.category}  

## Context & Architectural Move
${lastVerdict.primaryPattern.architecturalRationale}

## Structural Collaboration
${lastVerdict.primaryPattern.structuralApplicability}

## Consequences & Trade-offs
### Gains
${lastVerdict.tradeOffDilemma.primaryGains.map((g) => `- ${g}`).join('\n')}

### Taxes & Drawbacks
${lastVerdict.tradeOffDilemma.primaryTaxes.map((t) => `- ${t}`).join('\n')}

## Alternative Considered: ${lastVerdict.runnerUpPattern.name} (${lastVerdict.runnerUpPattern.confidence}%)
- **Why Considered:** ${lastVerdict.runnerUpPattern.whyConsidered}
- **Pivot Rule:** ${lastVerdict.runnerUpPattern.whenToChooseRunnerUpOverPrimary}

## Decisive Rule
${lastVerdict.tradeOffDilemma.decisiveDifferentiator}

## Code Smell Warning
${lastVerdict.codeSmellWarning}
`;
    navigator.clipboard.writeText(adr);
    setCopiedADR(true);
    setTimeout(() => setCopiedADR(false), 2500);
  };

  const isManaged = config.provider === 'managed';
  const hasKey = Boolean(config.apiKey || config.provider === 'ollama' || isManaged);

  return (
    <div className="ai-architect-container">
      {/* Top status & key badge */}
      <div className="ai-top-bar">
        <div className="ai-copilot-tag">
          <Sparkles size={16} />
          <span>NATURAL LANGUAGE ARCHITECT</span>
        </div>
        <div className="ai-key-status">
          {isManaged ? (
            <button type="button" className="active-key-pill" onClick={onOpenKeyModal} title="Using Built-in Pro Cloud AI (Zero Key Required)">
              <Sparkles size={13} />
              <span>Built-in Pro AI (Active · No Key Required)</span>
            </button>
          ) : hasKey ? (
            <button type="button" className="active-key-pill" onClick={onOpenKeyModal} title="Using BYOK Key in RAM">
              <CheckCircle2 size={13} />
              <span>BYOK: {config.provider.toUpperCase()}</span>
            </button>
          ) : (
            <button type="button" className="unconnected-key-pill" onClick={onOpenKeyModal}>
              <KeyRound size={13} />
              <span>Configure AI Engine / Key</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Prompt Box */}
      <div className="prompt-card">
        <label htmlFor="problem-textarea" className="prompt-label">
          Describe your architectural forces or code smell:
        </label>
        <textarea
          id="problem-textarea"
          className="prompt-textarea"
          rows={4}
          maxLength={800}
          placeholder="e.g. We have 4 payment providers (Stripe, PayPal, Adyen, Klarna) and need to support recurring subscriptions, fraud scoring, and regional discounts without coupling our checkout service to specific SDKs..."
          value={problemText}
          onChange={(e) => {
            setProblemText(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          disabled={isLoading && turns.length > 0}
        />

        <div className="prompt-card-bottom">
          <span className="char-count">{problemText.length} / 800 chars</span>

          {/* Wrapped Prompt Template Grid (Capsule Pills) */}
          <div className="chips-grid-wrapper">
            <span className="chips-grid-label">QUICK ARCHITECTURAL TEMPLATES (6):</span>
            <div className="chips-grid-container">
              {PROMPT_CHIPS.map((chip) => (
                <AppTooltip key={chip} content={`Load template: ${chip}`} side="top">
                  <button
                    type="button"
                    className="prompt-chip-btn"
                    onClick={() => handleChipClick(chip)}
                  >
                    <Sparkles size={12} className="chip-icon" />
                    <span>{chip}</span>
                  </button>
                </AppTooltip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error / Retry Banners */}
      {errorMessage && (
        <div className="ai-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
          {!hasKey && errorMessage.toLowerCase().includes('api key') && (
            <button type="button" className="text-banner-btn" onClick={onOpenKeyModal}>
              Connect API Key
            </button>
          )}
        </div>
      )}

      {retryNotice && (
        <div className="ai-retry-banner" aria-live="polite">
          <RefreshCw size={15} className="spin-icon" />
          <span>{retryNotice}</span>
          <button type="button" className="text-banner-btn" onClick={handleRunOffline}>
            Run Offline Now
          </button>
        </div>
      )}

      {/* Latency Progress bar */}
      {isLoading && (
        <div className="latency-progress-box" aria-live="polite">
          <div className="latency-bar-track">
            <div className="latency-bar-pulse" />
          </div>
          <span className="latency-text">{statusText}</span>
        </div>
      )}

      {/* Dual Actions Footer */}
      {turns.length === 0 && (
        <div className="ai-action-bar">
          <button
            type="button"
            className="secondary-btn instant-offline-btn"
            onClick={handleRunOffline}
            disabled={isLoading}
          >
            Run Offline Heuristic (Free)
          </button>

          <button
            type="button"
            className="primary-btn run-ai-btn"
            onClick={handleRunAI}
            disabled={isLoading}
          >
            <Zap size={16} />
            <span>
              {isManaged
                ? 'Consult Pro AI Architect ⚡'
                : hasKey
                ? 'Analyze with BYOK AI ⚡'
                : 'Configure AI Engine / Key'}
            </span>
          </button>
        </div>
      )}

      {/* Interactive Debate Thread with Auto-Scroll (Req 2.4) */}
      {turns.length > 0 && (
        <div className="debate-thread-container">
          <div className="debate-header">
            <div className="debate-title-row">
              <MessageSquare size={16} />
              <h4>Architectural Peer Debate</h4>
            </div>
            <div className="debate-meta-row">
              <span className="turns-badge">
                {turnsRemaining > 0 ? `${turnsRemaining} turns remaining` : 'Debate finalized'}
              </span>
              <AppTooltip content="Reset debate and start a fresh problem">
                <button type="button" className="reset-debate-btn" onClick={handleReset}>
                  <RotateCcw size={13} /> New Problem
                </button>
              </AppTooltip>
            </div>
          </div>

          <div className="chat-bubbles-stack">
            {turns.map((turn, i) => (
              <div key={i} className={`chat-bubble ${turn.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <span className="bubble-role">{turn.role === 'user' ? 'You' : 'Staff Architect AI'}</span>
                <p className="bubble-content">{turn.content}</p>
              </div>
            ))}
            {/* Auto-scroll anchor point */}
            <div ref={messagesEndRef} />
          </div>

          {turnsRemaining > 0 ? (
            <div className="challenge-input-row">
              <input
                type="text"
                className="challenge-input"
                placeholder="Push back or probe trade-offs: 'Isn't Strategy overkill here? Why not a switch?'"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendChallenge();
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="primary-btn challenge-send-btn"
                onClick={handleSendChallenge}
                disabled={!challengeInput.trim() || isLoading}
                aria-label="Send challenge"
              >
                <Send size={15} />
              </button>
            </div>
          ) : (
            <div className="debate-closed-callout">
              <CheckCircle2 size={16} />
              <p>Decision debate concluded. Review your finalized verdict or record to ledger below.</p>
            </div>
          )}
        </div>
      )}

      {/* Verdict Action Trigger Bar (Stage-3 Replacement for Truncated Card) */}
      {lastVerdict && (
        <div ref={verdictSectionRef} className="verdict-action-trigger-bar">
          <div className="trigger-bar-info">
            <div className="trigger-bar-eyebrow">
              <span className={`category-tag cat-${lastVerdict.primaryPattern.category.toLowerCase()}`}>
                {lastVerdict.primaryPattern.category}
              </span>
              <span className="confidence-badge">
                <Zap size={12} /> {lastVerdict.primaryPattern.confidence}% FIT
              </span>
            </div>
            <h4 className="trigger-bar-title">{lastVerdict.primaryPattern.name}</h4>
            <p className="trigger-bar-rationale">{lastVerdict.primaryPattern.architecturalRationale}</p>
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
