import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  ChevronRight,
  CircleHelp,
  Code2,
  Compass,
  FileJson2,
  FileText,
  GitBranch,
  GraduationCap,
  Layers3,
  LogIn,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Terminal,
  X,
} from 'lucide-react';
import { PATTERNS, QUIZ, type Pattern } from './data';
import type { Perspective } from './pattern-types';
import { useIsMobile } from './hooks/use-mobile';
import { PatternDetailPage } from './pages/PatternDetailPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { DecisionEnginePage } from './pages/DecisionEnginePage';
import { NotesWorkspacePage } from './pages/NotesWorkspacePage';
import { CatalogPage } from './pages/CatalogPage';
import { SimulatorsPage } from './pages/SimulatorsPage';
import { QuizLabPage } from './pages/QuizLabPage';
import { WipModulePlaceholder } from './components/WipModulePlaceholder';
import { NoteRepositoryProvider } from './lib/notes/NoteRepositoryContext';
import { AppTooltip } from './components/ui/app-tooltip';
import { AppToaster } from './components/ui/app-toaster';
import { useSession } from './lib/auth-client';
import { AuthDialog } from './components/auth/AuthDialog';
import { UserProfileDropdown } from './components/auth/UserProfileDropdown';
import { PatternDialog } from './components/dialogs/PatternDialog';
import { BackupDialog } from './components/dialogs/BackupDialog';
import { downloadBlob, zipStore } from './lib/zip-utils';
import { useLearningStore, useWorkspacePreferencesStore } from './stores';
import { ENABLE_FULL_FEATURES } from './config/features';

type Page = 'catalog' | 'decision' | 'playground' | 'simulators' | 'quiz' | 'notes';

const nav: { path: string; name: string; icon: typeof Layers3; id: Page; badge?: string }[] = [
  { path: '/', name: 'Pattern library', icon: Layers3, id: 'catalog' },
  { path: '/playground', name: 'Code playground', icon: Terminal, id: 'playground' },
  { path: '/decision-engine', name: 'Decision engine', icon: Compass, id: 'decision' },
  { path: '/notes', name: 'My notes', icon: FileText, id: 'notes' },
  { path: '/simulators', name: 'Pattern studio', icon: GitBranch, id: 'simulators', badge: 'WIP' },
  { path: '/quiz-lab', name: 'Scenario lab', icon: CircleHelp, id: 'quiz', badge: 'WIP' },
];

