import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Copy,
  ChevronDown,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Lightbulb,
  Square,
} from 'lucide-react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { PATTERNS } from '../data';
import type { Pattern } from '../data';
import { PlaygroundFileTabs, type ProjectFile } from '../components/PlaygroundFileTabs';
import { PlaygroundTerminal } from '../components/PlaygroundTerminal';
import { useCodeRunner } from '../hooks/useCodeRunner';

interface PlaygroundPageProps {
  initialPatternId?: string;
  saved: { mode?: string; theme?: string };
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

  const language = (saved.mode === 'java' ? 'java' : 'typescript') as 'typescript' | 'java';

  // 2. Layout preferences (persisted in localStorage)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const savedLayout = localStorage.getItem('gof_playground_layout');
    return savedLayout === 'split' ? 'split' : 'stacked';
  });

  const [isWide, setIsWide] = useState<boolean>(() => {
    return localStorage.getItem('gof_playground_wide') === 'true';
  });

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

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to Run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

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
    <div className={`page-content reveal playground-page ${isWide ? 'playground-wide' : ''}`}>
      {/* 1. Header intro */}
      <div className="page-intro">
        <span className="eyebrow">03 / WORKSHOP</span>
        <h1>
          Read the shape.<br />
          <em>Run the idea.</em>
        </h1>
        <p>
          A live, multi-file execution environment. Modify code, link classes across tabs, and execute against real {language === 'java' ? 'Java 25 LTS' : 'TypeScript Web Workers'} with instant feedback.
        </p>
      </div>

      {/* 2. Playground Toolbar */}
      <div className="playground-toolbar">
        {/* Pattern Picker */}
        <label className="select-wrap" title="Select a GoF Design Pattern">
          <Code2 size={15} />
          <select
            aria-label="Select a pattern example"
            value={patternId}
            onChange={(e) => setPatternId(e.target.value)}
            data-testid="playground-pattern"
          >
            {PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={13} />
        </label>

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
        <button
          type="button"
          className={`run-btn playground-run-action ${isRunning ? 'running' : ''}`}
          onClick={handleRun}
          data-testid="run-example"
          title="Run code (Ctrl + Enter)"
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

        {/* Layout Switcher (Stacked vs Side-by-Side Split) */}
        <div className="playground-view-controls">
          <div className="layout-toggle-group" role="group" aria-label="Editor layout mode">
            <button
              type="button"
              className={`layout-btn ${layoutMode === 'stacked' ? 'active' : ''}`}
              onClick={() => toggleLayoutMode('stacked')}
              title="Stacked vertical flow (Full width, single scroll)"
              data-testid="layout-stacked"
            >
              <Rows size={14} />
              <span>Stacked</span>
            </button>
            <button
              type="button"
              className={`layout-btn ${layoutMode === 'split' ? 'active' : ''}`}
              onClick={() => toggleLayoutMode('split')}
              title="Side-by-side resizable split view (Sliding window)"
              data-testid="layout-split"
            >
              <Columns size={14} />
              <span>Split</span>
            </button>
          </div>

          {/* Wide Canvas Toggle */}
          <button
            type="button"
            className={`subtle-btn wide-toggle-btn ${isWide ? 'active' : ''}`}
            onClick={toggleWide}
            title={isWide ? 'Reset to standard width' : 'Expand to full viewport width'}
          >
            {isWide ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Area: Dual Mode */}
      {layoutMode === 'split' ? (
        /* MODE B: SIDE-BY-SIDE RESIZABLE SPLIT (Sliding Window Divider) */
        <div className="playground-split-wrapper">
          <PanelGroup direction="horizontal" autoSaveId="gof-playground-panel-sizes">
            {/* Left Panel: Editor & Tabs */}
            <Panel defaultSize={65} minSize={30} className="playground-editor-panel">
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
                    <button
                      type="button"
                      className="subtle-btn"
                      onClick={() => navigator.clipboard?.writeText(currentCode)}
                      data-testid="copy-code"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <button
                      type="button"
                      className="subtle-btn"
                      onClick={handleResetProject}
                      data-testid="reset-code"
                    >
                      <RotateCcw size={13} /> Reset
                    </button>
                  </div>
                </div>

                <div className="editor-body split-editor-body">
                  <div className="line-numbers" aria-hidden="true">
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
                    data-testid="code-editor"
                  />
                </div>
              </div>
            </Panel>

            {/* Draggable Sliding Window Handle */}
            <PanelResizeHandle className="playground-resize-handle">
              <div className="resize-handle-pill" title="Drag to adjust editor/console width">
                <span />
              </div>
            </PanelResizeHandle>

            {/* Right Panel: Terminal Output */}
            <Panel defaultSize={35} minSize={20} className="playground-terminal-panel">
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
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={() => navigator.clipboard?.writeText(currentCode)}
                  data-testid="copy-code"
                >
                  <Copy size={13} /> Copy
                </button>
                <button
                  type="button"
                  className="subtle-btn"
                  onClick={handleResetProject}
                  data-testid="reset-code"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
            </div>

            <div className="editor-body stacked-editor-body">
              <div className="line-numbers" aria-hidden="true">
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
                data-testid="code-editor"
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
          className="text-button"
          onClick={() => navigator.clipboard?.writeText(currentCode)}
        >
          Copy active snippet <Copy size={13} />
        </button>
      </div>
    </div>
  );
};

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
  if (language === 'java') {
    const rawCode = pattern.javaImplementation.code;
    const fileName = pattern.javaImplementation.fileName || 'Main.java';

    return [
      {
        id: 'main-java',
        name: fileName,
        content: rawCode,
        isEntryPoint: true,
      },
    ];
  }

  // TypeScript
  const rawCode = pattern.runnableCode || pattern.typeScriptImplementation.code;
  const fileName = pattern.typeScriptImplementation.fileName || 'index.ts';

  return [
    {
      id: 'main-ts',
      name: fileName,
      content: rawCode,
      isEntryPoint: true,
    },
  ];
}

export default PlaygroundPage;
