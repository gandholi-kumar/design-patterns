import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, FileCode, Star, Edit2 } from 'lucide-react';

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  isEntryPoint: boolean;
}

interface PlaygroundFileTabsProps {
  files: ProjectFile[];
  activeFileId: string;
  language: 'typescript' | 'java';
  onSelectFile: (fileId: string) => void;
  onAddFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

export const PlaygroundFileTabs: React.FC<PlaygroundFileTabsProps> = ({
  files,
  activeFileId,
  language,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
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
      alert(`A file named "${name}" already exists.`);
      return;
    }

    onAddFile(name);
    setIsAdding(false);
    setNewFileName('');
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.isEntryPoint) return; // Entry point cannot be renamed
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

    onRenameFile(editingFileId, name);
    setEditingFileId(null);
  };

  return (
    <div className="playground-tab-bar" role="tablist" aria-label="Project Files">
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
              tabIndex={0}
              className={`playground-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFile(file.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectFile(file.id);
              }}
              title={file.isEntryPoint ? `${file.name} (Entry point)` : file.name}
            >
              <FileCode size={13} className="tab-icon" />
              <span className="tab-name">{file.name}</span>

              {file.isEntryPoint ? (
                <span className="tab-badge" title="Primary Entry Class">
                  <Star size={10} fill="currentColor" /> Entry
                </span>
              ) : (
                <div className="tab-actions">
                  <button
                    type="button"
                    className="tab-action-btn"
                    onClick={(e) => handleStartRename(file, e)}
                    title="Rename file"
                    aria-label={`Rename ${file.name}`}
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    type="button"
                    className="tab-action-btn tab-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${file.name}"?`)) {
                        onDeleteFile(file.id);
                      }
                    }}
                    title="Delete file"
                    aria-label={`Delete ${file.name}`}
                  >
                    <X size={12} />
                  </button>
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
          <button
            type="button"
            className="playground-add-tab-btn"
            onClick={handleStartAdd}
            title={`Add new ${language === 'java' ? 'Java' : 'TypeScript'} file`}
            data-testid="add-file-tab"
          >
            <Plus size={13} />
            <span>New File</span>
          </button>
        )}
      </div>
    </div>
  );
};
