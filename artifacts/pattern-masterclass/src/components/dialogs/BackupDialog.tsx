import React from 'react';
import {
  X,
  Settings2,
  Moon,
  Sun,
  FileJson2,
  Download,
  ArrowUpRight,
  Code2,
  ShieldCheck,
} from 'lucide-react';

export interface BackupDialogProps {
  theme: string;
  zipBusy: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  onExport: () => void;
  onRestore: (file?: File) => void;
  onZip: () => void;
  onDownloadSource: () => void;
}

export function BackupDialog({
  theme,
  zipBusy,
  onClose,
  toggleTheme,
  onExport,
  onRestore,
  onZip,
  onDownloadSource,
}: BackupDialogProps) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="backup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-title"
      >
        <div className="modal-head">
          <span className="eyebrow">YOUR WORKSPACE</span>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>
        <h2 id="backup-title">
          Keep your
          <br />
          <em>work close.</em>
        </h2>
        <p className="backup-intro">
          Everything stays in this browser. Carry your notes and learning history with you whenever you need.
        </p>

        <div className="setting-row">
          <div className="setting-icon">
            <Settings2 size={17} />
          </div>
          <div>
            <b>Appearance</b>
            <small>Choose the tone of your workspace</small>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            data-testid="settings-theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            {' '}
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="backup-actions">
          <button
            type="button"
            onClick={onExport}
            data-testid="export-json"
          >
            <FileJson2 size={17} />
            <span>
              <b>Export learning state</b>
              <small>Bookmarks, notes, settings · JSON</small>
            </span>
            <Download size={16} />
          </button>

          <label className="restore-action">
            <FileJson2 size={17} />
            <span>
              <b>Restore from backup</b>
              <small>Replace this browser's saved state</small>
            </span>
            <ArrowUpRight size={16} />
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => onRestore(e.target.files?.[0])}
              aria-label="Choose backup file"
              data-testid="restore-json"
            />
          </label>

          <button
            type="button"
            onClick={onZip}
            disabled={zipBusy}
            data-testid="download-project"
          >
            <Download size={17} />
            <span>
              <b>{zipBusy ? 'Preparing archive…' : 'Download project ZIP'}</b>
              <small>Pattern catalog, scenarios & local state</small>
            </span>
            <ArrowUpRight size={16} />
          </button>

          <button
            type="button"
            onClick={onDownloadSource}
            data-testid="download-source"
          >
            <Code2 size={17} />
            <span>
              <b>Download full workspace source</b>
              <small>Workspace code and setup files · ZIP</small>
            </span>
            <Download size={16} />
          </button>
        </div>

        <div className="privacy-note">
          <ShieldCheck size={16} />
          <span>
            <b>Private by design</b>
            <br />
            No account or sync. Learning data stays in this browser; the source ZIP contains workspace code and setup files only.
          </span>
        </div>
      </section>
    </div>
  );
}