export function App() {
  const [loc, setLoc] = useLocation();
  const { data: session } = useSession();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Pattern | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);

  // Zustand State
  const theme = useLearningStore((s) => s.theme);
  const toggleTheme = useLearningStore((s) => s.toggleTheme);
  const bookmarks = useLearningStore((s) => s.bookmarks);
  const toggleBookmark = useLearningStore((s) => s.toggleBookmark);
  const progress = useLearningStore((s) => s.progress);
  const perspective = useLearningStore((s) => s.perspective);
  const setPerspective = useLearningStore((s) => s.setPerspective);
  const studioMode = useLearningStore((s) => s.studioMode);
  const setStudioMode = useLearningStore((s) => s.setStudioMode);

  const sidebarCollapsed = useWorkspacePreferencesStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspacePreferencesStore((s) => s.toggleSidebar);

  const isMobile = useIsMobile();

  // Sync theme with HTML class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSelectPattern = (pattern: Pattern) => {
    if (isMobile) {
      setSelected(pattern);
    } else {
      const qs = window.location.search;
      setLoc(`/pattern/${pattern.id}${qs}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isPatternPage = loc.startsWith('/pattern/');
  const patternIdFromUrl = isPatternPage ? loc.split('/pattern/')[1]?.split('?')[0] : null;
  const activePattern = patternIdFromUrl ? PATTERNS.find((p) => p.id === patternIdFromUrl) : null;

  // Global shortcuts: Ctrl+B (sidebar), Alt+F (Studio focus mode), P (Open playground for active pattern), B (Bookmark)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setStudioMode(!studioMode);
      }
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if ((e.key === 'p' || e.key === 'P') && isPatternPage && activePattern) {
          e.preventDefault();
          setLoc(`/playground?pattern=${activePattern.id}`);
        }
        if ((e.key === 'b' || e.key === 'B') && isPatternPage && activePattern) {
          e.preventDefault();
          toggleBookmark(activePattern.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPatternPage, activePattern, studioMode, toggleSidebar, setStudioMode, toggleBookmark, setLoc]);



  const page = isPatternPage ? 'catalog' : (nav.find((n) => n.path === loc)?.id || 'catalog');
  const progressList = Object.values(progress);

  const onExport = () => {
    const exportData = {
      version: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      theme,
      bookmarks,
      progress,
      perspective,
      studioMode,
      settings: { theme, activeCategoryFilter: 'All' },
      quizProgress: progress,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'gof-masterclass-backup.json');
  };

  const onRestore = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const sourceProgress = data.progress || data.quizProgress;
        if (!sourceProgress || !Array.isArray(data.bookmarks)) {
          throw new Error('This backup is missing required state.');
        }
        setBackupOpen(false);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Could not read this backup.');
      }
    };
    reader.readAsText(file);
  };

  const exportProject = () => {
    setZipBusy(true);
    const files: [string, string][] = [
      [
        'README.md',
        '# GoF Design Patterns Masterclass\n\nA local-first learning workspace for all 23 GoF patterns.',
      ],
      ['src/pattern-catalog.json', JSON.stringify(PATTERNS, null, 2)],
      ['src/quiz-bank.json', JSON.stringify(QUIZ, null, 2)],
      ['state-backup.json', JSON.stringify({ theme, bookmarks, progress, perspective, studioMode }, null, 2)],
    ];
    try {
      downloadBlob(zipStore(files), 'gof-pattern-masterclass.zip');
    } finally {
      window.setTimeout(() => setZipBusy(false), 600);
    }
  };

  const downloadWorkspaceSource = () => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.BASE_URL}workspace-source.zip`;
    link.download = 'pattern-masterclass-workspace-source.zip';
    link.click();
  };

  return (
    <NoteRepositoryProvider>
      <div
        className={`app-frame grain ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${
          studioMode ? 'studio-mode' : ''
        }`}
      >
        <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
          <div className="brand-row">
            <Link
              href="/"
              className="brand-link"
              onClick={() => {
                setMobileNav(false);
                setSavedOnly(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Go to pattern catalog homepage"
              data-testid="brand-home-link"
            >
              <div className="brand-mark">
                <Layers3 size={20} />
              </div>
              <div>
                <strong>Pattern</strong>
                <span>MASTERCLASS / 01</span>
              </div>
            </Link>
            <button
              type="button"
              className="icon-btn mobile-close"
              aria-label="Close navigation"
              onClick={() => setMobileNav(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="side-kicker">LEARNING PATH</div>
          <nav className="side-nav" aria-label="Main navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => {
                    setMobileNav(false);
                    setSavedOnly(false);
                  }}
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                  {item.badge && <span className="nav-wip-badge">{item.badge}</span>}
                  {item.id === 'catalog' && <span className="nav-count">23</span>}
                </Link>
              );
            })}
          </nav>
          <div className="side-divider" />
          <button
            type="button"
            className={`nav-item ${savedOnly && page === 'catalog' ? 'active' : ''}`}
            onClick={() => {
              setSavedOnly(true);
              setLoc('/');
              setMobileNav(false);
            }}
            data-testid="nav-bookmarks"
          >
            <Bookmark size={17} />
            <span>Saved patterns</span>
            <span className="nav-count">{bookmarks.length}</span>
          </button>
          <div className="sidebar-bottom">
            <div className="sidebar-progress">
              <div className="progress-head">
                <span>Your practice</span>
                <span>
                  {progressList.length}/{QUIZ.length}
                </span>
              </div>
              <div className="progress-line">
                <i
                  style={{
                    width: `${Math.min(100, (progressList.length / QUIZ.length) * 100)}%`,
                  }}
                />
              </div>
              <small>Small steps. Stronger instincts.</small>
            </div>
            {ENABLE_FULL_FEATURES && (
              <button
                type="button"
                className="nav-item"
                onClick={() => setBackupOpen(true)}
                data-testid="open-backup"
              >
                <FileJson2 size={17} />
                <span>Backup & settings</span>
                <ArrowUpRight size={14} className="nav-trailing" />
              </button>
            )}
            <div className="side-footer">
              <span className="status-dot" /> A field guide for better software
            </div>
          </div>
        </aside>

        {mobileNav && (
          <button
            type="button"
            className="scrim"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          />
        )}

        <main className="main-column">
          <header className="topbar">
            <div className="topbar-left">
              <button
                type="button"
                className="icon-btn mobile-menu"
                onClick={() => setMobileNav(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <AppTooltip
                content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                shortcut="Ctrl+B"
              >
                <button
                  type="button"
                  className="icon-btn desktop-sidebar-toggle"
                  onClick={toggleSidebar}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  data-testid="toggle-sidebar"
                >
                  {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </AppTooltip>



              <div className="crumb">
                <AppTooltip content="Go to Library">
                  <button
                    type="button"
                    className="crumb-root-link"
                    onClick={() => setLoc('/')}
                    aria-label="Go to Library"
                    data-testid="crumb-root-link"
                  >
                    GOF DESIGN PATTERNS
                  </button>
                </AppTooltip>
                <ChevronRight size={13} />
                <b>
                  {isPatternPage && activePattern
                    ? activePattern.name.toUpperCase()
                    : nav.find((n) => n.id === page)?.name.toUpperCase()}
                </b>
              </div>
            </div>

            <div className="top-actions">
              {isPatternPage && activePattern && (
                <>
                  <AppTooltip
                    content={
                      bookmarks.includes(activePattern.id)
                        ? 'Saved in bookmarks'
                        : 'Save to bookmarks'
                    }
                    shortcut="B"
                  >
                    <button
                      type="button"
                      className={`icon-btn topbar-action-btn ${
                        bookmarks.includes(activePattern.id) ? 'saved' : ''
                      }`}
                      onClick={() => toggleBookmark(activePattern.id)}
                      aria-label={
                        bookmarks.includes(activePattern.id) ? 'Remove bookmark' : 'Save pattern'
                      }
                      data-testid="topbar-bookmark-btn"
                    >
                      {bookmarks.includes(activePattern.id) ? (
                        <BookmarkCheck size={17} />
                      ) : (
                        <Bookmark size={17} />
                      )}
                    </button>
                  </AppTooltip>

                  <AppTooltip content="Open in live playground" shortcut="P">
                    <button
                      type="button"
                      className="icon-btn topbar-action-btn playground-btn"
                      onClick={() => setLoc(`/playground?pattern=${activePattern.id}`)}
                      aria-label="Open in playground"
                      data-testid="topbar-playground-btn"
                    >
                      <Code2 size={17} />
                    </button>
                  </AppTooltip>

                  <div
                    className="topbar-perspective-toggle"
                    role="radiogroup"
                    aria-label="Perspective switch"
                  >
                    <AppTooltip content="Canonical (Refactoring Guru / GoF Academic)">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={perspective === 'canonical'}
                        aria-label="Canonical perspective"
                        className={`topbar-perspective-btn ${
                          perspective === 'canonical' ? 'active' : ''
                        }`}
                        onClick={() => setPerspective('canonical')}
                        data-testid="global-perspective-canonical"
                      >
                        <GraduationCap size={15} />
                      </button>
                    </AppTooltip>

                    <AppTooltip content="Enterprise Cloud (Production Distributed Systems)">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={perspective === 'enterprise'}
                        aria-label="Enterprise Cloud perspective"
                        className={`topbar-perspective-btn ${
                          perspective === 'enterprise' ? 'active' : ''
                        }`}
                        onClick={() => setPerspective('enterprise')}
                        data-testid="global-perspective-enterprise"
                      >
                        <Building2 size={15} />
                      </button>
                    </AppTooltip>
                  </div>
                </>
              )}

              <AppTooltip
                content={studioMode ? 'Exit Studio Focus Mode' : 'Enter Studio Focus Mode'}
                shortcut="Alt+F"
              >
                <button
                  type="button"
                  className={`topbar-studio-btn ${studioMode ? 'active' : ''}`}
                  onClick={() => setStudioMode(!studioMode)}
                  aria-label={studioMode ? 'Exit Studio Focus Mode' : 'Enter Studio Focus Mode'}
                  data-testid="toggle-studio-mode"
                >
                  {studioMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span>{studioMode ? 'Studio' : 'Focus'}</span>
                </button>
              </AppTooltip>

              <AppTooltip content={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
                <button
                  type="button"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                  data-testid="toggle-theme"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
                </button>
              </AppTooltip>

              {ENABLE_FULL_FEATURES && (
                session?.user ? (
                  <UserProfileDropdown
                    user={session.user}
                    bookmarksCount={bookmarks.length}
                    onExportBackup={onExport}
                  />
                ) : (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setAuthDialogOpen(true)}
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.375rem 0.75rem',
                      height: '2rem',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                )
              )}
            </div>
          </header>

          <div
            className={`workspace ${
              isPatternPage ? 'workspace-studio' : page === 'notes' ? 'workspace-notes' : ''
            }`}
          >
            <Switch>
              <Route path="/">
                <CatalogPage
                  bookmarks={bookmarks}
                  savedOnly={savedOnly}
                  clearSaved={() => setSavedOnly(false)}
                  onBookmark={toggleBookmark}
                  onSelect={handleSelectPattern}
                />
              </Route>
              <Route path="/pattern/:id">
                {(params) => (
                  <PatternDetailPage
                    id={params.id}
                    saved={{ theme, bookmarks }}
                    globalPerspective={perspective}
                    onBookmark={toggleBookmark}
                    goPlayground={(pid) => setLoc(`/playground?pattern=${pid || params.id}`)}
                  />
                )}
              </Route>
              <Route path="/playground">
                <PlaygroundPage />
              </Route>
              <Route path="/decision-engine">
                <DecisionEnginePage onSelect={handleSelectPattern} />
              </Route>
              <Route path="/notes">
                <NotesWorkspacePage />
              </Route>
              <Route path="/simulators">
                <SimulatorsWipRoute onSelect={handleSelectPattern} />
              </Route>
              <Route path="/quiz-lab">
                <QuizLabWipRoute />
              </Route>
              <Route>
                <NotFound goHome={() => setLoc('/')} />
              </Route>
            </Switch>
          </div>

          {!isPatternPage && (
            <footer className="global-footer">
              <span>BUILT AROUND THE GANG OF FOUR · 1994</span>
              <span>
                23 patterns <i /> three families <i /> one shared language
              </span>
            </footer>
          )}
        </main>

        {selected && (
          <PatternDialog
            pattern={selected}
            isBookmarked={bookmarks.includes(selected.id)}
            theme={theme}
            perspective={perspective}
            onClose={() => setSelected(null)}
            onBookmark={toggleBookmark}
            goCode={() => {
              setSelected(null);
              setLoc(`/playground?pattern=${selected.id}`);
            }}
          />
        )}

        {backupOpen && (
          <BackupDialog
            theme={theme}
            zipBusy={zipBusy}
            onClose={() => setBackupOpen(false)}
            toggleTheme={toggleTheme}
            onExport={onExport}
            onRestore={onRestore}
            onZip={exportProject}
            onDownloadSource={downloadWorkspaceSource}
          />
        )}

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
        <AppToaster />
      </div>
    </NoteRepositoryProvider>
  );
}

function SimulatorsWipRoute({ onSelect }: { onSelect: (pattern: Pattern) => void }) {
  const [showPrototype, setShowPrototype] = useState(false);
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPreview = search?.get('preview') === 'true' || showPrototype;

  if (isPreview) {
    return (
      <div className="wip-preview-host">
        <div className="wip-preview-banner">
          <div className="wip-banner-left">
            <span className="wip-banner-pill">EARLY ALPHA</span>
            <span className="wip-banner-text">You are testing the experimental prototype of Pattern Studio.</span>
          </div>
          <button
            type="button"
            className="wip-banner-exit-btn"
            onClick={() => setShowPrototype(false)}
          >
            Back to Roadmap
          </button>
        </div>
        <SimulatorsPage onSelect={onSelect} />
      </div>
    );
  }

  return (
    <WipModulePlaceholder
      moduleIndex="05 / PATTERN STUDIO"
      moduleTitle="Interactive Pattern Studio"
      moduleHeadline="Visual drag-and-drop structural simulator & reactive event debugger for Gang of Four patterns."
      courtesyMessage="We are currently building high-fidelity visual diagrams, real-time message buses, and state-machine sandboxes. This module is in active development and will be published in the next update."
      onLaunchPrototype={() => setShowPrototype(true)}
      prototypeName="Pattern Studio Alpha"
      upcomingFeatures={[
        {
          title: 'Visual Component Wiring',
          desc: 'Connect Strategy algorithms, Observer dispatchers, and Decorator wrappers on an interactive HTML5 canvas.',
        },
        {
          title: 'Live Execution Visualizer',
          desc: 'Watch object allocations, virtual call dispatches, and memory footprints step-by-step in real time.',
        },
        {
          title: 'Interactive State Replay',
          desc: 'Step forward and backward through State transitions and Memento snapshots with time-travel debugging.',
        },
      ]}
    />
  );
}

function QuizLabWipRoute() {
  const [showPrototype, setShowPrototype] = useState(false);
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPreview = search?.get('preview') === 'true' || showPrototype;

  if (isPreview) {
    return (
      <div className="wip-preview-host">
        <div className="wip-preview-banner">
          <div className="wip-banner-left">
            <span className="wip-banner-pill">EARLY ALPHA</span>
            <span className="wip-banner-text">You are testing the experimental prototype of Scenario Lab.</span>
          </div>
          <button
            type="button"
            className="wip-banner-exit-btn"
            onClick={() => setShowPrototype(false)}
          >
            Back to Roadmap
          </button>
        </div>
        <QuizLabPage />
      </div>
    );
  }

  return (
    <WipModulePlaceholder
      moduleIndex="06 / SCENARIO LAB"
      moduleTitle="Scenario Lab & Knowledge Arena"
      moduleHeadline="Real-world system design challenges, timed pattern quizzes, and architectural trade-off evaluations."
      courtesyMessage="Scenario Lab is currently being populated with production enterprise incident post-mortems and GoF system refactoring challenges. Stay tuned for the upcoming interactive release!"
      onLaunchPrototype={() => setShowPrototype(true)}
      prototypeName="Scenario Lab Alpha"
      upcomingFeatures={[
        {
          title: 'Architecture Incident Drills',
          desc: 'Analyze broken microservice topologies and select the exact GoF pattern required to stop cascading failures.',
        },
        {
          title: 'Timed Pattern Diagnostic Gauntlets',
          desc: 'Test your pattern recognition reflex with 30-second rapid-fire architectural dilemma quizzes.',
        },
        {
          title: 'Automated ADR Rubric & Scoring',
          desc: 'Draft your architectural decision records and receive instant automated rubric feedback on trade-off coverage.',
        },
      ]}
    />
  );
}

function NotFound({ goHome }: { goHome: () => void }) {
  return (
    <div className="not-found">
      <span className="eyebrow">404 / WRONG TURN</span>
      <h1>
        This path
        <br />
        <em>isn't in the guide.</em>
      </h1>
      <button type="button" className="primary-btn" onClick={goHome}>
        Return to the library <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default App;
