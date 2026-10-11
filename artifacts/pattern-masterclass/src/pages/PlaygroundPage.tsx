import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { buildProjectFiles } from '../data/playground-starters';
import { AppTooltip } from '../components/ui/app-tooltip';

interface PlaygroundPageProps {
  initialPatternId?: string;
  saved: { mode?: string; theme?: string; studioMode?: boolean };
  setSaved: React.Dispatch<React.SetStateAction<any>>;
}

type LayoutMode = 'stacked' | 'split';

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  initialPatternId,
  saved,
  setSaved,
}) => {
  // 1. Language & Pattern selection
  const [patternId, setPatternId] = useState(() => {
    // Check URL search params for deep links (?pattern=abstract-factory)
    const sp = new URLSearchParams(window.location.search);
    return sp.get('pattern') || initialPatternId || 'factory-method';
  });

  // Sync patternId whenever URL query param (?pattern=...) changes
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qp = sp.get('pattern');
    if (qp && qp !== patternId && PATTERNS.some((p) => p.id === qp)) {
      setPatternId(qp);
    }
  }, [patternId]);

  const language = (saved.mode === 'java' ? 'java' : 'typescript') as 'typescript' | 'java';

  // 2. Layout preferences (persisted in localStorage)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const savedLayout = localStorage.getItem('gof_playground_layout');
    return savedLayout === 'split' ? 'split' : 'stacked';
  });

  const isStudioMode = Boolean(saved.studioMode);

  const [isWide, setIsWide] = useState<boolean>(() => {
    return localStorage.getItem('gof_playground_wide') === 'true';
  });

  const [wordWrap, setWordWrap] = useState<boolean>(() => {
    return localStorage.getItem('gof_playground_word_wrap') === 'true';
  });

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

  const toggleWordWrap = useCallback(() => {
    setWordWrap((prev) => {
      const next = !prev;
      localStorage.setItem('gof_playground_word_wrap', String(next));
      return next;
    });
  }, []);

  const toggleLayoutMode = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('gof_playground_layout', mode);
  };

  const toggleWide = () => {
    setIsWide((prev) => {
      const next = !prev;
      localStorage.setItem('gof_playground_wide', String(next));
      return next;
    });
  };

  // 3. Multi-file Project State
  const pattern: Pattern = useMemo(() => {
    return PATTERNS.find((p) => p.id === patternId) || PATTERNS[0];
  }, [patternId]);

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(() => {
    return createInitialFiles(pattern, language);
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return projectFiles[0]?.id || 'main';
  });

  // Reference for synchronizing line numbers scroll with textarea in Split View
  const splitLineNumbersRef = useRef<HTMLDivElement>(null);
  // Reference for synchronizing line numbers scroll with textarea in Stacked View
  const stackedLineNumbersRef = useRef<HTMLDivElement>(null);

  // Reload project files when pattern or language changes
  useEffect(() => {
    const initial = createInitialFiles(pattern, language);
    setProjectFiles(initial);
    setActiveFileId(initial[0]?.id || 'main');
    clearOutput();
  }, [patternId, language]);

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
      timeoutMs: 5000,
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
    if (window.confirm(`Reset "${pattern.name}" project files back to original template?`)) {
      const resetFiles = createInitialFiles(pattern, language);
      setProjectFiles(resetFiles);
      setActiveFileId(resetFiles[0]?.id || 'main');
      clearOutput();
    }
  };

  const toggleLanguageMode = (newMode: 'java' | 'typescript') => {
    setSaved((s: any) => ({ ...s, mode: newMode }));
  };

  // Active code lines for line numbers
  const currentCode = activeFile?.content || '';
  const lineCount = currentCode.split('\n').length;

  return (
    <div
      className={`page-content reveal playground-page ${isStudioMode ? 'playground-wide' : isWide ? 'playground-wide' : ''} ${saved.theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
      data-theme={saved.theme || 'light'}
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
          onSelectPattern={(newId) => setPatternId(newId)}
        />

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
                  onSelectFile={setActiveFileId}
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
                    <AppTooltip content="Toggle Word Wrap" shortcut="Alt+Z">
                      <button
                        type="button"
                        className={`subtle-btn ${wordWrap ? 'active' : ''}`}
                        onClick={toggleWordWrap}
                        aria-label="Toggle Word Wrap"
                      >
                        <WrapText size={13} /> Wrap: {wordWrap ? 'On' : 'Off'}
                      </button>
                    </AppTooltip>
                    <AppTooltip content={`Copy active file (${activeFile?.name}) to clipboard`}>
                      <button
                        type="button"
                        className={`subtle-btn ${copiedMode === 'file' ? 'copied-active' : ''}`}
                        onClick={handleCopyActiveFile}
                        data-testid="copy-code"
                        aria-label="Copy active file"
                      >
                        {copiedMode === 'file' ? (
                          <>
                            <Check size={13} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy
                          </>
                        )}
                      </button>
                    </AppTooltip>
                    <AppTooltip content="Copy all project files combined to clipboard">
                      <button
                        type="button"
                        className={`subtle-btn ${copiedMode === 'all' ? 'copied-active' : ''}`}
                        onClick={handleCopyAllFiles}
                        data-testid="copy-all-code"
                        aria-label="Copy all files"
                      >
                        {copiedMode === 'all' ? (
                          <>
                            <Check size={13} /> All copied!
                          </>
                        ) : (
                          <>
                            <Files size={13} /> Copy all
                          </>
                        )}
                      </button>
                    </AppTooltip>
                    <AppTooltip content="Reset project files to clean starter code">
                      <button
                        type="button"
                        className="subtle-btn"
                        onClick={handleResetProject}
                        data-testid="reset-code"
                        aria-label="Reset files to default code"
                      >
                        <RotateCcw size={13} /> Reset
                      </button>
                    </AppTooltip>
                  </div>
                </div>

                <div className="editor-body split-editor-body">
                  <div className="line-numbers" ref={splitLineNumbersRef} aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                    ))}
                  </div>
                  <textarea
                    spellCheck={false}
                    aria-label={`Editable code for ${activeFile?.name}`}
                    value={currentCode}
                    onChange={(e) => handleUpdateCode(e.target.value)}
                    onKeyDown={(e) => handleTabKey(e, handleUpdateCode)}
                    onScroll={(e) => {
                      if (splitLineNumbersRef.current) {
                        splitLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                      }
                    }}
                    data-testid="code-editor"
                    className={wordWrap ? 'word-wrap-enabled' : ''}
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
              onSelectFile={setActiveFileId}
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
                <AppTooltip content="Toggle Word Wrap" shortcut="Alt+Z">
                  <button
                    type="button"
                    className={`subtle-btn ${wordWrap ? 'active' : ''}`}
                    onClick={toggleWordWrap}
                    aria-label="Toggle Word Wrap"
                  >
                    <WrapText size={13} /> Wrap: {wordWrap ? 'On' : 'Off'}
                  </button>
                </AppTooltip>
                <AppTooltip content={`Copy active file (${activeFile?.name}) to clipboard`}>
                  <button
                    type="button"
                    className={`subtle-btn ${copiedMode === 'file' ? 'copied-active' : ''}`}
                    onClick={handleCopyActiveFile}
                    data-testid="copy-code"
                    aria-label="Copy active file"
                  >
                    {copiedMode === 'file' ? (
                      <>
                        <Check size={13} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </AppTooltip>
                <AppTooltip content="Copy all project files combined to clipboard">
                  <button
                    type="button"
                    className={`subtle-btn ${copiedMode === 'all' ? 'copied-active' : ''}`}
                    onClick={handleCopyAllFiles}
                    data-testid="copy-all-code"
                    aria-label="Copy all files"
                  >
                    {copiedMode === 'all' ? (
                      <>
                        <Check size={13} /> All copied!
                      </>
                    ) : (
                      <>
                        <Files size={13} /> Copy all
                      </>
                    )}
                  </button>
                </AppTooltip>
                <AppTooltip content="Reset project files to clean starter code">
                  <button
                    type="button"
                    className="subtle-btn"
                    onClick={handleResetProject}
                    data-testid="reset-code"
                    aria-label="Reset files to default code"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </AppTooltip>
              </div>
            </div>

            <div className="editor-body stacked-editor-body">
              <div className="line-numbers" ref={stackedLineNumbersRef} aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                ))}
              </div>
              <textarea
                spellCheck={false}
                aria-label={`Editable code for ${activeFile?.name}`}
                value={currentCode}
                onChange={(e) => handleUpdateCode(e.target.value)}
                onKeyDown={(e) => handleTabKey(e, handleUpdateCode)}
                onScroll={(e) => {
                  if (stackedLineNumbersRef.current) {
                    stackedLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
                data-testid="code-editor"
                className={wordWrap ? 'word-wrap-enabled' : ''}
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

// Helper: Tab key indent handling (inserts 2 spaces)
function handleTabKey(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  updateFn: (val: string) => void
) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const val = target.value;
    const next = val.substring(0, start) + '  ' + val.substring(end);
    updateFn(next);
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + 2;
    }, 0);
  }
}

// Helper: Seed initial project files from pattern data
function createInitialFiles(pattern: Pattern, language: 'typescript' | 'java'): ProjectFile[] {
  return buildProjectFiles(pattern, language);
}

export default PlaygroundPage;
