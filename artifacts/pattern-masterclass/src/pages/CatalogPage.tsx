import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers3,
  Search,
  Filter,
  ChevronDown,
  ArrowDownUp,
  Bookmark,
  BookmarkCheck,
  ArrowUpRight,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { PATTERNS, type Pattern } from '../data';
import { AppTooltip } from '../components/ui/app-tooltip';

const categoryStyle: Record<string, string> = {
  Creational: 'tag-create',
  Structural: 'tag-structure',
  Behavioral: 'tag-behave',
};

const families = ['Creational', 'Structural', 'Behavioral'] as const;

export interface CatalogPageProps {
  bookmarks: string[];
  savedOnly: boolean;
  clearSaved: () => void;
  onBookmark: (id: string) => void;
  onSelect: (p: Pattern) => void;
}

export function CatalogPage({
  bookmarks,
  savedOnly,
  clearSaved,
  onBookmark,
  onSelect,
}: CatalogPageProps) {
  const [filter, setFilter] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('family') || 'All patterns';
  });
  const [query, setQuery] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('q') || '';
  });
  const [searchInput, setSearchInput] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('q') || '';
  });
  const [sort, setSort] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('sort') || 'A–Z';
  });

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const sp = new URLSearchParams(window.location.search);
    if (filter !== 'All patterns') sp.set('family', filter);
    else sp.delete('family');
    if (query.trim()) sp.set('q', query.trim());
    else sp.delete('q');
    if (sort !== 'A–Z') sp.set('sort', sort);
    else sp.delete('sort');
    const qs = sp.toString() ? `?${sp.toString()}` : '/';
    window.history.replaceState(null, '', qs);
  }, [filter, query, sort]);

  const handleSearch = () => {
    setQuery(searchInput.trim());
  };

  const list = useMemo(() => {
    let items = PATTERNS.filter(
      (p) =>
        (filter === 'All patterns' || p.category === filter) &&
        (!savedOnly || bookmarks.includes(p.id)) &&
        (!query ||
          `${p.name} ${p.category} ${p.tagline} ${p.intent}`
            .toLowerCase()
            .includes(query.toLowerCase()))
    );

    if (sort === 'A–Z') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Family') {
      items = [...items].sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      );
    } else {
      items = [...items].sort(
        (a, b) =>
          Number(bookmarks.includes(b.id)) - Number(bookmarks.includes(a.id)) ||
          a.name.localeCompare(b.name)
      );
    }
    return items;
  }, [filter, query, sort, bookmarks, savedOnly]);

  const clearFilters = () => {
    setSearchInput('');
    setQuery('');
    setFilter('All patterns');
    setSort('A–Z');
    window.history.replaceState(null, '', '/');
    if (savedOnly) clearSaved();
  };

  return (
    <div className="page-content reveal">
      <section className="catalog-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE ORIGINAL 23 · REIMAGINED FOR PRACTICE
          </div>
          <h1>
            Patterns are
            <br />
            <em>decisions</em> made visible.
          </h1>
          <p>
            A field guide to the recurring problems behind resilient software. Learn the shape,
            know the trade-off, recognize when it fits.
          </p>
          <div className="hero-meta">
            <span>
              <b>23</b> classic patterns
            </span>
            <span>
              <b>03</b> pattern families
            </span>
            <span>
              <b>01</b> working vocabulary
            </span>
          </div>
        </div>
        <div className="orbit-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit-core">
            <Layers3 size={25} />
          </div>
          <span className="orbit-node n1">01</span>
          <span className="orbit-node n2">02</span>
          <span className="orbit-node n3">03</span>
        </div>
      </section>

      <section className="catalog-toolbar">
        <div className="toolbar-title">
          <span className="eyebrow">THE LIBRARY</span>
          <h2>
            {savedOnly ? 'Your saved patterns' : 'Browse the collection'}{' '}
            <span>{list.length.toString().padStart(2, '0')}</span>
          </h2>
        </div>
        <div className="toolbar-controls">
          <div className="searchbox" role="search">
            <input
              ref={searchRef}
              aria-label="Search patterns"
              placeholder="Find a pattern…"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === '') setQuery('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              data-testid="pattern-search"
            />
            <AppTooltip content="Search patterns (Enter)">
              <button
                type="button"
                className="search-btn"
                onClick={handleSearch}
                aria-label="Search patterns"
                data-testid="search-btn"
              >
                <Search size={16} />
              </button>
            </AppTooltip>
          </div>

          <label className="select-wrap">
            <Filter size={14} />
            <select
              aria-label="Sort patterns"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              data-testid="pattern-sort"
            >
              <option>A–Z</option>
              <option>Family</option>
              <option>Saved first</option>
            </select>
            <ChevronDown size={13} />
          </label>
        </div>
      </section>

      <div className="filter-row" role="group" aria-label="Filter by pattern family">
        {['All patterns', ...families].map((f) => (
          <button
            type="button"
            className={`filter-pill ${filter === f ? 'chosen' : ''}`}
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f.toLowerCase().replace(' ', '-')}`}
          >
            {f}
            {f !== 'All patterns' && (
              <span>{PATTERNS.filter((p) => p.category === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {families
        .filter((f) => filter === 'All patterns' || filter === f)
        .map((family) => {
          const entries = list.filter((p) => p.category === family);
          if (!entries.length) return null;
          return (
            <section className={`family-section family-${family.toLowerCase()}`} key={family}>
              <div className="family-heading">
                <div className="family-index">
                  {family === 'Creational' ? 'I' : family === 'Structural' ? 'II' : 'III'}
                </div>
                <div>
                  <div className="family-label">{family.toUpperCase()} PATTERNS</div>
                  <h3>
                    {family === 'Creational'
                      ? 'How things come to be.'
                      : family === 'Structural'
                      ? 'How parts fit together.'
                      : 'How objects collaborate.'}
                  </h3>
                </div>
                <span className="family-total">
                  {entries.length} patterns <ArrowDownUp size={13} />
                </span>
              </div>
              <div className="pattern-grid">
                {entries.map((p, i) => (
                  <PatternCard
                    key={p.id}
                    pattern={p}
                    index={i}
                    isSaved={bookmarks.includes(p.id)}
                    onBookmark={() => onBookmark(p.id)}
                    onOpen={() => onSelect(p)}
                  />
                ))}
              </div>
            </section>
          );
        })}

      {list.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={21} />
          </div>
          <h3>Nothing in this corner.</h3>
          <p>
            {savedOnly
              ? 'Save a pattern with the bookmark icon and it will be waiting here.'
              : 'Try a different phrase, or clear the family filter.'}
          </p>
          <button type="button" className="text-button" onClick={clearFilters}>
            Clear filters <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="catalog-note">
        <Lightbulb size={17} />
        <p>
          <b>A useful question:</b> what is changing, and which part of the system should own that
          change?
        </p>
        <span>START HERE</span>
      </div>
    </div>
  );
}

interface PatternCardProps {
  pattern: Pattern;
  index: number;
  isSaved: boolean;
  onBookmark: () => void;
  onOpen: () => void;
}

export function PatternCard({ pattern: p, index, isSaved, onBookmark, onOpen }: PatternCardProps) {
  return (
    <article className="pattern-card" style={{ animationDelay: `${index * 35}ms` }}>
      <div className="card-top">
        <span className={`category-tag ${categoryStyle[p.category]}`}>{p.category}</span>
        <button
          type="button"
          className={`bookmark-btn ${isSaved ? 'saved' : ''}`}
          onClick={onBookmark}
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${p.name}`}
          data-testid={`bookmark-${p.id}`}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
      <button
        type="button"
        className="card-main"
        onClick={onOpen}
        data-testid={`pattern-${p.id}`}
      >
        <span className="pattern-number">
          {String(index + 1).padStart(2, '0')}{' '}
          <span> / {p.category === 'Creational' ? '05' : p.category === 'Structural' ? '07' : '11'}</span>
        </span>
        <h4>{p.name}</h4>
        <p>{p.tagline}</p>
        <div className="card-intent">
          <span>THE MOVE</span>
          <span>{p.intent}</span>
        </div>
        <div className="card-bottom">
          <span>{p.memoryHook}</span>
          <ArrowUpRight size={16} />
        </div>
      </button>
    </article>
  );
}
