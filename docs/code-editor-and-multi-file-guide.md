# Code Playground User Guide: Code Editor & Multi-File Architecture

This document provides a comprehensive operational guide for the **GoF Design Patterns Code Playground**, detailing editor interactions, multi-file creation workflows, compilation pipelines, runtime contracts, and architectural rules.

---

## 1. Overview & Mental Model

The Code Playground is an interactive, multi-file sandbox embedded directly within the Masterclass application. Rather than executing isolated, monolithic code snippets, it operates as a full virtual project workspace:

- **Virtual File Tree**: Every GoF design pattern contains a dedicated set of modular files (interfaces, concrete implementations, and orchestrator).
- **Designated Entry Point**: Each project has a protected entry file (`index.ts` for TypeScript, `Main.java` for Java) marked with the **⭐ Entry** badge.
- **Dual Runtime Engines**:
  - **TypeScript**: In-memory transpile and virtual module resolution via dedicated browser Web Workers.
  - **Java**: Sandboxed compile (`javac`) and execution (`java`) via a real JDK 25 LTS backend runner.

---

## 2. Code Editor Controls & Keybindings

### Layout Modes
- **Split View (`Split`)**: Side-by-side layout featuring the code editor on the left and the real-time execution console on the right.
  - **Sliding Divider**: Click and drag the vertical pill divider to dynamically adjust the editor vs. console width.
  - **Single-Scroll Coordinator**: Line numbers and code synchronize smoothly with exactly **one** vertical scrollbar.
- **Stacked View (`Stacked`)**: Editorial top-to-bottom layout where the editor card naturally expands to fit the code, and the terminal output sits directly below. Scrolling is handled exclusively by the window page scroll.

### Editor Action Bar
| Control | Shortcut | Description |
|---|---|---|
| **Run Code** | `Ctrl + Enter` (or `Cmd + Enter`) | Compiles and links all tabs together, then executes the entry point. |
| **Wrap Text** | `Alt + Z` | Toggles horizontal soft-wrapping on and off. |
| **Copy** | Click Button | Copies the active tab's code directly to the system clipboard. |
| **Reset** | Click Button | Prompts to restore the pattern's original multi-file template. |
| **Language Switcher** | Java / TypeScript | Switches between JDK 25 LTS and TypeScript Worker engines. |

---

## 3. Working with Multiple Files

### Adding a New File
1. In the file tab bar, click the **`+ New File`** button.
2. Enter the desired file name in the inline input (e.g., `PaymentService` or `PaymentService.java`).
3. Press `Enter` or click the checkmark button.
4. **Automatic Extension**: If you omit the extension, the playground automatically appends `.java` or `.ts` matching the active language mode.
5. **Initial Scaffolding**: The system generates a boilerplate class matching the file name:
   - Java: `public class PaymentService { /* Helper class */ }`
   - TypeScript: `export class PaymentService { /* Helper module */ }`

### Editing & Tab Switching
- Click any tab to switch the active view to that file.
- The tab with the **⭐ Entry** badge represents the main execution entry point.
- Edits in any tab are held in active project memory and executed together when **Run** is triggered.

### Renaming Files
- Click the pencil icon on any non-entry tab (or double-click the tab label) to rename.
- Enter the new name and press `Enter`.
- *Note*: Protected entry files (`index.ts` and `Main.java`) cannot be renamed.

### Deleting Files
- Click the close icon (`✕`) on any auxiliary tab.
- *Note*: Protected entry files cannot be deleted to ensure the project remains executable.

---

## 4. Language Rules & Runtime Contracts

### A. Java Execution Rules (JDK 25 LTS)

1. **Class-to-Filename Matching Contract**:
   - Java strictly requires any `public class X` to reside in a file named `X.java`.
   - If a file is named `DatabaseConnection.java`, define `public class DatabaseConnection { ... }`.
   - If you need auxiliary helper classes inside the same file, declare them with **package-private** visibility (omit the `public` modifier):
     ```java
     // Inside UIComponents.java
     public interface Button { void render(); }
     class WinButton implements Button { ... } // Package-private is valid
     ```
2. **Default Package Resolution (Zero-Import Rule)**:
   - All `.java` files in the playground are placed in the default package.
   - You **do not need import statements** to reference classes in other tabs.
   - If `Main.java` wants to call `Dialog.java`, simply instantiate `Dialog dialog = new WindowsDialog();` directly.
3. **Entry Point Contract**:
   - `Main.java` must contain a standard Java entry method:
     ```java
     public class Main {
         public static void main(String[] args) {
             // Orchestration logic here
         }
     }
     ```
4. **Compilation Pipeline**:
   - The backend runs `javac -encoding UTF-8 *.java`. If any file fails type checking, `javac` outputs errors with line numbers to the Console.

---

### B. TypeScript Execution Rules (Browser Web Worker)

1. **Virtual Module System**:
   - All tabs in the active project are transpiled in-memory into CommonJS modules.
   - Each module is registered under its base name without extension (e.g., `button.ts` becomes `'button'`).
2. **Import Specifiers**:
   - To use symbols from another tab, use standard relative import syntax:
     ```typescript
     import { WindowsButton, HtmlButton } from './button'; // or './button.ts'
     ```
   - The virtual resolver normalizes `./`, `../`, and `.ts` automatically.
3. **Export Contract**:
   - Always prefix classes, interfaces, types, or functions meant for other files with `export`:
     ```typescript
     // dialog.ts
     export abstract class Dialog {
         abstract createButton(): Button;
     }
     ```
4. **Entry Point Contract**:
   - `index.ts` is the root orchestrator. When you click **Run code**, `index.ts` is evaluated and imports downstream modules.

---

## 5. Architectural Conventions for GoF Patterns

When designing or inspecting patterns in the playground, adhere to the standard modular decomposition:

| Pattern Role | File Naming (TS) | File Naming (Java) | Content Responsibility |
|---|---|---|---|
| **Client / Entry** | `index.ts` ⭐ | `Main.java` ⭐ | Imports/invokes components, sets up scenarios, logs execution steps. |
| **Abstractions** | `[domain].ts` | `[Domain].java` | Interfaces, abstract classes, strategy contracts, base handlers. |
| **Implementations** | `[concrete].ts` | `[Concrete].java` | Subclasses, concrete products, adapters, proxies, state instances. |

---

## 6. Single-Scroll Design Standard

The Code Playground enforces a **Strict Single-Scroll Standard**:
- **Split View**: Only the `<textarea>` possesses a scrollbar. Line numbers on the left are synchronized programmatically via `scrollTop` and never produce a separate scrollbar. The parent container has `overflow: hidden`.
- **Stacked View**: The code editor auto-sizes its height to accommodate the full file. The browser window's native scrollbar is the sole scrolling element.
