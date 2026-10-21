import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  X,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import type { Pattern } from '../../data';
import type { Perspective } from '../../pattern-types';
import {
  PatternOverview,
  PatternCode,
  PatternTradeoffs,
} from '../PatternDetailSections';
import { PatternDiagrams } from '../../PatternDiagrams';

export interface PatternDialogProps {
  pattern: Pattern;
  isBookmarked: boolean;
  theme: 'light' | 'dark';
  onClose: () => void;
  onBookmark: (id: string) => void;
  goCode: () => void;
  perspective?: Perspective;
}

const categoryStyle: Record<string, string> = {
  Creational: 'tag-create',
  Structural: 'tag-structure',
  Behavioral: 'tag-behave',
};

const tabs = ['overview', 'code', 'diagrams', 'trade-offs'];

export function PatternDialog({
  pattern: p,
  isBookmarked,
  theme,
  onClose,
  onBookmark,
  goCode,
  perspective = 'canonical',
}: PatternDialogProps) {
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="pattern-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pattern-title"
      >
        <div className="modal-accent" />
        <div className="modal-head">
          <span className={`category-tag ${categoryStyle[p.category]}`}>
            {p.category}
          </span>
          <div>
            <button
              type="button"
              className={`bookmark-btn ${isBookmarked ? 'saved' : ''}`}
              onClick={() => onBookmark(p.id)}
              aria-label="Save pattern"
              data-testid="detail-bookmark"
            >
              {isBookmarked ? (
                <BookmarkCheck size={17} />
              ) : (
                <Bookmark size={17} />
              )}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Close details"
              data-testid="close-pattern-details"
            >
              <X size={19} />
            </button>
          </div>
        </div>
        <span className="eyebrow">PATTERN NOTES / {p.category.toUpperCase()}</span>
        <h2 id="pattern-title">
          {p.name}
          <span>.</span>
        </h2>
        <p className="modal-tagline">{p.tagline}</p>
        <div className="modal-memory">
          <Lightbulb size={16} />
          <span>{p.memoryHook}</span>
          <i>MEMORY HOOK</i>
        </div>
        <div
          className="detail-tabs"
          role="tablist"
          aria-label="Pattern details"
        >
          {tabs.map((t) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? 'active' : ''}
              key={t}
              onClick={() => setTab(t)}
              data-testid={`detail-tab-${t}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="detail-scroll">
          {tab === 'overview' && (
            <PatternOverview pattern={p} perspective={perspective} />
          )}
          {tab === 'code' && (
            <PatternCode pattern={p} goCode={goCode} perspective={perspective} />
          )}
          {tab === 'diagrams' && (
            <PatternDiagrams
              patternId={p.id}
              patternName={p.name}
              theme={theme}
              perspective={perspective}
            />
          )}
          {tab === 'trade-offs' && <PatternTradeoffs pattern={p} />}
        </div>
        <div className="modal-foot">
          <span>
            <kbd>ESC</kbd> to close
          </span>
          <button
            type="button"
            className="text-button"
            onClick={onClose}
          >
            Back to library <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
