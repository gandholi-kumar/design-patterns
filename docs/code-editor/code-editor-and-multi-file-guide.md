# Code Playground User Guide: Code Editor & Multi-File Architecture

This document provides a comprehensive operational guide for the **GoF Design Patterns Code Playground**, detailing editor interactions, multi-file creation workflows, compilation pipelines, runtime contracts, and architectural rules.

---

## 1. What We Achieved (Current Application Status)

The Code Playground ([artifacts/pattern-masterclass/src/pages/PlaygroundPage.tsx](../../artifacts/pattern-masterclass/src/pages/PlaygroundPage.tsx)) is a production-grade, interactive, multi-file virtual workspace embedded directly in the Masterclass application.

### Key Milestones Achieved:
1. **Real Execution Engines (Zero Static Mocking)**:
   - **TypeScript Engine**: In-memory compilation and virtual module resolution executing inside a dedicated browser Web Worker (eliminates main thread UI freezes).
   - **Java Engine**: Sandboxed compile (`javac`) and execution (`java`) via a real JDK 25 LTS backend runner (`POST /api/code/run`).
2. **Multi-File Tabbed Workspace**:
   - Create, inline-rename, and delete files dynamically.
   - Designated protected entry point (`index.ts` for TypeScript, `Main.java` for Java) marked with the **⭐ Entry** badge.
   - Automatic boilerplate class generation based on filename.
3. **Dual-Mode Hybrid Viewport (`react-resizable-panels`)**:
   - **Stacked Editorial Flow (`Stacked`)**: Full-width editor card that auto-expands with code, with terminal output card positioned directly below.
   - **Side-by-Side Resizable Split View (`Split`)**: Left-hand code editor and right-hand interactive terminal separated by a draggable vertical sliding handle.
4. **Strict Single-Scroll UX**:
   - Synchronized line numbers driven by textarea `scrollTop`. Zero nested double-scroll traps.
5. **Robust Clipboard Suite**:
   - Dual copy modes: **Copy File** (active tab only) vs. **Copy All** (consolidated multi-file project with headers) featuring visual confirmation badges and clipboard fallbacks.
6. **Global Consistent Tooltips**:
   - All toolbar buttons, tab badges, resize handles, and terminal controls standardized with `<AppTooltip>` primitives.

---

## 2. How It Is (Editor Controls & Runtime Contracts)

### 2.1 Editor Action Bar

| Control | Shortcut | Description |
| :--- | :--- | :--- |
| **Run Code** | `Ctrl + Enter` (or `Cmd + Enter`) | Compiles and links all tabs together, then executes the protected entry point. |
| **Wrap Text** | `Alt + Z` | Toggles horizontal soft-wrapping on and off. |
| **Copy File** | Click Button | Copies the active tab's code directly to the system clipboard. |
| **Copy All** | Click Button | Consolidates all project files with header comments into a single clipboard buffer. |
| **Reset Project** | Click Button | Prompts confirmation to restore the pattern's pristine starter files. |
| **Language Switcher** | Java / TypeScript | Switches between JDK 25 LTS backend and client TypeScript Worker. |
| **Layout Toggles** | Stacked / Split | Switches between stacked vertical flow and side-by-side sliding window. |
| **Guide & Rules** | `F1` | Opens slide-over drawer detailing language rules and multi-file contracts. |

---

### 2.2 Working with Multiple Files

#### Adding a New File
1. In the file tab bar, click the **`+ New File`** button.
2. Enter the file name in the inline input (e.g., `PaymentService` or `PaymentService.java`).
3. Press `Enter` or click outside to confirm.
4. **Automatic Extension**: If omitted, the playground automatically appends `.java` or `.ts` matching the active language mode.
5. **Initial Scaffolding**: Automatically populates starter code matching the file name:
   - Java: `public class PaymentService { /* Helper class */ }`
   - TypeScript: `export class PaymentService { /* Helper module */ }`

#### Renaming & Deleting Files
- Click the pencil icon on any non-entry tab (or double-click the tab label) to rename.
- Click the `✕` close icon on any auxiliary tab to delete.
- *Protected Invariant*: Entry files (`index.ts` and `Main.java`) cannot be renamed or deleted, ensuring the project remains executable at all times.

---

### 2.3 Language Rules & Runtime Contracts

#### A. Java Execution Rules (JDK 25 LTS Sandbox)
1. **Class-to-Filename Contract**:
   - Java requires `public class X` to reside in `X.java`.
   - Auxiliary helper classes in the same file must use **package-private** visibility (omit `public`).
2. **Default Package Zero-Import Rule**:
   - All `.java` files are compiled in the default package.
   - **No import statements needed** to reference classes in other tabs. `Main.java` can instantiate `Dialog dialog = new WindowsDialog();` directly.
3. **Entry Point Contract**:
   - `Main.java` must declare `public static void main(String[] args)`.
4. **Backend Compilation Pipeline**:
   - The backend runs `javac -encoding UTF-8 *.java`. Compiler diagnostics with line numbers are returned if type checking fails.

#### B. TypeScript Execution Rules (Browser Web Worker)
1. **Virtual Module Bundler**:
   - In-memory transpile into CommonJS modules. Each file registers under its base name without extension (`button.ts` $\rightarrow$ `'button'`).
2. **Relative Import Specifiers**:
   - Reference symbols from other tabs using standard relative imports:
     ```typescript
     import { WindowsButton, HtmlButton } from './button';
     ```
3. **Export Contract**:
   - Classes, interfaces, types, and functions meant for other files must declare `export`.
4. **Entry Point Contract**:
   - `index.ts` is evaluated as the root orchestrator.

---

### 2.4 Single-Scroll Architecture Standard

* **Stacked Mode**: The editor card auto-expands to match content height (`max-height: none`). The browser window scrollbar is the sole scrolling element.
* **Split Mode**: The split container locks to viewport height (`height: calc(100vh - 4.5rem)`). Line numbers and code textarea synchronize via `scrollTop` listener with `overflow-x: hidden`.

---

## 3. Future Enhancements

1. **Multi-Language Expansion**:
   - **Python**: Client-side WASM execution via **Pyodide** Web Worker (`PYTHONUNBUFFERED=1`).
   - **Go**: Server-side sandboxed `go run .` within an ephemeral container.
   - **Rust & C#**: Cargo and .NET SDK runners with pre-warmed compilation caches.
2. **LSP & Monaco Editor Integration**:
   - Rich syntax highlighting, autocompletion, hover documentation, and inline squiggly error diagnostics.
3. **Project Zip Export & Import**:
   - Download the full multi-file pattern workspace as a runnable project zip archive.
