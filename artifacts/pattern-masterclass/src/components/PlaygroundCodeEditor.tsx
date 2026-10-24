import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import Editor, { loader, OnMount, BeforeMount } from '@monaco-editor/react';
import type * as MonacoType from 'monaco-editor';
import { ProjectFile } from './PlaygroundFileTabs';

interface PlaygroundCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: 'typescript' | 'java';
  fileName?: string;
  wordWrap?: boolean;
  projectFiles?: ProjectFile[];
  height?: string;
  theme?: 'light' | 'dark';
  onFormat?: () => void;
  onSelectFile?: (fileId: string, lineNumber?: number) => void;
  targetLine?: number | null;
  onTargetLineHandled?: () => void;
}

// Java Standard Library Completion Items with method signatures and documentation
const JAVA_STDLIB_COMPLETIONS = [
  // System.out / print
  { label: 'System.out.println', insertText: 'System.out.println(${1:arg});', detail: 'void System.out.println(Object x)', doc: 'Prints an argument to stdout and terminates the line.' },
  { label: 'System.out.printf', insertText: 'System.out.printf("${1:%s}\\n", ${2:args});', detail: 'PrintStream System.out.printf(String format, Object... args)', doc: 'Prints a formatted string to stdout.' },
  { label: 'System.out.print', insertText: 'System.out.print(${1:arg});', detail: 'void System.out.print(Object x)', doc: 'Prints an argument to stdout without newline.' },
  { label: 'System.err.println', insertText: 'System.err.println(${1:arg});', detail: 'void System.err.println(Object x)', doc: 'Prints an error message to stderr and terminates the line.' },
  { label: 'System.currentTimeMillis', insertText: 'System.currentTimeMillis()', detail: 'long System.currentTimeMillis()', doc: 'Returns current time in milliseconds UTC.' },

  // List / Collection methods
  { label: 'add', insertText: 'add(${1:element});', detail: 'boolean add(E e)', doc: 'Appends specified element to this collection.' },
  { label: 'get', insertText: 'get(${1:index})', detail: 'E get(int index)', doc: 'Returns element at specified index.' },
  { label: 'size', insertText: 'size()', detail: 'int size()', doc: 'Returns number of elements in this collection.' },
  { label: 'isEmpty', insertText: 'isEmpty()', detail: 'boolean isEmpty()', doc: 'Returns true if collection contains no elements.' },
  { label: 'contains', insertText: 'contains(${1:element})', detail: 'boolean contains(Object o)', doc: 'Returns true if collection contains specified element.' },
  { label: 'remove', insertText: 'remove(${1:index});', detail: 'E remove(int index) / boolean remove(Object o)', doc: 'Removes the element from collection.' },
  { label: 'clear', insertText: 'clear();', detail: 'void clear()', doc: 'Removes all elements from this collection.' },
  { label: 'forEach', insertText: 'forEach(${1:item} -> ${2:action});', detail: 'void forEach(Consumer<? super T> action)', doc: 'Performs action for each element.' },
  { label: 'stream', insertText: 'stream()', detail: 'Stream<E> stream()', doc: 'Returns a sequential Stream over the elements.' },

  // Map methods
  { label: 'put', insertText: 'put(${1:key}, ${2:value});', detail: 'V put(K key, V value)', doc: 'Associates specified value with specified key in map.' },
  { label: 'containsKey', insertText: 'containsKey(${1:key})', detail: 'boolean containsKey(Object key)', doc: 'Returns true if map contains a mapping for specified key.' },
  { label: 'containsValue', insertText: 'containsValue(${1:value})', detail: 'boolean containsValue(Object value)', doc: 'Returns true if map maps one or more keys to specified value.' },
  { label: 'keySet', insertText: 'keySet()', detail: 'Set<K> keySet()', doc: 'Returns a Set view of the keys contained in this map.' },
  { label: 'values', insertText: 'values()', detail: 'Collection<V> values()', doc: 'Returns a Collection view of the values in this map.' },
  { label: 'entrySet', insertText: 'entrySet()', detail: 'Set<Map.Entry<K, V>> entrySet()', doc: 'Returns a Set view of the mappings in this map.' },
  { label: 'getOrDefault', insertText: 'getOrDefault(${1:key}, ${2:defaultValue})', detail: 'V getOrDefault(Object key, V defaultValue)', doc: 'Returns value for key or defaultValue if not found.' },

  // String methods
  { label: 'length', insertText: 'length()', detail: 'int length()', doc: 'Returns the length of this string.' },
  { label: 'substring', insertText: 'substring(${1:beginIndex}, ${2:endIndex})', detail: 'String substring(int beginIndex, int endIndex)', doc: 'Returns a substring from beginIndex to endIndex.' },
  { label: 'toLowerCase', insertText: 'toLowerCase()', detail: 'String toLowerCase()', doc: 'Converts all characters in string to lowercase.' },
  { label: 'toUpperCase', insertText: 'toUpperCase()', detail: 'String toUpperCase()', doc: 'Converts all characters in string to uppercase.' },
  { label: 'trim', insertText: 'trim()', detail: 'String trim()', doc: 'Returns string with leading and trailing whitespaces removed.' },
  { label: 'strip', insertText: 'strip()', detail: 'String strip()', doc: 'Returns string with all leading and trailing whitespace removed (Unicode-aware).' },
  { label: 'equals', insertText: 'equals(${1:other})', detail: 'boolean equals(Object anObject)', doc: 'Compares this string or object to specified object.' },
  { label: 'equalsIgnoreCase', insertText: 'equalsIgnoreCase(${1:anotherString})', detail: 'boolean equalsIgnoreCase(String anotherString)', doc: 'Compares strings ignoring case considerations.' },
  { label: 'split', insertText: 'split("${1:,}")', detail: 'String[] split(String regex)', doc: 'Splits string around matches of given regular expression.' },
  { label: 'replace', insertText: 'replace(${1:oldChar}, ${2:newChar})', detail: 'String replace(CharSequence target, CharSequence replacement)', doc: 'Replaces each substring matching target with replacement.' },

  // Stream methods
  { label: 'map', insertText: 'map(${1:x} -> ${2:result})', detail: '<R> Stream<R> map(Function<? super T, ? extends R> mapper)', doc: 'Returns stream with results of applying mapper.' },
  { label: 'filter', insertText: 'filter(${1:x} -> ${2:condition})', detail: 'Stream<T> filter(Predicate<? super T> predicate)', doc: 'Returns stream matching given predicate.' },
  { label: 'collect', insertText: 'collect(Collectors.toList())', detail: '<R, A> R collect(Collector<? super T, A, R> collector)', doc: 'Performs mutable reduction on stream elements.' },
  { label: 'toList', insertText: 'toList()', detail: 'List<T> toList()', doc: 'Accumulates stream elements into unmodifiable List (Java 16+).' },

  // Optional methods
  { label: 'Optional.of', insertText: 'Optional.of(${1:value})', detail: 'static <T> Optional<T> of(T value)', doc: 'Returns an Optional with specified present non-null value.' },
  { label: 'Optional.ofNullable', insertText: 'Optional.ofNullable(${1:value})', detail: 'static <T> Optional<T> ofNullable(T value)', doc: 'Returns Optional describing value, or empty if null.' },
  { label: 'orElse', insertText: 'orElse(${1:other})', detail: 'T orElse(T other)', doc: 'Returns value if present, otherwise returns other.' },

  // Common Patterns & Idioms
  { label: 'main', insertText: 'public static void main(String[] args) {\n    ${1:// Entry point}\n}', detail: 'public static void main(String[] args)', doc: 'Standard Java application entrypoint method.' },
  { label: 'toString', insertText: '@Override\npublic String toString() {\n    return "${1:ClassName}";\n}', detail: 'public String toString()', doc: 'Returns string representation of object.' },
];

