import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { RotateCcw } from 'lucide-react';

interface PlaygroundResetConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PlaygroundResetConfirmDialog: React.FC<PlaygroundResetConfirmDialogProps> = ({
  isOpen,
  title,
  onCancel,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 select-text">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Reset Project Files
              </AlertDialogTitle>
              <span className="text-[11px] text-muted-foreground">
                Revert code back to template starter files
              </span>
            </div>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2.5">
            Reset <strong className="text-foreground">{title}</strong> files back to original template?
            Any custom code edits will be reverted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            data-testid="cancel-reset-project-btn"
            className="px-3.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="confirm-reset-project-btn"
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Reset Project</span>
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
