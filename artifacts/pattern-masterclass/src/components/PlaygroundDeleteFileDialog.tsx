import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface PlaygroundDeleteFileDialogProps {
  isOpen: boolean;
  fileName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PlaygroundDeleteFileDialog: React.FC<PlaygroundDeleteFileDialogProps> = ({
  isOpen,
  fileName,
  onCancel,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 select-text">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <AlertDialogTitle className="text-sm font-bold text-foreground">
                Delete File
              </AlertDialogTitle>
              <span className="text-[11px] text-muted-foreground">
                Remove file from active project tabs
              </span>
            </div>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2.5">
            Are you sure you want to delete <strong className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">{fileName}</strong>?
            Any unsaved modifications in this file will be permanently discarded.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 pt-3 border-t border-border/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            data-testid="cancel-delete-file-btn"
            className="px-3.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            data-testid="confirm-delete-file-btn"
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Delete File</span>
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