/**
 * Defines the custom light and dark themes in Monaco Editor
 */
function defineCustomThemes(monaco: typeof MonacoType) {
  // 1. Sleek Midnight Obsidian Dark Theme
  monaco.editor.defineTheme('pm-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'type', foreground: '8be9fd' },
      { token: 'function', foreground: '50fa7b' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'identifier', foreground: 'f8f8f2' },
    ],
    colors: {
      'editor.background': '#15181f',
      'editorGutter.background': '#15181f',
      'editorLineNumber.foreground': '#5c6370',
      'editorLineNumber.activeForeground': '#d4a356',
      'editor.lineHighlightBackground': '#1f242e88',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#3e445166',
      'editorIndentGuide.background1': '#282c34',
      'editorIndentGuide.activeBackground1': '#d4a356',
      'editorBracketMatch.background': '#d4a35622',
      'editorBracketMatch.border': '#d4a356aa',
      'editorCursor.foreground': '#d4a356',
      'editorWhitespace.foreground': '#2c313a',
      'editorOverviewRuler.background': '#15181f',
      'editorOverviewRuler.border': '#15181f',
      'editorWidget.background': '#1c2028',
      'editorWidget.border': '#353b47',
      'editorSuggestWidget.background': '#1c2028',
      'editorSuggestWidget.border': '#353b47',
      'editorSuggestWidget.foreground': '#ece8de',
      'editorSuggestWidget.selectedBackground': '#2d333e',
      'editorSuggestWidget.selectedForeground': '#ffffff',
      'editorSuggestWidget.highlightForeground': '#d4a356',
      'editorSuggestWidget.focusHighlightForeground': '#f3c77c',
      'editorSuggestWidgetStatus.foreground': '#a0a6b2',
      'list.hoverBackground': '#242a35',
      'list.activeSelectionBackground': '#2d333e',
      'list.activeSelectionForeground': '#ffffff',
      'list.focusBackground': '#2d333e',
      'list.focusForeground': '#ffffff',
      'list.highlightForeground': '#d4a356',
      'editorHoverWidget.background': '#1c2028',
      'editorHoverWidget.border': '#353b47',
      'editorHoverWidget.foreground': '#ece8de',
      'editorHoverWidget.statusBarBackground': '#15181f',
    },
  });

  // 2. Editorial Ivory Light Theme
  monaco.editor.defineTheme('pm-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8c93a3', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0969da', fontStyle: 'bold' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: '0550ae' },
      { token: 'type', foreground: '953800' },
      { token: 'function', foreground: '8250df' },
      { token: 'variable', foreground: '1f2328' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editorGutter.background': '#ffffff',
      'editorLineNumber.foreground': '#8c93a3',
      'editorLineNumber.activeForeground': '#d4a356',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': '#b4d5fe',
      'editorIndentGuide.background1': '#eae5d8',
      'editorIndentGuide.activeBackground1': '#d4a356',
      'editorBracketMatch.background': '#d4a35622',
      'editorBracketMatch.border': '#d4a356aa',
      'editorCursor.foreground': '#d4a356',
      'editorOverviewRuler.background': '#ffffff',
      'editorOverviewRuler.border': '#ffffff',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#dcd6c8',
      'editorSuggestWidget.background': '#ffffff',
      'editorSuggestWidget.border': '#dcd6c8',
      'editorSuggestWidget.foreground': '#1d222b',
      'editorSuggestWidget.selectedBackground': '#f4f0e6',
      'editorSuggestWidget.selectedForeground': '#1f2328',
      'editorSuggestWidget.highlightForeground': '#b87b28',
      'editorSuggestWidget.focusHighlightForeground': '#8f5a13',
      'editorSuggestWidgetStatus.foreground': '#6e7781',
      'list.hoverBackground': '#faf8f4',
      'list.activeSelectionBackground': '#f4f0e6',
      'list.activeSelectionForeground': '#1f2328',
      'list.focusBackground': '#f4f0e6',
      'list.focusForeground': '#1f2328',
      'list.highlightForeground': '#b87b28',
      'editorHoverWidget.background': '#ffffff',
      'editorHoverWidget.border': '#dcd6c8',
      'editorHoverWidget.foreground': '#1f2328',
      'editorHoverWidget.statusBarBackground': '#f6f8fa',
    },
  });
}

