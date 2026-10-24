import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  ChevronDown,
  Columns,
  Rows,
  Lightbulb,
  Square,
  WrapText,
  BookOpen,
  Check,
  Files,
  FileCode,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { PATTERNS } from '../data';
import type { Pattern } from '../data';
import { PlaygroundFileTabs, type ProjectFile } from '../components/PlaygroundFileTabs';
import { PlaygroundTerminal } from '../components/PlaygroundTerminal';
import { PlaygroundPatternCombobox } from '../components/PlaygroundPatternCombobox';
import { NotesDrawer } from '../components/NotesDrawer';
import { PlaygroundDocContent } from '../components/PlaygroundDocContent';
import { useCodeRunner } from '../hooks/useCodeRunner';
import {
  buildProjectFiles,
  BLANK_PROJECT_ID,
  BLANK_PATTERN,
  type PlaygroundCodeSource,
} from '../data/playground-starters';
import { AppTooltip } from '../components/ui/app-tooltip';
import { PlaygroundCodeEditor } from '../components/PlaygroundCodeEditor';
import { useWorkspacePreferencesStore, useLearningStore } from '../stores';

export interface PlaygroundPageProps {
  initialPatternId?: string;
}

type LayoutMode = 'stacked' | 'split';

export function PlaygroundPage({
  initialPatternId,
}: PlaygroundPageProps = {}) {
  // 1. Language & Pattern selection
  const [patternId, setPatternId] = useState(() => {
    // Check URL search params for deep links (?pattern=abstract-factory)
    const sp = new URLSearchParams(window.location.search);
    return sp.get('pattern') || initialPatternId || 'factory-method';
  });

  const handleSelectPattern = useCallback((newId: string) => {
    setPatternId(newId);
    setLocalSource(null); // Reset local override so newly selected pattern defaults to globalPerspective
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('pattern', newId);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore in environments without history api
    }
  }, []);

  // Sync patternId whenever browser back/forward (popstate) occurs
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const qp = sp.get('pattern');
      if (qp && (PATTERNS.some((p) => p.id === qp) || qp === BLANK_PROJECT_ID)) {
        setPatternId(qp);
        setLocalSource(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const mode = useLearningStore((s) => s.mode);
  const setMode = useLearningStore((s) => s.setMode);
  const studioMode = useLearningStore((s) => s.studioMode);
  const theme = useLearningStore((s) => s.theme);
  const globalPerspective = useLearningStore((s) => s.perspective);

  // Local perspective override ('canonical' | 'enterprise' | 'curated'), defaults to null (synced with global)
  const [localSource, setLocalSource] = useState<PlaygroundCodeSource | null>(null);
  const activeSource: PlaygroundCodeSource = localSource ?? globalPerspective;

  const language = (mode === 'java' ? 'java' : 'typescript') as 'typescript' | 'java';

  // 2. Layout preferences (persisted in Zustand store)
  const layoutMode = useWorkspacePreferencesStore((s) => s.playgroundLayout);
  const toggleLayoutMode = useWorkspacePreferencesStore((s) => s.setPlaygroundLayout);
  const isWide = useWorkspacePreferencesStore((s) => s.playgroundWide);
  const toggleWide = useWorkspacePreferencesStore((s) => s.togglePlaygroundWide);
  const wordWrap = useWorkspacePreferencesStore((s) => s.playgroundWordWrap);
  const toggleWordWrap = useWorkspacePreferencesStore((s) => s.togglePlaygroundWordWrap);

  const isStudioMode = Boolean(studioMode);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [copiedMode, setCopiedMode] = useState<'none' | 'file' | 'all'>('none');

  const handleCopyActiveFile = async () => {
    const ok = await copyTextToClipboard(currentCode);
    if (ok) {
      setCopiedMode('file');
      setTimeout(() => setCopiedMode('none'), 2000);
    }
  };

  const handleCopyAllFiles = async () => {
    const bundle = projectFiles
      .map((file) => {
        const banner = `// ==========================================\n// File: ${file.name}${file.isEntryPoint ? ' ⭐ [Entry Point]' : ''}\n// ==========================================\n`;
        return `${banner}${file.content.trim()}\n`;
      })
      .join('\n\n');

    const ok = await copyTextToClipboard(bundle);
    if (ok) {
      setCopiedMode('all');
      setTimeout(() => setCopiedMode('none'), 2000);
    }
  };

  // 3. Multi-file Project State
  const pattern: Pattern = useMemo(() => {
    if (patternId === BLANK_PROJECT_ID) {
      return BLANK_PATTERN;
    }
    return PATTERNS.find((p) => p.id === patternId) || PATTERNS[0];
  }, [patternId]);

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(() => {
    return createInitialFiles(pattern, language, activeSource);
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return projectFiles[0]?.id || 'main';
  });

  const [targetLine, setTargetLine] = useState<number | null>(null);

  const handleSelectFileAndLine = useCallback((fileId: string, lineNumber?: number) => {
    setActiveFileId(fileId);
    if (lineNumber) {
      setTargetLine(lineNumber);
    }
  }, []);

  // Reload project files when pattern, language, or perspective source changes
  useEffect(() => {
    const initial = createInitialFiles(pattern, language, activeSource);
    setProjectFiles(initial);
    setActiveFileId(initial[0]?.id || 'main');
    clearOutput();
  }, [patternId, language, activeSource]);

  const activeFile = useMemo(() => {
    return projectFiles.find((f) => f.id === activeFileId) || projectFiles[0];
  }, [projectFiles, activeFileId]);

  // 4. Code Execution Hook
  const { result, isRunning, runCode, cancelRun, clearOutput } = useCodeRunner();

  const handleRun = useCallback(() => {
    if (isRunning) {
      cancelRun();
      return;
    }

    const entryFile = projectFiles.find((f) => f.isEntryPoint) || projectFiles[0];
    runCode({
      language,
      files: projectFiles.map((f) => ({ name: f.name, content: f.content })),
      entryPoint: entryFile?.name,
      timeoutMs: 25000,
    });
  }, [isRunning, cancelRun, runCode, language, projectFiles]);

  // Keyboard shortcuts: Ctrl+Enter (Run code), Alt+Z (Toggle word wrap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        toggleWordWrap();
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setIsGuideOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, toggleWordWrap]);

  // 5. File Operations
  const handleUpdateCode = (newContent: string) => {
    setProjectFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
  };

  const handleAddFile = (fileName: string) => {
    const newId = `file-${Date.now()}`;
    const defaultTemplate =
      language === 'java'
        ? `public class ${fileName.replace(/\.java$/, '')} {\n    // Helper class\n}\n`
        : `export class ${fileName.replace(/\.ts$/, '')} {\n    // Helper module\n}\n`;

    const newFile: ProjectFile = {
      id: newId,
      name: fileName,
      content: defaultTemplate,
      isEntryPoint: false,
    };

    setProjectFiles((prev) => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const handleDeleteFile = (fileId: string) => {
    setProjectFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(filtered[0]?.id || 'main');
      }
      return filtered;
    });
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setProjectFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
    );
  };

  const handleResetProject = () => {
    const title = pattern.id === BLANK_PROJECT_ID ? 'Blank Scratchpad' : `"${pattern.name}"`;
    if (window.confirm(`Reset ${title} project files back to original template?`)) {
      const resetFiles = createInitialFiles(pattern, language, activeSource);
      setProjectFiles(resetFiles);
      setActiveFileId(resetFiles[0]?.id || 'main');
      clearOutput();
    }
  };

  const toggleLanguageMode = (newMode: 'java' | 'typescript') => {
    setMode(newMode);
  };

  // Active code for editor
  const currentCode = activeFile?.content || '';

  return (
    <div
      className={`page-content reveal playground-page ${isStudioMode ? 'playground-wide' : isWide ? 'playground-wide' : ''} ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
      data-theme={theme}
    >
      {/* 1. Header intro */}
      <div className="page-intro">
        <div className="intro-left">
          <span className="eyebrow"><i className="eyebrow-line" />03 / WORKSHOP</span>
          <h1>
            Read the shape.<br />
            <em>Run the idea.</em>
          </h1>
        </div>
        <div className="intro-right">
          <p>
            A live, multi-file execution environment. Modify code, link classes across tabs, and execute against real {language === 'java' ? 'Java 25 LTS' : 'TypeScript Web Workers'} with instant feedback.
          </p>
        </div>
        <div className="intro-stamp">
          <Code2 size={17} />
          <span>LIVE<br />WORKSHOP</span>
        </div>
      </div>

      {/* 2. Playground Toolbar */}
      <div className="playground-toolbar">
        {/* Pattern Search Combobox */}
        <PlaygroundPatternCombobox
          selectedPatternId={patternId}
          onSelectPattern={handleSelectPattern}
        />

        {/* Pattern Study Guide Direct Navigation Link */}
        {patternId !== BLANK_PROJECT_ID && (
          <AppTooltip content={`Read ${pattern.name} architectural documentation & trade-offs`}>
            <Link
              to={`/pattern/${pattern.id}`}
              className="subtle-btn playground-view-pattern-btn"
              data-testid="view-pattern-study-link"
              aria-label={`Open ${pattern.name} guide`}
            >
              <BookOpen size={13} />
              <span>Pattern Guide</span>
            </Link>
          </AppTooltip>
        )}

        {/* Dedicated Blank Scratchpad Quick-Toggle Button */}
        {patternId !== BLANK_PROJECT_ID ? (
          <AppTooltip content="Open blank editor with default method calling to practice your own code">
            <button
              type="button"
              className="subtle-btn playground-blank-btn"
              onClick={() => handleSelectPattern(BLANK_PROJECT_ID)}
              aria-label="Switch to Blank Editor"
              data-testid="switch-blank-editor-btn"
            >
              <FileCode size={13} />
              <span>Blank Scratchpad</span>
            </button>
          </AppTooltip>
        ) : (
          <div className="playground-scratchpad-pill">
            <FileCode size={13} />
            <span>Active Scratchpad</span>
          </div>
        )}

        {/* Local Perspective Switcher: Canonical | Enterprise | Curated */}
        {patternId !== BLANK_PROJECT_ID && (
          <div className="playground-source-switch" role="radiogroup" aria-label="Code Perspective">
            <AppTooltip content="Canonical GoF Reference (Academic / Refactoring Guru)">
              <button
                type="button"
                role="radio"
                aria-checked={activeSource === 'canonical'}
                className={`source-pill ${activeSource === 'canonical' ? 'active' : ''}`}
                onClick={() => setLocalSource('canonical')}
                data-testid="playground-source-canonical"
              >
                <GraduationCap size={13} />
                <span>Canonical</span>
              </button>
            </AppTooltip>

            <AppTooltip content="Enterprise Cloud Architecture (Production Distributed Systems)">
              <button
                type="button"
                role="radio"
                aria-checked={activeSource === 'enterprise'}
                className={`source-pill ${activeSource === 'enterprise' ? 'active' : ''}`}
                onClick={() => setLocalSource('enterprise')}
                data-testid="playground-source-enterprise"
              >
                <Building2 size={13} />
                <span>Enterprise</span>
              </button>
            </AppTooltip>

            <AppTooltip content="Curated Modular Project (Multi-file OOP Architecture)">
              <button
                type="button"
                role="radio"
                aria-checked={activeSource === 'curated'}
                className={`source-pill ${activeSource === 'curated' ? 'active' : ''}`}
                onClick={() => setLocalSource('curated')}
                data-testid="playground-source-curated"
              >
                <Files size={13} />
                <span>Curated</span>
              </button>
            </AppTooltip>

            {localSource !== null && (
              <AppTooltip content={`Reset to global perspective (${globalPerspective === 'canonical' ? 'Canonical' : 'Enterprise'})`}>
                <button
                  type="button"
                  className="source-reset-btn"
                  onClick={() => setLocalSource(null)}
                  aria-label="Reset perspective to global default"
                  data-testid="reset-playground-source"
                >
                  <RotateCcw size={12} />
                </button>
              </AppTooltip>
            )}
          </div>
        )}

        {/* Language Switcher */}
        <div className="language-switch" role="group" aria-label="Code language">
          <button
            type="button"
            onClick={() => toggleLanguageMode('java')}
            className={language === 'java' ? 'active' : ''}
            data-testid="language-java"
          >
            Java
          </button>
          <button
            type="button"
            onClick={() => toggleLanguageMode('typescript')}
            className={language === 'typescript' ? 'active' : ''}
            data-testid="language-typescript"
          >
            TypeScript
          </button>
        </div>

        {/* Run Button */}
        <AppTooltip content="Execute code in browser sandbox" shortcut="Ctrl+Enter">
          <button
            type="button"
            className={`run-btn playground-run-action ${isRunning ? 'running' : ''}`}
            onClick={handleRun}
            data-testid="run-example"
            aria-label="Run code"
          >
            {isRunning ? (
              <>
                <Square size={13} fill="currentColor" /> Stop
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> Run code
              </>
            )}
          </button>
        </AppTooltip>

        {/* Layout Switcher (Stacked vs Side-by-Side Split) */}
        <div className="playground-view-controls">
          <div className="layout-toggle-group" role="group" aria-label="Editor layout mode">
            <AppTooltip content="Stacked vertical flow (Full width, single scroll)">
              <button
                type="button"
                className={`layout-btn ${layoutMode === 'stacked' ? 'active' : ''}`}
                onClick={() => toggleLayoutMode('stacked')}
                data-testid="layout-stacked"
                aria-label="Stacked layout"
              >
                <Rows size={14} />
                <span>Stacked</span>
              </button>
            </AppTooltip>
            <AppTooltip content="Side-by-side resizable split view (Sliding window)">
              <button
                type="button"
                className={`layout-btn ${layoutMode === 'split' ? 'active' : ''}`}
                onClick={() => toggleLayoutMode('split')}
                data-testid="layout-split"
                aria-label="Split layout"
              >
                <Columns size={14} />
                <span>Split</span>
              </button>
            </AppTooltip>
          </div>

          <AppTooltip content="Open Playground Guide & Language Standards" shortcut="F1">
            <button
              type="button"
              className="subtle-btn playground-guide-trigger"
              onClick={() => setIsGuideOpen(true)}
              aria-label="Open Playground Guide & Language Standards"
              data-testid="playground-guide-button"
            >
              <BookOpen size={13} />
              <span>Guide & Rules</span>
            </button>
          </AppTooltip>
        </div>
      </div>

      {/* 3. Main Workspace Area: Dual Mode */}
      {layoutMode === 'split' ? (
        /* MODE B: SIDE-BY-SIDE RESIZABLE SPLIT (Sliding Window Divider) */
        <div className="playground-split-wrapper">
          <PanelGroup direction="horizontal" autoSaveId="gof-playground-panel-sizes-v2">
            {/* Left Panel: Editor & Tabs (Threshold minSize=48 prevents tab bar shrink and horizontal scroll) */}
            <Panel defaultSize={65} minSize={48} maxSize={80} className="playground-editor-panel">
              <div className="editor-card playground-editor-card split-editor-card">
                <PlaygroundFileTabs
                  files={projectFiles}
                  activeFileId={activeFileId}
                  language={language}
                  onSelectFile={(id) => {
                    setActiveFileId(id);
                    setTargetLine(null);
                  }}
                  onAddFile={handleAddFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                />

                <div className="editor-head">
                  <div className="editor-file-indicator">
                    <span className="file-dot" />
                    <span className="mono">{activeFile?.name}</span>
                    <span className="file-type-badge">{language.toUpperCase()}</span>
                  </div>
                  <div className="editor-tools">
                    <AppTooltip content={`Toggle Word Wrap (${wordWrap ? 'On' : 'Off'})`} shortcut="Alt+Z">
                      <button
                        type="button"
                        className={`subtle-btn icon-only-btn ${wordWrap ? 'active' : ''}`}
                        onClick={toggleWordWrap}
                        aria-label={`Toggle Word Wrap (${wordWrap ? 'On' : 'Off'})`}
                      >
                        <WrapText size={14} />
                      </button>
                    </AppTooltip>
                    <AppTooltip content={copiedMode === 'file' ? 'Active file copied to clipboard!' : `Copy active file (${activeFile?.name})`}>
                      <button
                        type="button"
                        className={`subtle-btn icon-only-btn ${copiedMode === 'file' ? 'copied-active' : ''}`}
                        onClick={handleCopyActiveFile}
                        data-testid="copy-code"
                        aria-label={`Copy active file (${activeFile?.name})`}
                      >
                        {copiedMode === 'file' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </AppTooltip>
                    <AppTooltip content={copiedMode === 'all' ? 'All project files copied!' : 'Copy all project files combined'}>
                      <button
                        type="button"
                        className={`subtle-btn icon-only-btn ${copiedMode === 'all' ? 'copied-active' : ''}`}
                        onClick={handleCopyAllFiles}
                        data-testid="copy-all-code"
                        aria-label="Copy all project files combined"
                      >
                        {copiedMode === 'all' ? <Check size={14} /> : <Files size={14} />}
                      </button>
                    </AppTooltip>
                    <AppTooltip content="Reset project files to clean starter code">
                      <button
                        type="button"
                        className="subtle-btn icon-only-btn"
                        onClick={handleResetProject}
                        data-testid="reset-code"
                        aria-label="Reset files to default code"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </AppTooltip>
                  </div>
                </div>

                <div className="editor-body split-editor-body">
                  <PlaygroundCodeEditor
                    code={currentCode}
                    onChange={handleUpdateCode}
                    language={language}
                    fileName={activeFile?.name}
                    wordWrap={wordWrap}
                    projectFiles={projectFiles}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    onSelectFile={handleSelectFileAndLine}
                    targetLine={targetLine}
                    onTargetLineHandled={() => setTargetLine(null)}
                  />
                </div>
              </div>
            </Panel>

            {/* Draggable Sliding Window Handle */}
            <PanelResizeHandle className="playground-resize-handle">
              <AppTooltip content="Drag to adjust editor/console width">
                <div className="resize-handle-pill">
                  <span />
                </div>
              </AppTooltip>
            </PanelResizeHandle>

            {/* Right Panel: Terminal Output */}
            <Panel defaultSize={35} minSize={20} maxSize={52} className="playground-terminal-panel">
              <PlaygroundTerminal result={result} isRunning={isRunning} onClear={clearOutput} />
            </Panel>
          </PanelGroup>
        </div>
      ) : (
        /* MODE A: STACKED EDITORIAL FLOW (Recommended Default - Unified Single Scroll) */
        <div className="playground-stacked-wrapper">
          <div className="editor-card playground-editor-card">
            <PlaygroundFileTabs
              files={projectFiles}
              activeFileId={activeFileId}
              language={language}
              onSelectFile={(id) => {
                setActiveFileId(id);
                setTargetLine(null);
              }}
              onAddFile={handleAddFile}
              onDeleteFile={handleDeleteFile}
              onRenameFile={handleRenameFile}
            />

            <div className="editor-head">
              <div className="editor-file-indicator">
                <span className="file-dot" />
                <span className="mono">{activeFile?.name}</span>
                <span className="file-type-badge">{language.toUpperCase()}</span>
              </div>
              <div className="editor-tools">
                <AppTooltip content={`Toggle Word Wrap (${wordWrap ? 'On' : 'Off'})`} shortcut="Alt+Z">
                  <button
                    type="button"
                    className={`subtle-btn icon-only-btn ${wordWrap ? 'active' : ''}`}
                    onClick={toggleWordWrap}
                    aria-label={`Toggle Word Wrap (${wordWrap ? 'On' : 'Off'})`}
                  >
                    <WrapText size={14} />
                  </button>
                </AppTooltip>
                <AppTooltip content={copiedMode === 'file' ? 'Active file copied to clipboard!' : `Copy active file (${activeFile?.name})`}>
                  <button
                    type="button"
                    className={`subtle-btn icon-only-btn ${copiedMode === 'file' ? 'copied-active' : ''}`}
                    onClick={handleCopyActiveFile}
                    data-testid="copy-code"
                    aria-label={`Copy active file (${activeFile?.name})`}
                  >
                    {copiedMode === 'file' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </AppTooltip>
                <AppTooltip content={copiedMode === 'all' ? 'All project files copied!' : 'Copy all project files combined'}>
                  <button
                    type="button"
                    className={`subtle-btn icon-only-btn ${copiedMode === 'all' ? 'copied-active' : ''}`}
                    onClick={handleCopyAllFiles}
                    data-testid="copy-all-code"
                    aria-label="Copy all project files combined"
                  >
                    {copiedMode === 'all' ? <Check size={14} /> : <Files size={14} />}
                  </button>
                </AppTooltip>
                <AppTooltip content="Reset project files to clean starter code">
                  <button
                    type="button"
                    className="subtle-btn icon-only-btn"
                    onClick={handleResetProject}
                    data-testid="reset-code"
                    aria-label="Reset files to default code"
                  >
                    <RotateCcw size={14} />
                  </button>
                </AppTooltip>
              </div>
            </div>

            <div className="editor-body stacked-editor-body">
              <PlaygroundCodeEditor
                code={currentCode}
                onChange={handleUpdateCode}
                language={language}
                fileName={activeFile?.name}
                wordWrap={wordWrap}
                projectFiles={projectFiles}
                theme={theme === 'dark' ? 'dark' : 'light'}
                onSelectFile={handleSelectFileAndLine}
                targetLine={targetLine}
                onTargetLineHandled={() => setTargetLine(null)}
              />
            </div>
          </div>

          {/* Terminal Output Stacked Directly Below */}
          <div className="playground-terminal-stacked">
            <PlaygroundTerminal result={result} isRunning={isRunning} onClear={clearOutput} />
          </div>
        </div>
      )}

      {/* 4. What To Notice (Architectural Commentary) */}
      <div className="code-explain">
        <div className="explain-mark">
          <Lightbulb size={17} />
        </div>
        <div>
          <span className="eyebrow">WHAT TO NOTICE · {pattern.name.toUpperCase()}</span>
          <p>
            {language === 'java'
              ? pattern.javaImplementation.explanation
              : pattern.typeScriptImplementation.explanation}
          </p>
        </div>
        <button
          type="button"
          className={`text-button ${copiedMode === 'file' ? 'copied-active' : ''}`}
          onClick={handleCopyActiveFile}
        >
          {copiedMode === 'file' ? 'Snippet copied!' : 'Copy active snippet'}{' '}
          {copiedMode === 'file' ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {/* 5. Generic Slide-Out Notes Drawer (Playground Guide & Language Standards) */}
      <NotesDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        eyebrow="03 / WORKSHOP REFERENCE"
        title="Playground Guide & Standards"
        badge={
          <span className="notes-drawer-lang-badge">
            {language === 'java' ? '☕ JAVA 25 LTS' : '⚡ TYPESCRIPT WORKER'}
          </span>
        }
        subtitle="Multi-file architecture, runtime contracts, zero-import conventions, and execution rules."
        width="36rem"
      >
        <PlaygroundDocContent
          activeLanguage={language}
          onSelectLanguage={(lang) => toggleLanguageMode(lang)}
        />
      </NotesDrawer>
    </div>
  );
};

// Helper: Robust cross-origin copy to clipboard (supports HTTP LAN, localhost, HTTPS)
async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}


// Helper: Seed initial project files from pattern data
function createInitialFiles(
  pattern: Pattern,
  language: 'typescript' | 'java',
  source: PlaygroundCodeSource = 'canonical'
): ProjectFile[] {
  return buildProjectFiles(pattern, language, source);
}

export default PlaygroundPage;
