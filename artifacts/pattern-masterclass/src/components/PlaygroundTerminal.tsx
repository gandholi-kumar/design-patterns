import React from 'react';
import { Terminal, Copy, Trash2, CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from 'lucide-react';
import type { RunResult } from '../hooks/useCodeRunner';

interface PlaygroundTerminalProps {
  result: RunResult;
  isRunning: boolean;
  onClear: () => void;
}

export const PlaygroundTerminal: React.FC<PlaygroundTerminalProps> = ({
  result,
  isRunning,
  onClear,
}) => {
  const hasOutput = result.stdout.length > 0 || result.stderr.length > 0;

  const handleCopy = () => {
    const text = [...result.stdout, ...result.stderr].join('\n');
    if (text) {
      navigator.clipboard?.writeText(text);
    }
  };

  const renderStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="terminal-status-badge status-running">
          <Loader2 size={12} className="spin-icon" /> Running…
        </span>
      );
    }

    switch (result.status) {
      case 'success':
        return (
          <span className="terminal-status-badge status-success">
            <CheckCircle2 size={12} /> Finished in {result.durationMs}ms (Exit 0)
          </span>
        );
      case 'compile_error':
        return (
          <span className="terminal-status-badge status-error">
            <XCircle size={12} /> Compile Error ({result.durationMs}ms)
          </span>
        );
      case 'runtime_error':
        return (
          <span className="terminal-status-badge status-error">
            <AlertTriangle size={12} /> Runtime Error (Exit {result.exitCode})
          </span>
        );
      case 'timeout':
        return (
          <span className="terminal-status-badge status-timeout">
            <Clock size={12} /> Timed Out ({result.durationMs}ms)
          </span>
        );
      default:
        return (
          <span className="terminal-status-badge status-idle">
            <span className="idle-pip" /> Ready
          </span>
        );
    }
  };

  return (
    <div className="output-card playground-terminal-card" aria-label="Console Output">
      <div className="output-head">
        <div className="output-title-group">
          <Terminal size={14} className="terminal-title-icon" />
          <b className="terminal-title-text">Console</b>
          {renderStatusBadge()}
        </div>

        <div className="output-tools">
          {hasOutput && (
            <button
              type="button"
              className="subtle-btn terminal-btn"
              onClick={handleCopy}
              title="Copy output to clipboard"
            >
              <Copy size={12} />
              <span>Copy</span>
            </button>
          )}
          <button
            type="button"
            className="clear-output"
            onClick={onClear}
            disabled={!hasOutput && !isRunning}
            data-testid="clear-output"
            title="Clear console output"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="output-body playground-terminal-body" aria-live="polite">
        {isRunning && !hasOutput ? (
          <div className="output-placeholder running">
            <Loader2 size={16} className="spin-icon" />
            <span>Compiling and linking project files…</span>
          </div>
        ) : hasOutput ? (
          <div className="terminal-log-flow">
            {result.stdout.map((line, i) => (
              <div key={`out-${i}`} className="output-line stdout">
                <span className="output-caret">›</span>
                <code>{line}</code>
              </div>
            ))}
            {result.stderr.map((line, i) => (
              <div key={`err-${i}`} className="output-line stderr">
                <span className="output-caret err">✕</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
        ) : (
          <div className="output-placeholder">
            <span className="terminal-prompt">›</span>
            <span>Click &ldquo;Run example&rdquo; or press Ctrl+Enter to execute your multi-file project.</span>
          </div>
        )}
      </div>
    </div>
  );
};