// Pre-register themes as soon as Monaco loader is available
if (typeof window !== 'undefined') {
  loader.init().then((monaco) => {
    defineCustomThemes(monaco);
  }).catch(() => {
    // Ignore delayed initialization
  });
}

/**
 * Parses Java source code from open project tabs to extract declared classes,
 * interfaces, and methods for cross-file auto-completion.
 */
function extractJavaSymbols(files: ProjectFile[]): Array<{
  name: string;
  kind: 'class' | 'interface' | 'method';
  signature: string;
  sourceFile: string;
}> {
  const symbols: Array<{
    name: string;
    kind: 'class' | 'interface' | 'method';
    signature: string;
    sourceFile: string;
  }> = [];

  for (const file of files) {
    if (!file.name.endsWith('.java')) continue;
    const lines = file.content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Class or Interface match
      const classMatch = trimmed.match(/(?:public\s+|abstract\s+|final\s+)*(class|interface|enum|record)\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[2],
          kind: classMatch[1] === 'interface' ? 'interface' : 'class',
          signature: `${classMatch[1]} ${classMatch[2]}`,
          sourceFile: file.name,
        });
      }

      // Method match: e.g. public void draw(), public String getName(), etc.
      const methodMatch = trimmed.match(/(?:public|protected)\s+(?:static\s+)?([A-Za-z0-9_<>,\[\]\s]+?)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
      if (methodMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(methodMatch[2])) {
        const returnType = methodMatch[1].trim();
        const methodName = methodMatch[2].trim();
        const params = methodMatch[3].trim();
        symbols.push({
          name: methodName,
          kind: 'method',
          signature: `${returnType} ${methodName}(${params})`,
          sourceFile: file.name,
        });
      }
    }
  }

  return symbols;
}

