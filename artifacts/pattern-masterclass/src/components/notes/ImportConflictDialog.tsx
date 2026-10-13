import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { AlertTriangle, GitMerge, RefreshCw, SkipForward } from "lucide-react";

export type ImportCollisionStrategy = "append" | "overwrite" | "skip";

interface ImportConflictDialogProps {
  isOpen: boolean;
  conflictingPatternNames: string[];
  totalIncoming: number;
  initialStrategy?: ImportCollisionStrategy;
  onCancel: () => void;
  onConfirm: (strategy: ImportCollisionStrategy, rememberAsDefault: boolean) => void;
}

export function ImportConflictDialog({
  isOpen,
  conflictingPatternNames,
  totalIncoming,
  initialStrategy = "append",
  onCancel,
  onConfirm,
}: ImportConflictDialogProps) {
  const [selectedStrategy, setSelectedStrategy] =
    useState<ImportCollisionStrategy>(initialStrategy);
  const [rememberAsDefault, setRememberAsDefault] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 select-text">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Import Conflict Detected
              </AlertDialogTitle>
              <span className="text-[11px] text-muted-foreground">
                {conflictingPatternNames.length} of {totalIncoming} imported notes already have content
              </span>
            </div>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            The incoming bundle contains notes for patterns you have already annotated. Choose how you would like to resolve existing content:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Conflicting pattern pills */}
        <div className="my-1 p-2 rounded-lg bg-muted/40 border border-border/50 max-h-24 overflow-y-auto flex flex-wrap gap-1.5 text-[11px]">
          {conflictingPatternNames.map((name) => (
            <span
              key={name}
              className="px-2 py-0.5 rounded-md bg-card border border-border/60 text-foreground font-medium"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Strategy Options */}
        <div className="flex flex-col gap-2 my-2">
          {/* 1. Append (Default) */}
          <label
            onClick={() => setSelectedStrategy("append")}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedStrategy === "append"
                ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                : "bg-card/40 border-border/60 hover:border-border hover:bg-card/60"
            }`}
          >
            <input
              type="radio"
              name="import-strategy"
              checked={selectedStrategy === "append"}
              onChange={() => setSelectedStrategy("append")}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">
                  Append (Merge)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Recommended Default
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Keeps your existing notes and appends imported blocks below an imported divider.
              </p>
            </div>
          </label>

          {/* 2. Overwrite */}
          <label
            onClick={() => setSelectedStrategy("overwrite")}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedStrategy === "overwrite"
                ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                : "bg-card/40 border-border/60 hover:border-border hover:bg-card/60"
            }`}
          >
            <input
              type="radio"
              name="import-strategy"
              checked={selectedStrategy === "overwrite"}
              onChange={() => setSelectedStrategy("overwrite")}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-foreground">
                  Overwrite (Replace)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Replaces current notes for conflicting patterns with the incoming version.
              </p>
            </div>
          </label>

          {/* 3. Skip */}
          <label
            onClick={() => setSelectedStrategy("skip")}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedStrategy === "skip"
                ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                : "bg-card/40 border-border/60 hover:border-border hover:bg-card/60"
            }`}
          >
            <input
              type="radio"
              name="import-strategy"
              checked={selectedStrategy === "skip"}
              onChange={() => setSelectedStrategy("skip")}
              className="mt-1 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <SkipForward className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-foreground">
                  Skip Existing
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Leaves current notes untouched; only imports notes for unannotated patterns.
              </p>
            </div>
          </label>
        </div>

        {/* Remember choice checkbox */}
        <label className="flex items-center gap-2 mt-2 px-1 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberAsDefault}
            onChange={(e) => setRememberAsDefault(e.target.checked)}
            className="rounded border-border text-amber-500 focus:ring-amber-400"
          />
          <span>Remember this choice as default for future imports</span>
        </label>

        <AlertDialogFooter className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedStrategy, rememberAsDefault)}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors shadow-sm"
          >
            Apply & Import
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
