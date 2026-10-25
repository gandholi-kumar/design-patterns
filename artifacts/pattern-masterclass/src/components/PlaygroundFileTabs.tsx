import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, FileCode, Star, Edit2, AlertCircle } from 'lucide-react';
import { AppTooltip } from './ui/app-tooltip';
import { PlaygroundDeleteFileDialog } from './PlaygroundDeleteFileDialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  isEntryPoint?: boolean;
}

interface PlaygroundFileTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  language: 'typescript' | 'java';
  disabled?: boolean;
  onSelectFile: (fileId: string) => void;
  onAddFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

export const PlaygroundFileTabs: React.FC<PlaygroundFileTabsProps> = ({
  files,
  activeFileId,
  language,
  disabled = false,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const [nameConflictError, setNameConflictError] = useState<string | null>(null);

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingFileId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingFileId]);

  const defaultExt = language === 'java' ? '.java' : '.ts';

  const handleStartAdd = () => {
    if (disabled) return;
    setIsAdding(true);
    setNewFileName('');
  };

  const handleConfirmAdd = () => {
    let name = newFileName.trim();
    if (!name) {
      setIsAdding(false);
      return;
    }
    if (!name.endsWith(defaultExt)) {
      name += defaultExt;
    }

    // Check duplicate
    if (files.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setNameConflictError(name);
      return;
    }

    onAddFile(name);
    setIsAdding(false);
    setNewFileName('');
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || file.isEntryPoint) return; // Entry point cannot be renamed
    setEditingFileId(file.id);
    setEditName(file.name);
  };

  const handleConfirmRename = () => {
    if (!editingFileId) return;
    let name = editName.trim();
    if (!name) {
      setEditingFileId(null);
      return;
    }
    if (!name.endsWith(defaultExt)) {
      name += defaultExt;
    }

    // Check duplicate excluding self
    if (files.some((f) => f.id !== editingFileId && f.name.toLowerCase() === name.toLowerCase())) {
      setNameConflictError(name);
      setEditingFileId(null);
      return;
    }

    onRenameFile(editingFileId, name);
    setEditingFileId(null);
  };

  return (
    <>
      <div className={`playground-tab-bar ${disabled ? 'tabs-disabled' : ''}`} role="tablist" aria-label="Project Files">
        <div className="playground-tabs-scroll">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingFileId;

            if (isEditing) {
              return (
                <div key={file.id} className="playground-tab active editing">
                  <FileCode size={13} className="tab-icon" />
                  <input
                    ref={editInputRef}
                    className="tab-inline-input"
                    value={editName}
                    disabled={disabled}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmRename();
                      if (e.key === 'Escape') setEditingFileId(null);
                    }}
                    onBlur={handleConfirmRename}
                    aria-label="Rename file"
                  />
                </div>
              );
            }

            return (
              <div
                key={file.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={disabled ? -1 : 0}
                draggable={false}
                className={`playground-tab ${isActive ? 'active' : ''} ${file.isEntryPoint ? 'pinned-tab' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => {
                  if (!disabled) onSelectFile(file.id);
                }}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) onSelectFile(file.id);
                }}
                title={file.isEntryPoint ? `${file.name} (Pinned Starting Entrypoint)` : file.name}
              >
                <FileCode size={13} className="tab-icon" />
                <span className="tab-name">{file.name}</span>

                {file.isEntryPoint ? (
                  <AppTooltip content="Primary Entry Class (Main execution entrypoint)">
                    <span className="tab-badge">
                      <Star size={10} fill="currentColor" /> Entry
                    </span>
                  </AppTooltip>
                ) : (
                  <div className="tab-actions">
                    <AppTooltip content={disabled ? "Disabled during execution" : "Rename file"}>
                      <button
                        type="button"
                        className="tab-action-btn"
                        disabled={disabled}
                        onClick={(e) => handleStartRename(file, e)}
                        aria-label={`Rename ${file.name}`}
                      >
                        <Edit2 size={11} />
                      </button>
                    </AppTooltip>
                    <AppTooltip content={disabled ? "Disabled during execution" : "Delete file"}>
                      <button
                        type="button"
                        className="tab-action-btn tab-close-btn"
                        disabled={disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (disabled) return;
                          setFileToDelete(file);
                        }}
                        aria-label={`Delete ${file.name}`}
                      >
                        <X size={12} />
                      </button>
                    </AppTooltip>
                  </div>
                )}
              </div>
            );
          })}

          {isAdding ? (
            <div className="playground-tab active editing">
              <Plus size={13} className="tab-icon" />
              <input
                ref={addInputRef}
                className="tab-inline-input"
                placeholder={`Filename${defaultExt}`}
                value={newFileName}
                disabled={disabled}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                onBlur={handleConfirmAdd}
                aria-label="New filename"
              />
            </div>
          ) : (
            <AppTooltip content={disabled ? "Disabled during execution" : `Add new ${language === 'java' ? 'Java' : 'TypeScript'} file`}>
              <button
                type="button"
                className="playground-add-tab-btn"
                disabled={disabled}
                onClick={handleStartAdd}
                data-testid="add-file-tab"
                aria-label={`Add new ${language === 'java' ? 'Java' : 'TypeScript'} file`}
              >
                <Plus size={13} />
                <span>New File</span>
              </button>
            </AppTooltip>
          )}
        </div>
      </div>

      {/* Custom Radix-based Delete File Confirmation Dialog */}
      <PlaygroundDeleteFileDialog
        isOpen={!!fileToDelete}
        fileName={fileToDelete?.name || ''}
        onCancel={() => setFileToDelete(null)}
        onConfirm={() => {
          if (fileToDelete) {
            onDeleteFile(fileToDelete.id);
            setFileToDelete(null);
          }
        }}
      />

      {/* Custom Radix-based File Collision Alert Dialog */}
      {nameConflictError && (
        <AlertDialog open={!!nameConflictError} onOpenChange={() => setNameConflictError(null)}>
          <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100 select-text">
            <AlertDialogHeader>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <AlertDialogTitle className="text-sm font-bold text-foreground">
                    Duplicate File Name
                  </AlertDialogTitle>
                  <span className="text-[11px] text-muted-foreground">
                    File names must be unique within project
                  </span>
                </div>
              </div>

              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2.5">
                A file named <strong className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">{nameConflictError}</strong> already exists in this playground project. Please choose a different name.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-4 pt-3 border-t border-border/40 flex justify-end">
              <button
                type="button"
                onClick={() => setNameConflictError(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Understood
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