interface MonacoTypeScriptDefaults {
  setCompilerOptions: (options: Record<string, unknown>) => void;
  setDiagnosticsOptions: (options: Record<string, unknown>) => void;
  addExtraLib: (content: string, filePath: string) => MonacoType.IDisposable;
}

interface MonacoTypeScriptService {
  typescriptDefaults: MonacoTypeScriptDefaults;
}

function getTypeScriptService(monaco: typeof MonacoType): MonacoTypeScriptService | null {
  const langs = monaco.languages as unknown as Record<string, unknown>;
  const ts = langs.typescript as MonacoTypeScriptService | undefined;
  if (ts && typeof ts === 'object' && 'typescriptDefaults' in ts) {
    return ts;
  }
  return null;
}

export const PlaygroundCodeEditor: React.FC<PlaygroundCodeEditorProps> = ({
  code,
  onChange,
  language,
  fileName = 'code',
  wordWrap = false,
  projectFiles = [],
  height = '100%',
  theme: themeProp,
  onSelectFile,
  targetLine,
  onTargetLineHandled,
}) => {
  // Priority: 1. Explicit theme prop, 2. document.documentElement .dark class
  const [domTheme, setDomTheme] = React.useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const updateFromDOM = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setDomTheme(isDark ? 'dark' : 'light');
    };
    updateFromDOM();
    const observer = new MutationObserver(updateFromDOM);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const activeTheme = themeProp ?? domTheme;
  const isDarkMode = activeTheme === 'dark';
  const monacoTheme = isDarkMode ? 'pm-dark' : 'pm-light';
  const monacoLanguage = language === 'java' ? 'java' : 'typescript';

  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof MonacoType | null>(null);
  const extraLibsRef = useRef<MonacoType.IDisposable[]>([]);
  const javaCompletionRef = useRef<MonacoType.IDisposable | null>(null);
  const javaHoverRef = useRef<MonacoType.IDisposable | null>(null);
  const definitionProvidersRef = useRef<MonacoType.IDisposable[]>([]);
  const openerRef = useRef<MonacoType.IDisposable | null>(null);

  // Keep latest refs for callbacks to avoid stale closures in Monaco language providers
  const projectFilesRef = useRef(projectFiles);
  projectFilesRef.current = projectFiles;

  const onSelectFileRef = useRef(onSelectFile);
  onSelectFileRef.current = onSelectFile;

  const fileNameRef = useRef(fileName);
  fileNameRef.current = fileName;

  // Reveal target line after file navigation or cross-file Go-to-Definition
  useEffect(() => {
    if (targetLine && editorRef.current) {
      editorRef.current.revealLineInCenter(targetLine);
      editorRef.current.setPosition({ lineNumber: targetLine, column: 1 });
      editorRef.current.focus();
      onTargetLineHandled?.();
    }
  }, [targetLine, fileName, onTargetLineHandled]);

  // Define themes matching Pattern Masterclass design system
  const handleBeforeMount: BeforeMount = (monaco) => {
    defineCustomThemes(monaco);

    // 3. Configure TypeScript Language Defaults & Eager Model Sync for cross-file imports
    const ts = getTypeScriptService(monaco);
    if (ts) {
      const defaultsWithSync = ts.typescriptDefaults as { setEagerModelSync?: (eager: boolean) => void };
      if (typeof defaultsWithSync.setEagerModelSync === 'function') {
        defaultsWithSync.setEagerModelSync(true);
      }
      ts.typescriptDefaults.setCompilerOptions({
        target: 9, // ES2022
        allowNonTsExtensions: false, // Disallow non-TS extensions so TypeScript compiler worker never lints .java files
        moduleResolution: 2, // NodeJs
        module: 1, // CommonJS
        noEmit: true,
        esModuleInterop: true,
        allowJs: false, // Disallow JS parsing so TypeScript syntax (interfaces, implements) is fully recognized
        checkJs: false,
        isolatedModules: false,
        allowSyntheticDefaultImports: true,
        baseUrl: 'file:///',
        paths: {
          '*': ['*', '*.ts'],
        },
      });

      ts.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    }
  };

  // Register cross-file TypeScript extra libraries and models whenever project files change
  const syncTypeScriptCrossFileDefs = useCallback(() => {
    if (!monacoRef.current || monacoLanguage !== 'typescript') return;
    const monaco = monacoRef.current;
    const ts = getTypeScriptService(monaco);
    if (!ts) return;

    // Dispose old extra libs
    extraLibsRef.current.forEach((lib) => {
      try {
        lib.dispose();
      } catch {
        // ignore
      }
    });
    extraLibsRef.current = [];

    // Synchronize or pre-create models for all project files with file:/// URIs for cross-file imports
    projectFiles.forEach((file) => {
      if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        const clean = file.name.replace(/^\/+/, '');
        const fileUri = monaco.Uri.parse(`file:///${clean}`);
        const existingModel = monaco.editor.getModel(fileUri);
        if (!existingModel) {
          try {
            monaco.editor.createModel(file.content, 'typescript', fileUri);
          } catch {
            // ignore if model already initialized
          }
        } else if (file.name !== fileName && existingModel.getValue() !== file.content) {
          existingModel.setValue(file.content);
        }
      }
    });
  }, [projectFiles, fileName, monacoLanguage]);

  // Register Java Completion Item Provider with Standard Library + Cross-Tab Symbols
  const syncJavaCompletions = useCallback(() => {
    if (!monacoRef.current || monacoLanguage !== 'java') return;
    const monaco = monacoRef.current;

    if (javaCompletionRef.current) {
      javaCompletionRef.current.dispose();
      javaCompletionRef.current = null;
    }

    const symbols = extractJavaSymbols(projectFiles);

    javaCompletionRef.current = monaco.languages.registerCompletionItemProvider('java', {
      triggerCharacters: ['.', ' ', '@', '('],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: MonacoType.languages.CompletionItem[] = [];

        // 1. Standard Library completions
        for (const item of JAVA_STDLIB_COMPLETIONS) {
          suggestions.push({
            label: item.label,
            kind: item.label.includes('(')
              ? monaco.languages.CompletionItemKind.Method
              : monaco.languages.CompletionItemKind.Function,
            documentation: {
              value: `**${item.detail}**\n\n${item.doc}`,
            },
            detail: item.detail,
            insertText: item.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          });
        }

        // 2. Cross-file symbols from other playground tabs
        for (const sym of symbols) {
          let kind = monaco.languages.CompletionItemKind.Method;
          if (sym.kind === 'class') kind = monaco.languages.CompletionItemKind.Class;
          if (sym.kind === 'interface') kind = monaco.languages.CompletionItemKind.Interface;

          suggestions.push({
            label: sym.name,
            kind,
            detail: `${sym.signature} (${sym.sourceFile})`,
            documentation: {
              value: `Defined in playground file **${sym.sourceFile}**\n\`\`\`java\n${sym.signature}\n\`\`\``,
            },
            insertText: sym.kind === 'method' ? `${sym.name}()` : sym.name,
            range,
          });
        }

        return { suggestions };
      },
    });

    // Also register Java Hover Provider for rich symbol documentation tooltips
    if (javaHoverRef.current) {
      javaHoverRef.current.dispose();
      javaHoverRef.current = null;
    }

    javaHoverRef.current = monaco.languages.registerHoverProvider('java', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;
        const term = word.word;

        // 1. Check Standard Library completions
        const stdLib = JAVA_STDLIB_COMPLETIONS.find((c) => c.label === term || c.label.endsWith(`.${term}`));
        if (stdLib) {
          return {
            range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
            contents: [
              { value: `\`\`\`java\n${stdLib.detail}\n\`\`\`` },
              { value: stdLib.doc },
            ],
          };
        }

        // 2. Check cross-file symbols
        const sym = symbols.find((s) => s.name === term);
        if (sym) {
          return {
            range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
            contents: [
              { value: `\`\`\`java\n(${sym.kind}) ${sym.signature}\n\`\`\`` },
              { value: `Defined in playground file **${sym.sourceFile}**` },
            ],
          };
        }

        return null;
      },
    });
  }, [projectFiles, monacoLanguage]);

  // Setup Definition Providers for Ctrl+Click / F12 (Go to Definition) in TS & Java
  const setupDefinitionProviders = useCallback(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;

    // Dispose previous definition providers
    definitionProvidersRef.current.forEach((d) => {
      try {
        d.dispose();
      } catch {
        // ignore
      }
    });
    definitionProvidersRef.current = [];

    // 1. TypeScript Definition Provider (resolves './strategy', './navigator', exported classes/types/interfaces)
    const tsDefProvider = monaco.languages.registerDefinitionProvider('typescript', {
      provideDefinition: (model, position) => {
        const line = model.getLineContent(position.lineNumber);
        const word = model.getWordAtPosition(position);

        // A. Match import module specifiers: e.g. from './strategy'; or from './navigator';
        const importRegex = /(?:import|from)\s+['"](\.[^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(line)) !== null) {
          const specifier = match[1];
          const startCol = match.index + line.slice(match.index).indexOf(specifier) + 1;
          const endCol = startCol + specifier.length;
          if (position.column >= startCol && position.column <= endCol) {
            const cleanModule = specifier.replace(/^\.\//, '');
            const target = projectFilesRef.current.find(
              (f) =>
                f.name.replace(/\.tsx?$/, '') === cleanModule ||
                f.name === cleanModule ||
                f.name === `${cleanModule}.ts`
            );
            if (target) {
              return {
                uri: monaco.Uri.parse(`file:///${target.name}`),
                range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
              };
            }
          }
        }

        // B. Match identifier symbol declaration across other files (cross-file only, never duplicating active file)
        if (word) {
          const term = word.word;
          const otherFiles = projectFilesRef.current.filter((f) => f.name !== fileNameRef.current);

          for (const file of otherFiles) {
            const lines = file.content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const l = lines[i];
              const declMatch = l.match(
                new RegExp(`(?:export\\s+)?(?:class|interface|type|enum|function|const|let|var)\\s+(${term})\\b`)
              );
              if (declMatch) {
                const col = l.indexOf(term) + 1;
                return {
                  uri: monaco.Uri.parse(`file:///${file.name}`),
                  range: {
                    startLineNumber: i + 1,
                    startColumn: col,
                    endLineNumber: i + 1,
                    endColumn: col + term.length,
                  },
                };
              }
            }
          }
        }

        return null;
      },
    });

    // 2. Java Definition Provider (resolves RouteStrategy, PublicTransitStrategy, Navigator, methods)
    const javaDefProvider = monaco.languages.registerDefinitionProvider('java', {
      provideDefinition: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const term = word.word;
        const sortedFiles = [...projectFilesRef.current].sort((a, b) => {
          if (a.name === fileNameRef.current) return 1;
          if (b.name === fileNameRef.current) return -1;
          return 0;
        });

        for (const file of sortedFiles) {
          if (!file.name.endsWith('.java')) continue;
          const lines = file.content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const l = lines[i];

            // A. Class / Interface / Enum / Record declaration
            const classMatch = l.match(
              new RegExp(`(?:public\\s+|abstract\\s+|final\\s+)*(?:class|interface|enum|record)\\s+(${term})\\b`)
            );
            if (classMatch) {
              const col = l.indexOf(term) + 1;
              return {
                uri: monaco.Uri.parse(`file:///${file.name}`),
                range: {
                  startLineNumber: i + 1,
                  startColumn: col,
                  endLineNumber: i + 1,
                  endColumn: col + term.length,
                },
              };
            }

            // B. Method declaration
            const methodMatch = l.match(
              new RegExp(`(?:public|protected|private|static|abstract|final|\\s)+\\w+(?:<[^>]+>)?\\s+(${term})\\s*\\(`)
            );
            if (methodMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(term)) {
              const col = l.indexOf(term) + 1;
              return {
                uri: monaco.Uri.parse(`file:///${file.name}`),
                range: {
                  startLineNumber: i + 1,
                  startColumn: col,
                  endLineNumber: i + 1,
                  endColumn: col + term.length,
                },
              };
            }

            // C. Constructor declaration
            const ctorMatch = l.match(new RegExp(`(?:public|protected|private)\\s+(${term})\\s*\\(`));
            if (ctorMatch) {
              const col = l.indexOf(term) + 1;
              return {
                uri: monaco.Uri.parse(`file:///${file.name}`),
                range: {
                  startLineNumber: i + 1,
                  startColumn: col,
                  endLineNumber: i + 1,
                  endColumn: col + term.length,
                },
              };
            }
          }
        }

        return null;
      },
    });

    definitionProvidersRef.current.push(tsDefProvider, javaDefProvider);

    // Register editor opener once to handle tab switches when user Ctrl+Clicks cross-file symbols
    if (!openerRef.current) {
      openerRef.current = monaco.editor.registerEditorOpener({
        openCodeEditor(source, resource, selectionOrPosition) {
          const rawPath = resource.path.replace(/^\/+/, '');
          const targetFile = projectFilesRef.current.find(
            (f) =>
              f.name.toLowerCase() === rawPath.toLowerCase() ||
              f.name.toLowerCase().endsWith(rawPath.toLowerCase())
          );
          if (targetFile) {
            const posOrSelection = selectionOrPosition as
              | { startLineNumber?: number; lineNumber?: number }
              | undefined;
            const line =
              posOrSelection?.startLineNumber ??
              posOrSelection?.lineNumber ??
              1;

            if (targetFile.name === fileNameRef.current) {
              source.revealLineInCenter(line);
              source.setPosition({ lineNumber: line, column: 1 });
              source.focus();
              return true;
            }

            onSelectFileRef.current?.(targetFile.id, line);
            return true;
          }
          return false;
        },
      });
    }
  }, []);

  // Synchronize on mount and updates
  useEffect(() => {
    if (monacoLanguage === 'typescript') {
      syncTypeScriptCrossFileDefs();
    } else if (monacoLanguage === 'java') {
      syncJavaCompletions();
    }

    setupDefinitionProviders();

    return () => {
      extraLibsRef.current.forEach((lib) => {
        try {
          lib.dispose();
        } catch {
          // ignore
        }
      });
      extraLibsRef.current = [];
      if (javaCompletionRef.current) {
        javaCompletionRef.current.dispose();
        javaCompletionRef.current = null;
      }
      if (javaHoverRef.current) {
        javaHoverRef.current.dispose();
        javaHoverRef.current = null;
      }
      definitionProvidersRef.current.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      });
      definitionProvidersRef.current = [];
    };
  }, [monacoLanguage, syncTypeScriptCrossFileDefs, syncJavaCompletions, setupDefinitionProviders]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    defineCustomThemes(monaco);
    // Set active theme
    monaco.editor.setTheme(isDarkMode ? 'pm-dark' : 'pm-light');

    // Trigger initial multi-file symbol synchronization & definition providers
    if (monacoLanguage === 'typescript') {
      syncTypeScriptCrossFileDefs();
    } else {
      syncJavaCompletions();
      // Ensure no rogue language diagnostics attach to Java models
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelMarkers(model, 'typescript', []);
        monaco.editor.setModelMarkers(model, 'javascript', []);
      }
    }
    setupDefinitionProviders();
  };

  // Clear any rogue diagnostics on Java files whenever active file or language changes
  useEffect(() => {
    if (monacoRef.current && editorRef.current && monacoLanguage === 'java') {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'typescript', []);
        monacoRef.current.editor.setModelMarkers(model, 'javascript', []);
      }
    }
  }, [fileName, monacoLanguage]);

  // Sync theme changes dynamically
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDarkMode ? 'pm-dark' : 'pm-light');
    }
  }, [isDarkMode]);


  // Dynamic editor options tailored to IDE experience
  const editorOptions: MonacoType.editor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      automaticLayout: true,
      fontSize: 13.5,
      fontFamily: 'var(--font-mono, "JetBrains Mono", "Fira Code", monospace)',
      fontLigatures: true,
      tabSize: language === 'java' ? 4 : 2,
      wordWrap: wordWrap ? 'on' : 'off',
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      bracketPairColorization: { enabled: true },
      // FIXED OVERFLOW WIDGETS: Renders hover tooltips & suggestions via external body node
      // so they escape all parent transforms and clipping boundaries and anchor snugly at the pointer
      fixedOverflowWidgets: true,
      overflowWidgetsDomNode: typeof document !== 'undefined' ? document.body : undefined,
      // SMART HOVER: Placed snugly adjacent to pointer, dynamically adapting above or below
      hover: {
        enabled: 'on',
        delay: 200,
        sticky: true,
      },
      // INDENTATION HIGHLIGHT (Active & Inactive Guides)
      guides: {
        indentation: true,
        highlightActiveIndentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true,
      },
      renderWhitespace: 'selection',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: { other: true, comments: false, strings: true },
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
      },
      padding: { top: 12, bottom: 12 },
    }),
    [language, wordWrap]
  );

  // Model URI path: Guarantees TypeScript compiler recognizes .ts files as pure TypeScript
  const modelPath = useMemo(() => {
    const raw = fileName || (language === 'java' ? 'Main.java' : 'index.ts');
    const clean = raw.replace(/^\/+/, '');
    return `file:///${clean}`;
  }, [fileName, language]);

  return (
    <div
      className="monaco-editor-container"
      data-testid="monaco-code-editor"
      style={{ height, width: '100%', position: 'relative' }}
    >
      <Editor
        height="100%"
        width="100%"
        language={monacoLanguage}
        path={modelPath}
        value={code}
        onChange={(val) => onChange(val ?? '')}
        theme={isDarkMode ? 'pm-dark' : 'pm-light'}
        options={editorOptions}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        loading={
          <div className="editor-loading-shimmer">
            <span className="shimmer-dot" />
            <span className="shimmer-text">Loading IDE IntelliSense Engine ({language.toUpperCase()})...</span>
          </div>
        }
      />
    </div>
  );
};
