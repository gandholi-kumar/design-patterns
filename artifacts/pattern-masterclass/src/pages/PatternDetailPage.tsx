import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Code2,
  Lightbulb,
} from 'lucide-react';
import { PATTERNS, type Pattern } from '../data';
import { PatternDiagrams } from '../PatternDiagrams';
import {
  PatternCode,
  PatternOverview,
  PatternTradeoffs,
} from '../components/PatternDetailSections';

type DetailTab = 'overview' | 'code' | 'diagrams' | 'trade-offs';

const categoryStyle: Record<string, string> = {
  Creational: 'tag-create',
  Structural: 'tag-structure',
  Behavioral: 'tag-behave',
};

interface PatternDetailPageProps {
  id: string;
  saved: {
    theme: 'light' | 'dark';
    bookmarks: string[];
  };
  onBookmark: (id: string) => void;
  goPlayground: (patternId: string) => void;
}

export function PatternDetailPage({
  id,
  saved,
  onBookmark,
  goPlayground,
}: PatternDetailPageProps) {
  const [, setLoc] = useLocation();
  const [tab, setTab] = useState<DetailTab>('overview');

  const pattern = useMemo(() => PATTERNS.find(p => p.id === id), [id]);

  // Extract preserved search and filter parameters from URL
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const familyFilter = queryParams.get('family');
  const searchQuery = queryParams.get('q');

  const backLabel = useMemo(() => {
    if (familyFilter && familyFilter !== 'All patterns') {
      return `Back to ${familyFilter} patterns`;
    }
    if (searchQuery) {
      return `Back to results ("${searchQuery}")`;
    }
    return 'Back to library';
  }, [familyFilter, searchQuery]);

  const handleBack = () => {
    const qs = window.location.search;
    setLoc(`/${qs}`);
  };

  // Determine current category list for previous / next navigation
  const activeList = useMemo(() => {
    if (familyFilter && familyFilter !== 'All patterns') {
      return PATTERNS.filter(p => p.category === familyFilter);
    }
    return PATTERNS;
  }, [familyFilter]);

  const currentIndex = useMemo(() => {
    if (!pattern) return 0;
    const idx = activeList.findIndex(p => p.id === pattern.id);
    return idx >= 0 ? idx : 0;
  }, [pattern, activeList]);

  const prevPattern = activeList[(currentIndex - 1 + activeList.length) % activeList.length];
  const nextPattern = activeList[(currentIndex + 1) % activeList.length];

  const navigateToPattern = (targetId: string) => {
    const qs = window.location.search;
    setLoc(`/pattern/${targetId}${qs}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        handleBack();
      } else if (e.key === 'ArrowLeft' && prevPattern) {
        navigateToPattern(prevPattern.id);
      } else if (e.key === 'ArrowRight' && nextPattern) {
        navigateToPattern(nextPattern.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPattern, nextPattern]);

  if (!pattern) {
    return (
      <div className="page-content reveal not-found-pattern">
        <span className="eyebrow">404 / PATTERN NOT FOUND</span>
        <h2>Unknown design pattern: {id}</h2>
        <p>The pattern you are looking for does not exist in this catalog.</p>
        <button className="primary-btn" onClick={() => setLoc('/')}>
          <ArrowLeft size={15} /> Return to library
        </button>
      </div>
    );
  }

  const isSaved = saved.bookmarks.includes(pattern.id);
  const tabs: DetailTab[] = ['overview', 'code', 'diagrams', 'trade-offs'];

  return (
    <div className="page-content reveal pattern-page-layout">
      {/* Top Navigation Bar with Contextual Back Button */}
      <nav className="pattern-page-topbar" aria-label="Pattern page navigation">
        <button
          className="pattern-back-btn"
          onClick={handleBack}
          aria-label={backLabel}
          data-testid="pattern-back-btn"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </button>

        <div className="pattern-page-actions">
          <button
            className={`bookmark-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onBookmark(pattern.id)}
            aria-label={`${isSaved ? 'Remove' : 'Save'} ${pattern.name}`}
            data-testid="page-bookmark-btn"
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{isSaved ? 'Saved' : 'Save pattern'}</span>
          </button>

          <button
            className="primary-btn playground-link-btn"
            onClick={() => goPlayground(pattern.id)}
            data-testid="page-playground-btn"
          >
            <Code2 size={15} />
            <span>Open in playground</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Header Section */}
      <header className="pattern-page-header">
        <div className="pattern-page-meta">
          <span className={`category-tag ${categoryStyle[pattern.category]}`}>
            {pattern.category}
          </span>
          <span className="pattern-page-index">
            PATTERN {String(currentIndex + 1).padStart(2, '0')} / {String(activeList.length).padStart(2, '0')}
          </span>
        </div>

        <h1 className="pattern-page-title">
          {pattern.name}
          <span>.</span>
        </h1>

        <p className="pattern-page-tagline">{pattern.tagline}</p>

        <div className="pattern-page-memory">
          <Lightbulb size={16} />
          <span>{pattern.memoryHook}</span>
          <i>MEMORY HOOK</i>
        </div>
      </header>

      {/* The 4 Standard Tabs */}
      <div className="detail-tabs pattern-page-tabs" role="tablist" aria-label="Pattern detail sections">
        {tabs.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`page-tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            data-testid={`page-tab-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Tab Content Area */}
      <main className="pattern-page-main">
        {tab === 'overview' && <PatternOverview pattern={pattern} />}
        {tab === 'code' && (
          <PatternCode
            pattern={pattern}
            goCode={() => goPlayground(pattern.id)}
          />
        )}
        {tab === 'diagrams' && (
          <PatternDiagrams
            patternId={pattern.id}
            patternName={pattern.name}
            theme={saved.theme}
          />
        )}
        {tab === 'trade-offs' && <PatternTradeoffs pattern={pattern} />}
      </main>

      {/* Bottom Sequential Navigation Footer */}
      <footer className="pattern-page-footer">
        {prevPattern && (
          <button
            className="pattern-nav-card prev-card"
            onClick={() => navigateToPattern(prevPattern.id)}
            data-testid="pattern-prev-card"
          >
            <div className="nav-card-arrow">
              <ChevronLeft size={18} />
            </div>
            <div className="nav-card-text">
              <span className="eyebrow">PREVIOUS PATTERN</span>
              <h4>{prevPattern.name}</h4>
              <small>{prevPattern.category}</small>
            </div>
          </button>
        )}

        {nextPattern && (
          <button
            className="pattern-nav-card next-card"
            onClick={() => navigateToPattern(nextPattern.id)}
            data-testid="pattern-next-card"
          >
            <div className="nav-card-text">
              <span className="eyebrow">NEXT PATTERN</span>
              <h4>{nextPattern.name}</h4>
              <small>{nextPattern.category}</small>
            </div>
            <div className="nav-card-arrow">
              <ChevronRight size={18} />
            </div>
          </button>
        )}
      </footer>
    </div>
  );
}
