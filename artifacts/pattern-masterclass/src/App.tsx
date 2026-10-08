import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ArrowDownUp, ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Code2, Compass, Copy, Download, FileJson2,
  Filter, GitBranch, Layers3, Lightbulb, Menu, Moon, Play, RotateCcw, Search, Settings2,
  ShieldCheck, Sun, Terminal, X, Zap,
} from 'lucide-react';
import { PATTERNS, QUIZ, type Pattern } from './data';
import { PatternDiagrams } from './PatternDiagrams';

type Page = 'catalog' | 'decision' | 'playground' | 'simulators' | 'quiz';
type Progress = { attempts: number; correct: number; bookmarked: boolean; note: string; box: number };
type Saved = { theme: 'light' | 'dark'; bookmarks: string[]; progress: Record<string, Progress>; mode: string };
const STORE = 'gof-masterclass-storage';
const defaults: Saved = { theme: 'light', bookmarks: [], progress: {}, mode: 'typescript' };
function getSaved(): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || '{}');
    const s = raw.state || raw;
    const settings = s.settings || {};
    const sourceProgress = s.progress || s.quizProgress || {};
    const progress = Object.fromEntries(Object.entries(sourceProgress).map(([id, value]) => {
      const p = value as Record<string, unknown>;
      return [id, { attempts: Number(p.attempts ?? p.attemptsCount ?? 0), correct: Number(p.correct ?? p.correctCount ?? 0), bookmarked: Boolean(p.bookmarked), note: String(p.note ?? p.notes ?? ''), box: Number(p.box ?? p.leitnerBox ?? 1) } satisfies Progress];
    }));
    return { ...defaults, ...s, theme: s.theme || settings.theme || defaults.theme, mode: s.mode || settings.codeExperienceMode || defaults.mode, progress, bookmarks: s.bookmarks || [] };
  } catch { return defaults; }
}
const nav: { path: string; name: string; icon: typeof Layers3; id: Page }[] = [
  { path: '/', name: 'Pattern library', icon: Layers3, id: 'catalog' },
  { path: '/decision-engine', name: 'Decision engine', icon: Compass, id: 'decision' },
  { path: '/playground', name: 'Code playground', icon: Terminal, id: 'playground' },
  { path: '/simulators', name: 'Pattern studio', icon: GitBranch, id: 'simulators' },
  { path: '/quiz-lab', name: 'Scenario lab', icon: CircleHelp, id: 'quiz' },
];
const categoryStyle: Record<string, string> = { Creational: 'tag-create', Structural: 'tag-structure', Behavioral: 'tag-behave' };
function App() {
  const [loc, setLoc] = useLocation();
  const [saved, setSaved] = useState<Saved>(getSaved);
  const [selected, setSelected] = useState<Pattern | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(saved)); document.documentElement.classList.toggle('dark', saved.theme === 'dark'); }, [saved]);
  const patchSaved = (f: (s: Saved) => Saved) => setSaved(s => f(s));
  const togglePatternBookmark = (id: string) => patchSaved(s => ({ ...s, bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter(x => x !== id) : [...s.bookmarks, id] }));
  const page = nav.find(n => n.path === loc)?.id || 'catalog';
  const progressList = Object.values(saved.progress);
  const onExport = () => {
    const blob = new Blob([JSON.stringify({ version: '1.0.0', exportTimestamp: new Date().toISOString(), ...saved, settings: { theme: saved.theme, codeExperienceMode: saved.mode, activeCategoryFilter: 'All' }, quizProgress: saved.progress }, null, 2)], { type: 'application/json' });
    download(blob, 'gof-masterclass-backup.json');
  };
  const restore = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const data = JSON.parse(String(reader.result)); const sourceProgress = data.progress || data.quizProgress; if (!sourceProgress || !Array.isArray(data.bookmarks)) throw new Error('This backup is missing required state.'); const progress = Object.fromEntries(Object.entries(sourceProgress).map(([id, value]) => { const p = value as Record<string, unknown>; return [id, { attempts: Number(p.attempts ?? p.attemptsCount ?? 0), correct: Number(p.correct ?? p.correctCount ?? 0), bookmarked: Boolean(p.bookmarked), note: String(p.note ?? p.notes ?? ''), box: Number(p.box ?? p.leitnerBox ?? 1) } satisfies Progress]; })); setSaved({ ...defaults, ...data, theme: data.theme || data.settings?.theme || defaults.theme, mode: data.mode || data.settings?.codeExperienceMode || defaults.mode, progress }); setBackupOpen(false); } catch (e) { alert(e instanceof Error ? e.message : 'Could not read this backup.'); } };
    reader.readAsText(file);
  };
  const [zipBusy, setZipBusy] = useState(false);
  const exportProject = () => {
    setZipBusy(true);
    const files: [string, string][] = [
      ['README.md', '# GoF Design Patterns Masterclass\n\nA local-first learning workspace for all 23 GoF patterns. Open the app and explore the pattern library, decision guide, runnable examples, simulators, and scenario lab.'],
      ['src/pattern-catalog.json', JSON.stringify(PATTERNS, null, 2)],
      ['src/quiz-bank.json', JSON.stringify(QUIZ, null, 2)],
      ['state-backup.json', JSON.stringify(saved, null, 2)],
    ];
    try { download(new Blob([zipStore(files)], { type: 'application/zip' }), 'gof-pattern-masterclass.zip'); }
    finally { window.setTimeout(() => setZipBusy(false), 600); }
  };
  const downloadWorkspaceSource = () => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.BASE_URL}workspace-source.zip`;
    link.download = 'pattern-masterclass-workspace-source.zip';
    link.click();
  };
  return <div className="app-frame grain">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><Layers3 size={20}/></div><div><strong>Pattern</strong><span>MASTERCLASS / 01</span></div><button className="icon-btn mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="side-kicker">LEARNING PATH</div>
      <nav className="side-nav" aria-label="Main navigation">{nav.map(item => { const Icon = item.icon; return <Link key={item.id} href={item.path} onClick={() => { setMobileNav(false); setSavedOnly(false); }} className={`nav-item ${page === item.id ? 'active' : ''}`} data-testid={`nav-${item.id}`}><Icon size={17}/><span>{item.name}</span>{item.id === 'catalog' && <span className="nav-count">23</span>}</Link>; })}</nav>
      <div className="side-divider"/>
      <button className={`nav-item ${savedOnly && page === 'catalog' ? 'active' : ''}`} onClick={() => { setSavedOnly(true); setLoc('/'); setMobileNav(false); }} data-testid="nav-bookmarks"><Bookmark size={17}/><span>Saved patterns</span><span className="nav-count">{saved.bookmarks.length}</span></button>
      <div className="sidebar-bottom">
        <div className="sidebar-progress"><div className="progress-head"><span>Your practice</span><span>{progressList.length}/{QUIZ.length}</span></div><div className="progress-line"><i style={{ width: `${Math.min(100, progressList.length / QUIZ.length * 100)}%` }}/></div><small>Small steps. Stronger instincts.</small></div>
        <button className="nav-item" onClick={() => setBackupOpen(true)} data-testid="open-backup"><FileJson2 size={17}/><span>Backup & settings</span><ArrowUpRight size={14} className="nav-trailing"/></button>
        <div className="side-footer"><span className="status-dot"/> A field guide for better software</div>
      </div>
    </aside>
    {mobileNav && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-column">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="crumb"><span>GOF DESIGN PATTERNS</span><ChevronRight size={13}/><b>{nav.find(n => n.id === page)?.name.toUpperCase()}</b></div><div className="top-actions"><button className="theme-toggle" onClick={() => patchSaved(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))} aria-label={`Switch to ${saved.theme === 'light' ? 'dark' : 'light'} theme`} data-testid="toggle-theme">{saved.theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}<span>{saved.theme === 'light' ? 'Light' : 'Dark'}</span></button><button className="avatar" title="Your learning space">M</button></div></header>
      <div className="workspace">
        <Switch>
          <Route path="/"><Catalog saved={saved} savedOnly={savedOnly} clearSaved={() => setSavedOnly(false)} onBookmark={togglePatternBookmark} onSelect={setSelected}/></Route>
          <Route path="/decision-engine"><Decision onSelect={setSelected}/></Route>
          <Route path="/playground"><Playground saved={saved} setSaved={setSaved}/></Route>
          <Route path="/simulators"><Simulators onSelect={setSelected}/></Route>
          <Route path="/quiz-lab"><QuizLab saved={saved} setSaved={setSaved}/></Route>
          <Route><NotFound goHome={() => setLoc('/')}/></Route>
        </Switch>
      </div>
      <footer className="global-footer"><span>BUILT AROUND THE GANG OF FOUR · 1994</span><span>23 patterns <i/> three families <i/> one shared language</span></footer>
    </main>
    {selected && <PatternDialog pattern={selected} saved={saved} onClose={() => setSelected(null)} onBookmark={togglePatternBookmark} goCode={() => { setSelected(null); setLoc('/playground'); }}/>}
    {backupOpen && <BackupDialog onClose={() => setBackupOpen(false)} onExport={onExport} onRestore={restore} onZip={exportProject} onDownloadSource={downloadWorkspaceSource} zipBusy={zipBusy} theme={saved.theme} toggleTheme={() => patchSaved(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))} />}
  </div>;
}

function Catalog({ saved, savedOnly, clearSaved, onBookmark, onSelect }: { saved: Saved; savedOnly: boolean; clearSaved: () => void; onBookmark: (id: string) => void; onSelect: (p: Pattern) => void }) {
  const [filter, setFilter] = useState('All patterns'); const [query, setQuery] = useState(''); const [sort, setSort] = useState('A–Z');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  const list = useMemo(() => {
    let items = PATTERNS.filter(p => (filter === 'All patterns' || p.category === filter) && (!savedOnly || saved.bookmarks.includes(p.id)) && (!query || `${p.name} ${p.category} ${p.tagline} ${p.intent}`.toLowerCase().includes(query.toLowerCase())));
    if (sort === 'A–Z') items = [...items].sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'Family') items = [...items].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    else items = [...items].sort((a,b) => Number(saved.bookmarks.includes(b.id))-Number(saved.bookmarks.includes(a.id)) || a.name.localeCompare(b.name));
    return items;
  }, [filter, query, sort, saved.bookmarks, savedOnly]);
  const families = ['Creational','Structural','Behavioral'] as const;
  return <div className="page-content reveal">
    <section className="catalog-hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/>THE ORIGINAL 23 · REIMAGINED FOR PRACTICE</div><h1>Patterns are<br/><em>decisions</em> made visible.</h1><p>A field guide to the recurring problems behind resilient software. Learn the shape, know the trade-off, recognize when it fits.</p><div className="hero-meta"><span><b>23</b> classic patterns</span><span><b>03</b> pattern families</span><span><b>01</b> working vocabulary</span></div></div><div className="orbit-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="orbit-core"><Layers3 size={25}/></div><span className="orbit-node n1">01</span><span className="orbit-node n2">02</span><span className="orbit-node n3">03</span></div></section>
    <section className="catalog-toolbar"><div className="toolbar-title"><span className="eyebrow">THE LIBRARY</span><h2>{savedOnly ? 'Your saved patterns' : 'Browse the collection'} <span>{list.length.toString().padStart(2,'0')}</span></h2></div><div className="toolbar-controls"><label className="searchbox"><Search size={16}/><input ref={searchRef} aria-label="Search patterns" placeholder="Find a pattern…" value={query} onChange={e => setQuery(e.target.value)} data-testid="pattern-search"/><kbd>⌘ K</kbd></label><label className="select-wrap"><Filter size={14}/><select aria-label="Sort patterns" value={sort} onChange={e => setSort(e.target.value)} data-testid="pattern-sort"><option>A–Z</option><option>Family</option><option>Saved first</option></select><ChevronDown size={13}/></label></div></section>
    <div className="filter-row" role="group" aria-label="Filter by pattern family">{['All patterns',...families].map(f => <button className={`filter-pill ${filter === f ? 'chosen' : ''}`} key={f} onClick={() => setFilter(f)} data-testid={`filter-${f.toLowerCase().replace(' ','-')}`}>{f}{f !== 'All patterns' && <span>{PATTERNS.filter(p => p.category === f).length}</span>}</button>)}</div>
    {families.filter(f => filter === 'All patterns' || filter === f).map(family => { const entries = list.filter(p => p.category === family); if (!entries.length) return null; return <section className={`family-section family-${family.toLowerCase()}`} key={family}><div className="family-heading"><div className="family-index">{family === 'Creational' ? 'I' : family === 'Structural' ? 'II' : 'III'}</div><div><div className="family-label">{family.toUpperCase()} PATTERNS</div><h3>{family === 'Creational' ? 'How things come to be.' : family === 'Structural' ? 'How parts fit together.' : 'How objects collaborate.'}</h3></div><span className="family-total">{entries.length} patterns <ArrowDownUp size={13}/></span></div><div className="pattern-grid">{entries.map((p, i) => <PatternCard key={p.id} pattern={p} index={i} isSaved={saved.bookmarks.includes(p.id)} onBookmark={() => onBookmark(p.id)} onOpen={() => onSelect(p)}/>)}</div></section>; })}
     {list.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={21}/></div><h3>Nothing in this corner.</h3><p>{savedOnly ? 'Save a pattern with the bookmark icon and it will be waiting here.' : 'Try a different phrase, or clear the family filter.'}</p><button className="text-button" onClick={() => { setQuery(''); setFilter('All patterns'); if (savedOnly) clearSaved(); }}>Clear filters <ArrowRight size={14}/></button></div>}
    <div className="catalog-note"><Lightbulb size={17}/><p><b>A useful question:</b> what is changing, and which part of the system should own that change?</p><span>START HERE</span></div>
  </div>;
}
function PatternCard({ pattern: p, index, isSaved, onBookmark, onOpen }: { pattern: Pattern; index: number; isSaved: boolean; onBookmark: () => void; onOpen: () => void }) {
  return <article className="pattern-card" style={{ animationDelay: `${index * 35}ms` }}><div className="card-top"><span className={`category-tag ${categoryStyle[p.category]}`}>{p.category}</span><button className={`bookmark-btn ${isSaved ? 'saved' : ''}`} onClick={onBookmark} aria-label={`${isSaved ? 'Remove' : 'Save'} ${p.name}`} data-testid={`bookmark-${p.id}`}>{isSaved ? <BookmarkCheck size={16}/> : <Bookmark size={16}/>}</button></div><button className="card-main" onClick={onOpen} data-testid={`pattern-${p.id}`}><span className="pattern-number">{String(index+1).padStart(2,'0')} <span> / {p.category === 'Creational' ? '05' : p.category === 'Structural' ? '07' : '11'}</span></span><h4>{p.name}</h4><p>{p.tagline}</p><div className="card-intent"><span>THE MOVE</span><span>{p.intent}</span></div><div className="card-bottom"><span>{p.memoryHook}</span><ArrowUpRight size={16}/></div></button></article>;
}
function Decision({ onSelect }: { onSelect: (p: Pattern) => void }) {
  const [problem, setProblem] = useState(''); const [change, setChange] = useState(''); const [constraints, setConstraints] = useState<string[]>([]); const [show, setShow] = useState(false);
  const choices = [{label:'Creation varies by context',key:'creation'},{label:'Many types need one interface',key:'interface'},{label:'Behavior changes at runtime',key:'runtime'},{label:'Need to wrap behavior',key:'wrap'},{label:'Multiple objects must coordinate',key:'coordinate'}];
  const recommendation = useMemo(() => {
    let ids: string[] = [];
    if (problem.includes('creation')) ids = ['factory-method','abstract-factory','builder','prototype'];
    else if (problem.includes('interface')) ids = ['adapter','facade','composite','proxy'];
    else if (problem.includes('runtime')) ids = ['strategy','state','command','chain-of-responsibility'];
    else if (problem.includes('wrap')) ids = ['decorator','proxy','adapter'];
    else if (problem.includes('coordinate')) ids = ['observer','mediator','command'];
    if (change.includes('family')) ids = ['abstract-factory','factory-method','builder'];
    if (change.includes('sequence')) ids = ['template-method','chain-of-responsibility','command'];
    if (constraints.includes('Preserve an existing API')) ids = ['adapter','facade','proxy',...ids.filter(id => !['adapter','facade','proxy'].includes(id))];
    if (constraints.includes('Allow behavior to be swapped live')) ids = ['strategy','state',...ids.filter(id => !['strategy','state'].includes(id))];
    if (constraints.includes('Avoid a sprawling inheritance tree')) ids = ids.filter(id => id !== 'factory-method' && id !== 'template-method');
    return ids.map(id => PATTERNS.find(p => p.id === id)).filter(Boolean) as Pattern[];
  }, [problem, change, constraints]);
  return <div className="page-content reveal"><PageIntro index="02 / FIELD GUIDE" title={<>Find the pattern<br/><em>behind the problem.</em></>} text="Start with what hurts. A good pattern is less a recipe than a useful name for a recurring trade-off."/>
     <div className="decision-layout"><section className="decision-form"><div className="form-step"><div className="step-no">01</div><div className="step-content"><label className="field-label">What are you trying to solve?</label><p>Choose the closest shape of the problem.</p><div className="choice-stack">{choices.map(c => <button key={c.key} onClick={() => { setProblem(c.key); setShow(false); }} className={`choice-row ${problem === c.key ? 'selected' : ''}`} data-testid={`decision-${c.key}`}><span className="choice-radio"/><span>{c.label}</span><ArrowRight size={15}/></button>)}</div></div></div>
      <div className="form-step"><div className="step-no">02</div><div className="step-content"><label className="field-label">What changes most often?</label><p>This helps distinguish similar solutions.</p><div className="select-field"><select value={change} onChange={e => { setChange(e.target.value); setShow(false); }} aria-label="What changes most often" data-testid="decision-change"><option value="">Choose one…</option><option value="family">A family of compatible products</option><option value="algorithm">An algorithm or business rule</option><option value="sequence">The steps in a fixed workflow</option><option value="relationships">Relationships between objects</option><option value="state">The object's lifecycle state</option></select><ChevronDown size={16}/></div></div></div>
       <div className="form-step"><div className="step-no">03</div><div className="step-content"><label className="field-label">Any constraints to honor?</label><p>Select every constraint that matters.</p><div className="constraint-grid">{['Keep clients unaware of concrete classes','Allow behavior to be swapped live','Avoid a sprawling inheritance tree','Preserve an existing API'].map(c => <button key={c} className={`constraint ${constraints.includes(c) ? 'on' : ''}`} onClick={() => setConstraints(v => v.includes(c) ? v.filter(x => x !== c) : [...v,c])} data-testid={`constraint-${c.toLowerCase().replace(/[^a-z]+/g,'-')}`}><span>{constraints.includes(c) && <Check size={12}/>}</span>{c}</button>)}</div></div></div>
      <button className="primary-btn decision-submit" disabled={!problem} onClick={() => setShow(true)} data-testid="decision-recommend">Show my shortlist <ArrowRight size={16}/></button></section>
      <aside className={`recommend-panel ${show ? 'has-results' : ''}`} aria-live="polite">{show ? <><div className="result-head"><span className="eyebrow">YOUR SHORTLIST</span><span className="result-icon"><Zap size={17}/></span></div><h3>{recommendation[0]?.name || 'A useful place to start'}</h3><p className="result-caption">Begin here, then compare the alternatives below.</p><div className="result-list">{recommendation.slice(0,4).map((p,i)=><button className="recommend-row" key={p.id} onClick={() => onSelect(p)}><span className="recommend-rank">0{i+1}</span><span><b>{p.name}</b><small>{p.memoryHook}</small></span><ArrowUpRight size={15}/></button>)}</div><div className="result-caveat"><ShieldCheck size={16}/><p>Patterns are trade-offs, not rules. Check the “when not to use” notes before committing.</p></div></> : <div className="recommend-empty"><div className="orbit-mini"><Compass size={24}/></div><span className="eyebrow">A SMALL DECISION TREE</span><h3>Start with the pressure.</h3><p>Choose the problem you recognize. We'll point you toward the patterns that make that decision explicit.</p><div className="path-preview"><span>PROBLEM</span><i/><span>PATTERN</span><i/><span>TRADE-OFF</span></div></div>}</aside></div>
    <section className="decision-footnote"><span className="eyebrow">A QUICK HEURISTIC</span><div><span>One object, one variant</span><ArrowRight size={14}/><b>Factory Method</b></div><div><span>A matched set</span><ArrowRight size={14}/><b>Abstract Factory</b></div><div><span>Many optional steps</span><ArrowRight size={14}/><b>Builder</b></div></section>
  </div>;
}
function Playground({ saved, setSaved }: { saved: Saved; setSaved: React.Dispatch<React.SetStateAction<Saved>> }) {
  const [patternId, setPatternId] = useState('factory-method'); const [code, setCode] = useState(''); const [output, setOutput] = useState<string[]>([]); const [hasRun, setHasRun] = useState(false);
  const pattern = PATTERNS.find(p => p.id === patternId)!;
  const implementation = pattern.typeScriptImplementation;
  useEffect(() => { setCode(saved.mode === 'java' ? pattern.javaImplementation.code : (pattern.runnableCode || implementation.code)); setOutput([]); setHasRun(false); }, [patternId, saved.mode, implementation.code, implementation.fileName, pattern.javaImplementation.code, pattern.runnableCode]);
  const toggleMode = (mode: string) => setSaved(s => ({ ...s, mode }));
  const run = () => {
    setHasRun(true);
    const lines = patternId === 'factory-method' ? ['[S3 Driver] Uploaded 4096 bytes to reports/audit.pdf','Factory selected: S3StorageDriver'] :
      patternId === 'abstract-factory' ? ['AWS EC2 started','AWS S3 bucket allocated','Compatible cloud resource family created'] :
      patternId === 'builder' ? ['Built Request: {"method":"GET","headers":{"Authorization":"Bearer secret-token"},"url":"https://api.internal/v1/metrics"}'] :
      patternId === 'strategy' ? ['Scenic route SF->Monterey via Coast','Strategy swapped without changing Navigator'] :
      patternId === 'observer' ? ['[Slack Bot]: Service 503 Outage Detected','[Email]: Service 503 Outage Detected'] :
      patternId === 'command' ? ['After execute: Hello ','After undo: '] :
      [`${pattern.name} example initialized`, pattern.memoryHook, 'See the example output in this local simulation.'];
    setOutput(lines);
  };
  return <div className="page-content reveal"><PageIntro index="03 / WORKSHOP" title={<>Read the shape.<br/><em>Run the idea.</em></>} text="A small, self-contained example makes the pattern concrete. Edit the code and use the local teaching simulation to inspect its behavior."/><div className="playground-toolbar"><label className="select-wrap"><Code2 size={15}/><select aria-label="Select a pattern example" value={patternId} onChange={e => setPatternId(e.target.value)} data-testid="playground-pattern">{PATTERNS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><ChevronDown size={13}/></label><div className="language-switch" role="group" aria-label="Code language"><button onClick={() => toggleMode('java')} className={saved.mode === 'java' ? 'active' : ''} data-testid="language-java">Java</button><button onClick={() => toggleMode('typescript')} className={saved.mode !== 'java' ? 'active' : ''} data-testid="language-typescript">TypeScript</button></div><span className="local-badge"><i/> LOCAL EXAMPLE</span></div><div className="editor-card"><div className="editor-head"><div><span className="file-dot"/><span className="mono">{saved.mode === 'java' ? pattern.javaImplementation.fileName : implementation.fileName}</span></div><div className="editor-tools"><button className="subtle-btn" onClick={() => navigator.clipboard?.writeText(code)} data-testid="copy-code"><Copy size={14}/> Copy</button><button className="subtle-btn" onClick={() => { setCode(saved.mode === 'java' ? pattern.javaImplementation.code : (pattern.runnableCode || implementation.code)); setOutput([]); setHasRun(false); }} data-testid="reset-code"><RotateCcw size={14}/> Reset</button></div></div><div className="editor-body"><div className="line-numbers" aria-hidden="true">{code.split('\n').map((_,i)=><span key={i}>{String(i+1).padStart(2,'0')}</span>)}</div><textarea spellCheck={false} aria-label="Editable code example" value={code} onChange={e => setCode(e.target.value)} data-testid="code-editor"/></div><div className="editor-footer"><span><span className="footer-check"><Check size={11}/></span> Example source · {pattern.name}</span><button className="run-btn" onClick={run} data-testid="run-example"><Play size={14} fill="currentColor"/> Run example</button></div></div><div className="output-card"><div className="output-head"><div><Terminal size={15}/><b>Output</b><span className="mono"> / console</span></div><button className="clear-output" onClick={() => { setOutput([]); setHasRun(false); }} data-testid="clear-output">Clear</button></div><div className="output-body" aria-live="polite">{hasRun ? output.map((line,i)=><div className="output-line" key={i}><span className="output-caret">›</span>{line}</div>) : <div className="output-placeholder"><span className="terminal-prompt">›</span>{code.trim() ? 'Run the example to see the pattern in action.' : 'Choose an example to begin.'}</div>}</div></div><div className="code-explain"><div className="explain-mark"><Lightbulb size={17}/></div><div><span className="eyebrow">WHAT TO NOTICE</span><p>{saved.mode === 'java' ? pattern.javaImplementation.explanation : implementation.explanation}</p></div><button className="text-button" onClick={() => navigator.clipboard?.writeText(code)}>Copy snippet <Copy size={13}/></button></div></div>;
}
function Simulators({ onSelect }: { onSelect: (p: Pattern) => void }) {
  const [scenario, setScenario] = useState(0); const [events, setEvents] = useState<string[]>([]);
  const [orderPhase, setOrderPhase] = useState('Pending'); const [documentText, setDocumentText] = useState(''); const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]); const [route, setRoute] = useState('');
  const demos = [
    { id:'strategy', title:'Strategy / Route planning', label:'SWAP THE ALGORITHM', intro:'A navigator keeps its job. Choose which route it plans.', options:['Fast · highway','Scenic · coast','Low tolls · inland'], snippets:['Fast route SF→Monterey via Highway · 92 min','Scenic route SF→Monterey via Coast · 2h 14m','Low-toll route SF→Monterey via CA-152 · $4.50'] },
    { id:'observer', title:'Observer / Order events', label:'PUBLISHER → SUBSCRIBERS', intro:'An order service publishes once. Every subscriber reacts independently.', options:['Order placed','Payment captured','Shipment delayed'], snippets:['Inventory reserved · email receipt queued · analytics event recorded','Payment ledger updated · order marked paid · customer notified','Support alert raised · delivery ETA recalculated · customer notified'] },
    { id:'chain-of-responsibility', title:'Chain / Request pipeline', label:'PASS THE REQUEST', intro:'Each handler checks the incoming request and can stop the chain.', options:['Valid admin · 45 req/min','Guest · 45 req/min','Admin · 145 req/min'], snippets:['Auth ✓  → Rate limit ✓  → Request accepted','Auth ✕  → Request blocked before rate check','Auth ✓  → Rate limit ✕  → Request throttled'] },
    { id:'decorator', title:'Decorator / Add capabilities', label:'WRAP A BASE OBJECT', intro:'Wrap the same coffee with optional capabilities. Each decorator adds cost.', options:['Base coffee · $3.25','Add oat milk · +$0.65','Add espresso · +$1.10'], snippets:['Espresso · $3.25','Espresso + oat milk · $3.90','Espresso + extra shot · $4.35'] },
    { id:'state', title:'State / Order lifecycle', label:'STATE → NEXT STATE', intro:'The current order state decides which action is legal next.', options:['Pay order','Pack order','Ship order'], snippets:['Pending → Paid · payment authorized','Paid → Packed · fulfillment started','Packed → In transit · tracking number created'] },
    { id:'command', title:'Command / Undo stack', label:'EXECUTE · UNDO', intro:'Actions are objects. The history stack can replay or reverse a request.', options:['Append “Hello”','Append “world”','Undo last action'], snippets:['Document: Hello · history: 1 command','Document: Hello world · history: 2 commands','Document: Hello · history: 1 command'] },
  ];
  const demo = demos[scenario];
  const trace = (message:string) => setEvents(x => [`${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}  ${message}`, ...x].slice(0,5));
  const act = (i: number) => {
    if (scenario === 0) {
      const picked = ['Fast route SF→Monterey via Highway · 92 min','Scenic route SF→Monterey via Coast · 2h 14m','Low-toll route SF→Monterey via CA-152 · $4.50'][i];
      setRoute(picked); trace(`${picked} · Navigator unchanged`);
    } else if (scenario === 1) trace(`${demo.snippets[i]} · 3 observers notified`);
    else if (scenario === 2) trace(demo.snippets[i]);
    else if (scenario === 3) {
      if (i === 0) setExtras([]);
      else setExtras(value => value.includes(i === 1 ? 'oat milk' : 'extra shot') ? value : [...value, i === 1 ? 'oat milk' : 'extra shot']);
      const next = i === 0 ? [] : extras.includes(i === 1 ? 'oat milk' : 'extra shot') ? extras : [...extras, i === 1 ? 'oat milk' : 'extra shot'];
      const cost = 3.25 + (next.includes('oat milk') ? .65 : 0) + (next.includes('extra shot') ? 1.10 : 0);
      trace(`Espresso${next.length ? ` + ${next.join(' + ')}` : ''} · $${cost.toFixed(2)}`);
    } else if (scenario === 4) {
      const transitions: [string,string][] = [['Pending','Paid'],['Paid','Packed'],['Packed','In transit']];
      const [from,to] = transitions[i];
      if (orderPhase !== from) trace(`Action rejected · ${i === 0 ? 'pay' : i === 1 ? 'pack' : 'ship'} is not valid while order is ${orderPhase.toLowerCase()}`);
      else { setOrderPhase(to); trace(`${from} → ${to} · ${demo.snippets[i].split('·')[1].trim()}`); }
    } else if (i < 2) {
      const word = i === 0 ? 'Hello ' : 'world';
      setDocumentText(value => value + word); setCommandHistory(value => [...value, word]);
      trace(`Executed append "${word.trim()}" · document: "${documentText + word}" · history ${commandHistory.length + 1}`);
    } else {
      const last = commandHistory[commandHistory.length - 1];
      if (!last) trace('Undo ignored · command history is empty');
      else { setCommandHistory(value => value.slice(0,-1)); setDocumentText(value => value.slice(0,-last.length)); trace(`Undid append "${last.trim()}" · document: "${documentText.slice(0,-last.length)}" · history ${commandHistory.length - 1}`); }
    }
  };
  const p = PATTERNS.find(x => x.id === demo.id)!;
  return <div className="page-content reveal"><PageIntro index="04 / PATTERN STUDIO" title={<>A pattern you can<br/><em>move around.</em></>} text="Model the collaboration, not just the class diagram. Each small simulator lets you change one input and inspect its ripple."/><div className="sim-tabs">{demos.map((d,i)=><button key={d.id} className={`sim-tab ${scenario === i ? 'active' : ''}`} onClick={() => {setScenario(i);setEvents([]);setOrderPhase('Pending');setDocumentText('');setCommandHistory([]);setExtras([]);setRoute('');}} data-testid={`simulator-${d.id}`}><span>0{i+1}</span>{d.title.split(' / ')[0]}</button>)}</div><div className="simulator-panel"><div className="sim-copy"><span className="eyebrow">{demo.label}</span><h2>{demo.title.split(' / ')[0]} <em>in motion.</em></h2><p>{demo.intro}</p><button className="pattern-link" onClick={() => onSelect(p)}>Open full pattern notes <ArrowUpRight size={15}/></button></div><div className="sim-stage"><div className="sim-stage-head"><span>INPUT / ACTION</span><span>{scenario===4?`ORDER / ${orderPhase.toUpperCase()}`:scenario===5?`DOCUMENT / "${documentText}"`:scenario===0&&route?route.toUpperCase():'CLICK TO SIMULATE'}</span></div><div className={`sim-visual sim-${demo.id}`}><div className="sim-center">{scenario === 0 ? <Compass size={23}/> : scenario === 1 ? <Zap size={22}/> : scenario === 2 ? <ShieldCheck size={22}/> : scenario === 3 ? <Layers3 size={22}/> : scenario === 4 ? <GitBranch size={22}/> : <Terminal size={22}/>}<span>{scenario === 0 ? 'Navigator' : scenario === 1 ? 'Order service' : scenario === 2 ? 'Request' : scenario === 3 ? `Coffee · $${(3.25+(extras.includes('oat milk')?.65:0)+(extras.includes('extra shot')?1.1:0)).toFixed(2)}` : scenario === 4 ? orderPhase : `History · ${commandHistory.length}`}</span></div><div className="sim-connections"><i/><i/><i/></div><div className="sim-nodes">{(scenario === 0 ? ['Highway','Coast','Inland'] : scenario === 1 ? ['Inventory','Email','Analytics'] : scenario === 2 ? ['Auth','Rate','Controller'] : scenario === 3 ? ['Milk','Shot','Syrup'] : scenario === 4 ? ['Pending','Paid','Shipped'] : ['Execute','History','Undo']).map((v,i)=><div key={v} className={`sim-node ${events.length && i === 1 ? 'lit' : ''}`}><span>{String(i+1).padStart(2,'0')}</span>{v}</div>)}</div></div><div className="sim-action-grid">{demo.options.map((opt,i)=><button key={opt} className="sim-action" onClick={() => act(i)} data-testid={`sim-action-${i}`}><span>{opt}</span><ArrowRight size={14}/></button>)}</div></div></div><div className="event-log"><div className="event-log-title"><span className="live-pip"/><b>EVENT TRACE</b><span>LOCAL SIMULATION</span><button onClick={() => setEvents([])} data-testid="clear-simulator">Clear log</button></div><div className="trace-lines">{events.length ? events.map((e,i)=><div className="trace-line" key={`${e}${i}`}><span>{String(events.length-i).padStart(2,'0')}</span><code>{e}</code></div>) : <div className="trace-empty">Awaiting input <span>— click a scenario above to trace the collaboration.</span></div>}</div></div><div className="studio-tip"><Lightbulb size={17}/><span><b>Look for:</b> the point where responsibilities change hands. That's usually where the pattern's value lives.</span></div></div>;
}
function QuizLab({ saved, setSaved }: { saved: Saved; setSaved: React.Dispatch<React.SetStateAction<Saved>> }) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState(''); const [filter, setFilter] = useState('All scenarios');
  const questions = QUIZ.filter(x => filter === 'All scenarios' || (filter === 'Bookmarked' ? saved.progress[x.id]?.bookmarked : (saved.progress[x.id]?.attempts || 0) > 0));
  const q = questions[index] || QUIZ[0]; const current = saved.progress[q.id]; const answered = !!selected;
  useEffect(() => { setSelected(''); }, [index, filter]);
  if (!questions.length) return <div className="page-content reveal"><PageIntro index="05 / SCENARIO LAB" title={<>Practice the<br/><em>recognition.</em></>} text="Read the constraints before the options. Choose the pattern that fits the forces at play—not the one you last studied."/><div className="empty-state"><div className="empty-icon"><Bookmark size={20}/></div><h3>No scenarios in this filter.</h3><p>Answer a scenario or bookmark one to build this practice set.</p><button className="text-button" onClick={() => setFilter('All scenarios')}>Show all scenarios <ArrowRight size={14}/></button></div></div>;
  const answer = (id: string) => {
    if (answered) return;
    const option = q.options.find(o => o.id === id)!; setSelected(id);
    setSaved(s => { const old = s.progress[q.id] || { attempts:0,correct:0,bookmarked:false,note:'',box:1 }; return { ...s, progress: { ...s.progress, [q.id]: { ...old, attempts: old.attempts + 1, correct: old.correct + (option.isCorrect ? 1 : 0), box: option.isCorrect ? Math.min(5,old.box+1) : 1 } } }; });
  };
  const go = (dir: number) => { setIndex(i => (i + dir + questions.length) % questions.length); };
  return <div className="page-content reveal"><PageIntro index="05 / SCENARIO LAB" title={<>Practice the<br/><em>recognition.</em></>} text="Read the constraints before the options. Choose the pattern that fits the forces at play—not the one you last studied."/><div className="quiz-dashboard"><div className="quiz-stat"><span className="eyebrow">SCENARIOS</span><b>{QUIZ.length.toString().padStart(2,'0')}</b><small>three design situations</small></div><div className="quiz-stat"><span className="eyebrow">ATTEMPTS</span><b>{progressListCount(saved)}</b><small>answers recorded</small></div><div className="quiz-stat"><span className="eyebrow">ACCURACY</span><b>{accuracy(saved)}<small>%</small></b><small>of all attempts</small></div><div className="quiz-streak"><span className="eyebrow">A NOTE TO SELF</span><p>“A scenario is a set of constraints wearing a story.”</p><span>FIELD GUIDE / 01</span></div></div><div className="quiz-controls"><div className="quiz-filter">{['All scenarios','Attempted','Bookmarked'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>{setFilter(f);setIndex(0);}} data-testid={`quiz-filter-${f.toLowerCase()}`}>{f}</button>)}</div><span>SCENARIO {String(index+1).padStart(2,'0')} <i/> {q.category.toUpperCase()} / {q.difficulty.toUpperCase()}</span></div><div className="question-layout"><article className="question-card"><div className="question-top"><span className="question-num">SCENARIO {String(q.scenarioNumber).padStart(2,'0')}</span><span className="difficulty">{q.difficulty}</span><button onClick={() => setSaved(s => {const old=s.progress[q.id] || {attempts:0,correct:0,bookmarked:false,note:'',box:1}; return {...s, progress:{...s.progress,[q.id]:{...old,bookmarked:!old.bookmarked}}};})} className={`quiz-bookmark ${current?.bookmarked?'saved':''}`} aria-label="Bookmark scenario" data-testid="quiz-bookmark"><Bookmark size={16}/></button></div><h2>{q.title}</h2><p className="scenario-text">{q.systemScenario}</p><div className="constraints"><span className="eyebrow">ARCHITECTURAL CONSTRAINTS</span>{q.architecturalConstraints.map((c,i)=><div key={c}><span>{String(i+1).padStart(2,'0')}</span>{c}</div>)}</div><div className="answer-section"><span className="eyebrow">WHICH PATTERN FITS BEST?</span><div className="answer-options">{q.options.map((o,i)=><button disabled={answered} onClick={() => answer(o.id)} className={`answer-option ${selected===o.id ? o.isCorrect?'correct':'incorrect' : answered && o.isCorrect?'correct-reveal':''}`} key={o.id} data-testid={`quiz-answer-${o.id}`}><span className="option-key">{String.fromCharCode(65+i)}</span><b>{o.patternName}</b>{selected===o.id && (o.isCorrect ? <Check size={16}/> : <X size={16}/>)}{answered && o.isCorrect && selected!==o.id && <Check size={15}/>}</button>)}</div></div>{answered && <div className={`feedback ${q.options.find(o=>o.id===selected)?.isCorrect?'feedback-good':'feedback-review'}`} aria-live="polite"><div className="feedback-icon">{q.options.find(o=>o.id===selected)?.isCorrect?<Check size={16}/>:<Lightbulb size={16}/>}</div><div><b>{q.options.find(o=>o.id===selected)?.isCorrect?'Good read.':'Look at the constraint again.'}</b><p>{q.deepExplanation}</p><small>MEMORY RULE · {q.memoryRule}</small></div></div>}<div className="question-nav"><button className="subtle-btn" onClick={() => go(-1)} data-testid="quiz-previous"><ChevronLeft size={15}/> Previous</button><div>{questions.map((item,i)=><button className={`question-dot ${i===index?'current':''} ${saved.progress[item.id]?'done':''}`} key={item.id} onClick={() => setIndex(i)} aria-label={`Go to scenario ${i+1}`}/>)}</div><button className="subtle-btn" onClick={() => go(1)} data-testid="quiz-next">Next <ChevronRight size={15}/></button></div></article><aside className="notes-card"><div className="notes-header"><div><span className="eyebrow">YOUR FIELD NOTES</span><h3>Keep a thought.</h3></div><span className="notes-mark">01</span></div><p>Write down the clue that made this pattern click.</p><textarea aria-label="Personal notes for scenario" placeholder="What did you notice about the constraints?" value={current?.note || ''} onChange={e => setSaved(s => { const old = s.progress[q.id] || {attempts:0,correct:0,bookmarked:false,note:'',box:1}; return {...s, progress:{...s.progress,[q.id]:{...old,note:e.target.value}}};})} data-testid="quiz-notes"/><div className="notes-bottom"><span><Check size={12}/> SAVED LOCALLY</span><span>BOX {current?.box || 1} / 5</span></div><div className="notes-separator"/><div className="notes-meta"><span>RECALL STAGE</span><div className="leitner">{[1,2,3,4,5].map(i=><i className={i <= (current?.box || 1)?'filled':''} key={i}/>)}</div></div><p className="leitner-copy">Correct answers move this card forward. Misses return it to the start.</p></aside></div><div className="quiz-bottom-note"><span className="eyebrow">HOW TO GET BETTER</span><p>Before choosing a name, say the decision out loud: <b>“I need to vary ___ without changing ___.”</b></p><button onClick={() => { if (window.confirm('Clear all quiz attempts, notes, and bookmarks?')) setSaved(s => ({...s, progress:{}, bookmarks:[]})); }} data-testid="reset-progress"><RotateCcw size={14}/> Reset practice</button></div></div>;
}
function PatternDialog({ pattern: p, saved, onClose, onBookmark, goCode }: { pattern: Pattern; saved: Saved; onClose: () => void; onBookmark: (id: string) => void; goCode: () => void }) {
  const [tab, setTab] = useState('overview');
  useEffect(() => { const listener = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, [onClose]);
  const tabs = ['overview', 'code', 'diagrams', 'trade-offs'];
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="pattern-modal" role="dialog" aria-modal="true" aria-labelledby="pattern-title">
        <div className="modal-accent"/>
        <div className="modal-head">
          <span className={`category-tag ${categoryStyle[p.category]}`}>{p.category}</span>
          <div>
            <button className={`bookmark-btn ${saved.bookmarks.includes(p.id) ? 'saved' : ''}`} onClick={() => onBookmark(p.id)} aria-label="Save pattern" data-testid="detail-bookmark">
              {saved.bookmarks.includes(p.id) ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>}
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close details" data-testid="close-pattern-details"><X size={19}/></button>
          </div>
        </div>
        <span className="eyebrow">PATTERN NOTES / {p.category.toUpperCase()}</span>
        <h2 id="pattern-title">{p.name}<span>.</span></h2>
        <p className="modal-tagline">{p.tagline}</p>
        <div className="modal-memory"><Lightbulb size={16}/><span>{p.memoryHook}</span><i>MEMORY HOOK</i></div>
        <div className="detail-tabs" role="tablist" aria-label="Pattern details">
          {tabs.map(t => (
            <button role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)} data-testid={`detail-tab-${t}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="detail-scroll">
          {tab === 'overview' && <PatternOverview pattern={p}/>}
          {tab === 'code' && <PatternCode pattern={p} goCode={goCode}/>}
          {tab === 'diagrams' && <PatternDiagrams patternId={p.id} patternName={p.name} theme={saved.theme}/>}
          {tab === 'trade-offs' && <PatternTradeoffs pattern={p}/>}
        </div>
        <div className="modal-foot">
          <span><kbd>ESC</kbd> to close</span>
          <button className="text-button" onClick={onClose}>Back to library <ArrowRight size={14}/></button>
        </div>
      </section>
    </div>
  );
}
function PatternOverview({ pattern: p }: { pattern: Pattern }) {
  return <>
    <div className="detail-block"><span className="eyebrow">THE INTENT</span><p className="intent-quote">{p.intent}</p></div>
    <div className="detail-pair">
      <div><span className="eyebrow">THE PROBLEM</span><p>{p.problem}</p></div>
      <div><span className="eyebrow">THE SOLUTION</span><p>{p.solution}</p></div>
    </div>
    <div className="detail-block"><span className="eyebrow">IN THE WILD</span><p>{p.realWorldEnterpriseScenario}</p></div>
    <div className="detail-pair usage-pair">
      <div><span className="eyebrow">USE IT WHEN</span>{p.whenToUse.map(v => <p className="bullet" key={v}><Check size={13}/>{v}</p>)}</div>
      <div><span className="eyebrow">THINK TWICE WHEN</span>{p.whenNotToUse.map(v => <p className="bullet no" key={v}><X size={13}/>{v}</p>)}</div>
    </div>
    <div className="detail-block diagram"><span className="eyebrow">COLLABORATION SHAPE</span><pre>{p.asciiShape}</pre></div>
  </>;
}
function PatternCode({ pattern: p, goCode }: { pattern: Pattern; goCode: () => void }) {
  return <>
    <p className="code-explanation">{p.typeScriptImplementation.explanation}</p>
    <div className="detail-code">
      <div><span className="file-dot"/> {p.typeScriptImplementation.fileName}</div>
      <pre>{p.typeScriptImplementation.code}</pre>
    </div>
    <button className="primary-btn modal-run" onClick={goCode}><Code2 size={15}/> Open in playground <ArrowRight size={15}/></button>
  </>;
}
function PatternTradeoffs({ pattern: p }: { pattern: Pattern }) {
  return <>
    <div className="detail-block">
      <span className="eyebrow">WHAT IT SUPPORTS</span>
      {p.solidPrinciples.map(x => <div className="solid-row" key={x.principle}><span className={`impact ${x.impact}`}>{x.impact}</span><div><b>{x.principle}</b><p>{x.explanation}</p></div></div>)}
    </div>
    <div className="detail-block">
      <span className="eyebrow">EASY TO CONFUSE WITH</span>
      {p.confusedWith.map(x => <div className="confused-row" key={x.targetPattern}><b>{x.targetPattern}</b><p>{x.keyDifference}</p><small>DECISION RULE · {x.decisionRule}</small></div>)}
    </div>
    <div className="detail-block traps"><span className="eyebrow">INTERVIEW TRAPS</span>{p.interviewTraps.map(t => <p key={t}><span>!</span>{t}</p>)}</div>
  </>;
}
function PageIntro({ index, title, text }: { index: string; title: React.ReactNode; text: string }) { return <section className="page-intro"><span className="eyebrow"><i className="eyebrow-line"/>{index}</span><h1>{title}</h1><p>{text}</p><div className="intro-stamp"><Layers3 size={17}/><span>THE FIELD<br/>GUIDE</span></div></section>; }
function BackupDialog({ onClose, onExport, onRestore, onZip, onDownloadSource, zipBusy, theme, toggleTheme }: { onClose: () => void; onExport: () => void; onRestore: (f?: File) => void; onZip: () => void; onDownloadSource: () => void; zipBusy: boolean; theme: string; toggleTheme: () => void }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="backup-modal" role="dialog" aria-modal="true" aria-labelledby="backup-title"><div className="modal-head"><span className="eyebrow">YOUR WORKSPACE</span><button className="icon-btn" onClick={onClose} aria-label="Close settings"><X size={18}/></button></div><h2 id="backup-title">Keep your<br/><em>work close.</em></h2><p className="backup-intro">Everything stays in this browser. Carry your notes and learning history with you whenever you need.</p><div className="setting-row"><div className="setting-icon"><Settings2 size={17}/></div><div><b>Appearance</b><small>Choose the tone of your workspace</small></div><button className="theme-toggle" onClick={toggleTheme} data-testid="settings-theme">{theme==='light'?<Moon size={15}/>:<Sun size={15}/>} {theme==='light'?'Light':'Dark'}</button></div><div className="backup-actions"><button onClick={onExport} data-testid="export-json"><FileJson2 size={17}/><span><b>Export learning state</b><small>Bookmarks, notes, settings · JSON</small></span><Download size={16}/></button><label className="restore-action"><FileJson2 size={17}/><span><b>Restore from backup</b><small>Replace this browser's saved state</small></span><ArrowUpRight size={16}/><input type="file" accept=".json,application/json" onChange={e => onRestore(e.target.files?.[0])} aria-label="Choose backup file" data-testid="restore-json"/></label><button onClick={onZip} disabled={zipBusy} data-testid="download-project"><Download size={17}/><span><b>{zipBusy?'Preparing archive…':'Download project ZIP'}</b><small>Pattern catalog, scenarios & local state</small></span><ArrowUpRight size={16}/></button><button onClick={onDownloadSource} data-testid="download-source"><Code2 size={17}/><span><b>Download full workspace source</b><small>Workspace code and setup files · ZIP</small></span><Download size={16}/></button></div><div className="privacy-note"><ShieldCheck size={16}/><span><b>Private by design</b><br/>No account or sync. Learning data stays in this browser; the source ZIP contains workspace code and setup files only.</span></div></section></div>;
}
function NotFound({ goHome }: { goHome: () => void }) { return <div className="not-found"><span className="eyebrow">404 / WRONG TURN</span><h1>This path<br/><em>isn't in the guide.</em></h1><button className="primary-btn" onClick={goHome}>Return to the library <ArrowRight size={15}/></button></div>; }
function progressListCount(s: Saved) { return Object.values(s.progress).reduce((a,p)=>a+p.attempts,0); }
function accuracy(s: Saved) { const ps=Object.values(s.progress); const total=ps.reduce((a,p)=>a+p.attempts,0); return total ? Math.round(ps.reduce((a,p)=>a+p.correct,0)/total*100) : 0; }
function download(blob: Blob, name: string) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=name;a.click(); URL.revokeObjectURL(url); }
function zipStore(files: [string,string][]) {
  const enc = new TextEncoder(); const chunks: Uint8Array[]=[]; const central: Uint8Array[]=[]; let offset=0;
  const put=(arr:Uint8Array,pos:number,val:number)=>{arr[pos]=val&255;arr[pos+1]=(val>>>8)&255;arr[pos+2]=(val>>>16)&255;arr[pos+3]=(val>>>24)&255;};
  const crc32=(data:Uint8Array)=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
  for(const [name,body] of files){const n=enc.encode(name),d=enc.encode(body),crc=crc32(d),local=new Uint8Array(30+n.length+d.length);put(local,0,0x04034b50);local[4]=20;put(local,14,crc);put(local,18,d.length);put(local,22,d.length);local[26]=n.length;local.set(n,30);local.set(d,30+n.length);chunks.push(local);const c=new Uint8Array(46+n.length);put(c,0,0x02014b50);c[4]=20;c[6]=20;put(c,16,crc);put(c,20,d.length);put(c,24,d.length);c[28]=n.length;put(c,42,offset);c.set(n,46);central.push(c);offset+=local.length;}
  const start=offset, centralSize=central.reduce((a,x)=>a+x.length,0);const end=new Uint8Array(22);put(end,0,0x06054b50);end[8]=files.length;end[10]=files.length;put(end,12,centralSize);put(end,16,start);const parts=[...chunks,...central,end].map(part=>new Uint8Array(part).buffer as ArrayBuffer);return new Blob(parts);
}
export default App;
