import { Loader2, Check, AlertCircle, RefreshCw } from "lucide-react";
import type { SaveStatus } from "../../hooks/usePatternNotes";

interface NotesSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  onRetry?: () => void;
}

export function NotesSaveIndicator({
  status,
  lastSavedAt,
  onRetry,
}: NotesSaveIndicatorProps) {
  if (status === "unsaved") {
    return (
      <div
        className="flex items-center gap-1.5 text-xs text-amber-400 font-medium animate-pulse"
        title="Unsaved changes (will auto-save in 2 seconds)"
        data-testid="notes-status-unsaved"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        <span>Unsaved</span>
      </div>
    );
  }

  if (status === "saving") {
    return (
      <div
        className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
        data-testid="notes-status-saving"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div
        className="flex items-center gap-1 text-xs text-emerald-400 font-medium transition-opacity duration-300"
        data-testid="notes-status-saved"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Saved</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="flex items-center gap-1.5 text-xs text-rose-400 font-medium"
        data-testid="notes-status-error"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Failed</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-[10px] hover:bg-rose-900/60 transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // Idle state: show faint last saved timestamp if available
  if (lastSavedAt) {
    const formatted = lastSavedAt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="text-[11px] text-muted-foreground/60 select-none">
        Saved {formatted}
      </span>
    );
  }

  return null;
}
