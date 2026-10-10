import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Code2, ChevronDown, Search, Check, X } from 'lucide-react';
import { PATTERNS } from '../data';
import type { Pattern, Category } from '../data';

interface PlaygroundPatternComboboxProps {
  selectedPatternId: string;
  onSelectPattern: (patternId: string) => void;
}

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  Creational: {
    bg: 'rgba(212, 163, 86, 0.15)',
    text: '#d4a356',
    border: 'rgba(212, 163, 86, 0.3)',
  },
  Structural: {
    bg: 'rgba(78, 148, 197, 0.15)',
    text: '#5ea2d6',
    border: 'rgba(78, 148, 197, 0.3)',
  },
  Behavioral: {
    bg: 'rgba(100, 165, 125, 0.15)',
    text: '#5db084',
    border: 'rgba(100, 165, 125, 0.3)',
  },
};

export const PlaygroundPatternCombobox: React.FC<PlaygroundPatternComboboxProps> = ({
  selectedPatternId,
  onSelectPattern,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentPattern = useMemo(() => {
    return PATTERNS.find((p) => p.id === selectedPatternId) || PATTERNS[0];
  }, [selectedPatternId]);

  // Filter patterns based on search query
  const filteredPatterns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PATTERNS;

    return PATTERNS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.intent.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Keep highlighted item in view
  useEffect(() => {
    if (highlightedIndex >= filteredPatterns.length) {
      setHighlightedIndex(Math.max(0, filteredPatterns.length - 1));
    }
  }, [filteredPatterns.length, highlightedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setHighlightedIndex(0);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (pattern: Pattern) => {
    onSelectPattern(pattern.id);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredPatterns.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredPatterns.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPatterns[highlightedIndex]) {
        handleSelect(filteredPatterns[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`combobox-container ${isOpen ? 'is-open' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className="combobox-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selected pattern: ${currentPattern.name}. Click to search or switch pattern.`}
        data-testid="playground-pattern-combobox"
      >
        <span className="combobox-trigger-icon">
          <Code2 size={15} />
        </span>
        <span className="combobox-trigger-text">
          <span className="combobox-selected-name">{currentPattern.name}</span>
          <span
            className="combobox-category-pill"
            style={{
              backgroundColor: CATEGORY_COLORS[currentPattern.category]?.bg,
              color: CATEGORY_COLORS[currentPattern.category]?.text,
              borderColor: CATEGORY_COLORS[currentPattern.category]?.border,
            }}
          >
            {currentPattern.category}
          </span>
        </span>
        <span className={`combobox-chevron ${isOpen ? 'rotated' : ''}`}>
          <ChevronDown size={14} />
        </span>
      </button>

      {/* Floating Dropdown Overlay */}
      {isOpen && (
        <div
          className="combobox-dropdown"
          role="listbox"
          aria-label="Design Patterns catalog"
        >
          {/* Search Box Header */}
          <div className="combobox-search-header">
            <Search size={14} className="combobox-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder="Search 23 patterns (e.g. factory, observer, singleton)..."
              className="combobox-search-input"
              aria-label="Search pattern list"
              data-testid="combobox-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="combobox-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Patterns Count / Category Info */}
          <div className="combobox-results-count">
            <span>
              {filteredPatterns.length} pattern{filteredPatterns.length === 1 ? '' : 's'} available
            </span>
          </div>

          {/* Options List */}
          <div ref={listRef} className="combobox-options-list">
            {filteredPatterns.length === 0 ? (
              <div className="combobox-empty-state">
                <p>No design pattern found matching &ldquo;{searchQuery}&rdquo;</p>
                <small>Try searching by category, pattern name, or intent</small>
              </div>
            ) : (
              filteredPatterns.map((p, idx) => {
                const isSelected = p.id === selectedPatternId;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={p.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`combobox-option-item ${isSelected ? 'selected' : ''} ${
                      isHighlighted ? 'highlighted' : ''
                    }`}
                    onClick={() => handleSelect(p)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div className="combobox-option-content">
                      <div className="combobox-option-title-row">
                        <span className="combobox-option-name">{p.name}</span>
                        <span
                          className="combobox-category-badge"
                          style={{
                            backgroundColor: CATEGORY_COLORS[p.category]?.bg,
                            color: CATEGORY_COLORS[p.category]?.text,
                            borderColor: CATEGORY_COLORS[p.category]?.border,
                          }}
                        >
                          {p.category}
                        </span>
                      </div>
                      <p className="combobox-option-intent">{p.tagline || p.intent}</p>
                    </div>

                    {isSelected && (
                      <span className="combobox-check-icon">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
