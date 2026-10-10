import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow?: string;
  badge?: React.ReactNode;
  subtitle?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}

export function NotesDrawer({
  isOpen,
  onClose,
  title,
  eyebrow = 'REFERENCE NOTES',
  badge,
  subtitle,
  headerActions,
  footer,
  width = '34rem',
  children,
}: NotesDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="notes-drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      aria-hidden={!isOpen}
    >
      <section
        ref={drawerRef}
        className="notes-drawer-panel"
        style={{ width: `min(${width}, 100vw)` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-drawer-title"
      >
        {/* Accent bar at the top */}
        <div className="modal-accent" />

        {/* Drawer Header */}
        <header className="notes-drawer-header">
          <div className="notes-drawer-head-top">
            <div className="notes-drawer-eyebrow-group">
              <span className="eyebrow">
                <i className="eyebrow-line" />
                {eyebrow}
              </span>
              {badge && <div className="notes-drawer-badge">{badge}</div>}
            </div>
            <div className="notes-drawer-controls">
              {headerActions}
              <button
                type="button"
                className="icon-btn notes-drawer-close-btn"
                onClick={onClose}
                aria-label="Close notes drawer"
                data-testid="close-notes-drawer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="notes-drawer-title-row">
            <h2 id="notes-drawer-title" className="notes-drawer-title">
              {title}
            </h2>
          </div>

          {subtitle && <p className="notes-drawer-subtitle">{subtitle}</p>}
        </header>

        {/* Scrollable Body Content */}
        <div className="notes-drawer-body">{children}</div>

        {/* Optional Footer */}
        <footer className="notes-drawer-footer">
          {footer ? (
            footer
          ) : (
            <div className="notes-drawer-default-footer">
              <span className="notes-drawer-shortcut-hint">
                Press <kbd>ESC</kbd> to close
              </span>
              <button
                type="button"
                className="subtle-btn notes-drawer-dismiss-btn"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          )}
        </footer>
      </section>
    </div>,
    document.body
  );
}
