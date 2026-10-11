# GoF Decision Engine: Stage-2 Architectural Specification & ASCII Wireframe Blueprint

**Target Location:** `docs/investigation/decision-engine-stage-2-architecture-and-wireframes.md`  
**Application Target:** `@workspace/pattern-masterclass` (`artifacts/pattern-masterclass`)  
**Domain Scope:** UX Flow Optimization, State Lifecycle Hardening, Custom Pattern Comparison Engine, Architectural Decision Ledger, GoF Orthogonality Heuristics, Deep-Link Blueprint Integration  
**Status:** Investigation & Architectural Plan Completed (Awaiting User "GO" to Code)

---

## 1. Executive Summary & Context

During the Stage-1 implementation of the **Gang of Four (GoF) Decision Engine**, the system successfully integrated the 4 foundational pillars (AI Copilot, Diagnostic Wizard, Production Scenarios, and Versus Dilemmas) alongside a slide-over `NotesDrawer` with backdrop overlay.

However, a thorough UX and architectural audit revealed several critical cognitive friction points and functional gaps:
1. **Navigational Ambiguity in Problem Diagnostic:** The sub-switcher between the AI Copilot and the GoF Causes of Redesign looked like generic secondary buttons rather than a mutually exclusive mode toggle.
2. **Preset Defaults & Reset Flaws in Diagnostic Wizard:** GoF Causes of Redesign hardcoded pre-selections (`algorithm` and `runtime-swap`), preventing users from starting with a clean slate, and the Reset button failed to clear selections and verdicts back to an empty state.
3. **Hidden Horizontal Scrolling & Lack of Chat Auto-Scroll:** AI Copilot prompt chips were cut off horizontally without scroll affordances, and responses did not auto-scroll down to the latest answer.
4. **Global Topbar Pill Confusion Across Modes:** A single floating verdict pill in the topbar created cross-mode confusion when switching between tabs.
5. **Versus Matrix Layout & Comparative Limitations:** The dilemma selector was horizontally scrollable with poor affordance; furthermore, users could only view 7 hardcoded pairs without the ability to compare any two arbitrary patterns from the 23 GoF catalog.

This document outlines the **Stage-2 Architecture & ASCII Wireframes** resolving all these items based on authoritative object-oriented design literature.

---

## 2. Requirement Traceability Matrix

| Requirement ID | User Feedback & Problem Statement | Architectural Resolution | Target Files |
| :--- | :--- | :--- | :--- |
| **REQ-2.1** | Mode switcher looks like buttons, not tabs or segments. | **High-Contrast Segmented Switcher (Solution 1):** Elevated pill container with active card elevation and subtitle captions. | `DecisionEnginePage.tsx`, `index.css` |
| **REQ-2.2** | GoF Causes of Redesign has default selection, reset doesn't clear to empty, button not gated. | **Clean Initial State & Full Reset:** Initialize to `null` / `[]`. Gate "Calculate GoF Verdict" (`disabled={!selectedCause}`). Reset clears selections and local verdict. | `DiagnosticWizard.tsx` |
| **REQ-2.3** | AI prompt chips scroll horizontally and are not obvious. | **Wrapped Template Grid:** On desktop (`>= 768px`), chips render as a clean 2-row wrapped grid (`flex-wrap: wrap`) under `QUICK ARCHITECTURAL TEMPLATES (6):`. | `AIArchitectBar.tsx`, `index.css` |
| **REQ-2.4** | On clicking "Run Offline Free", page is stuck to previous message; no auto-scroll. | **Auto-Scroll Anchor:** Added `messagesEndRef` with `useEffect` invoking `scrollIntoView({ behavior: 'smooth' })` on response arrival. | `AIArchitectBar.tsx` |
| **REQ-2.5** | Topbar verdict pill creates cross-mode confusion. | **Hybrid Model (Solutions 2 + 3):** Local in-view verdict cards rendered inline inside active tool; topbar pill converted to `[ 📋 Decision Ledger (N) ]` history drawer. | `DecisionEnginePage.tsx`, `AIArchitectBar.tsx`, `DiagnosticWizard.tsx` |
| **REQ-2.6** | Versus dilemma horizontal scroll is hidden; user prefers full-width without split-master push. | **Option B Single-Row Category Filter:** Category strip `[ All (7) ] [ Behavioral (3) ] ...` updates pills on the same ~42px line with zero vertical shift and 100% full width. | `DisambiguationMatrix.tsx`, `index.css` |
| **REQ-2.7** | How to compare any two arbitrary patterns? Why can't one compare irrelevant patterns? | **Custom 2-Pattern Comparator Lab:** Automated GoF Relationship Classifier (Sibling Competitors vs. Synergistic Collaborators vs. Orthogonal Concerns). | `DisambiguationMatrix.tsx`, `decision-data.ts` |
| **REQ-2.8** | Deep-links to actual pattern notes opening in a new tab. | **New-Tab Deep-Links:** Pattern cards link to `/playground?pattern=${id}` with `target="_blank" rel="noopener noreferrer"` alongside external citations. | `DisambiguationMatrix.tsx`, `DecisionVerdictCard.tsx` |
| **REQ-2.9** | Field Guide & Heuristics content update. | **Updated Field Guide:** GoF Chapter 1.7 Causes of Redesign, Relationship Graph taxonomy, and Kerievsky/Fowler anti-pattern guidelines. | `DecisionGuideCard.tsx` |

---

## 3. Problem Diagnostic: Architecture & ASCII Wireframes

### 3.1 Solution 1: High-Contrast Segmented Switcher & Wrapped Template Chips

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 02 / PROBLEM DIAGNOSTIC: FIND THE RIGHT PATTERN FOR YOUR PROBLEM                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ DIAGNOSTIC PATHWAY:                                                                                     │
│ ┌──────────────────────────────────────────────┬──────────────────────────────────────────────────────┐ │
│ │ ⚡ AI ARCHITECT COPILOT                      │ 🧭 GOF CAUSES OF REDESIGN (3-STEP TREE)             │ │
│ │   [ ACTIVE - Solid Elevated Card Token ]     │   [ INACTIVE - Subtle Muted Background ]             │ │
│ └──────────────────────────────────────────────┴──────────────────────────────────────────────────────┘ │
│ ℹ Freeform input: describe your architectural tension or click a template chip below.                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ARCHITECTURAL PROBLEM STATEMENT                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Our system architecture requires handling dynamic pricing rules & discounts...                     │ │
│ │                                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ QUICK ARCHITECTURAL TEMPLATES (6):                                                                      │
│ [ Dynamic Pricing Rules ]  [ Multi-Cloud Resources ]  [ Legacy SOAP to REST Translation ]              │
│ [ Editor Undo/Redo Queue ] [ SQL Query Builder Chain ] [ Distributed Order Lifecycle ]                │
│                                                                                                         │
│                                          [ 🛡️ API Key: Browser RAM ]  [ ⚡ Run Offline Free (Instant) ] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Chat Auto-Scroll Implementation Blueprint
Inside `AIArchitectBar.tsx`:
```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (turns.length > 0 || isLoading) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}, [turns, isLoading]);
```

### 3.3 Diagnostic Wizard: Clean State, Reset, & Button Gating
* **Initial State:**
  ```tsx
  const [family, setFamily] = useState<'All' | 'Creational' | 'Structural' | 'Behavioral'>('All');
  const [selectedCause, setSelectedCause] = useState<string | null>(null); // Clean!
  const [constraints, setConstraints] = useState<string[]>([]);            // Clean!
  const [localVerdict, setLocalVerdict] = useState<GoFDecisionVerdict | null>(null);
  ```
* **Reset Button:**
  ```tsx
  const handleReset = () => {
    setFamily('All');
    setSelectedCause(null);
    setConstraints([]);
    setLocalVerdict(null);
  };
  ```
* **Gated Calculation Button:**
  ```tsx
  <button
    type="button"
    className="primary-btn wizard-calculate-btn"
    disabled={!selectedCause}
    onClick={handleCalculate}
  >
    <span>{selectedCause ? 'Calculate GoF Verdict' : 'Select a Cause in Step 2 to Calculate'}</span>
    <ArrowRight size={16} />
  </button>
  ```

---

## 4. Hybrid Verdict Model: Verdict Action Trigger Bar + Decision Ledger

### 4.1 Visual Hierarchy & Flow (Stage-3 Evolution)
During Stage-2, a truncated in-view card was experimented with. However, user testing revealed critical drawbacks:
1. **Content Mismatch / Split-Brain UI:** The truncated inline card omitted the full Trade-Off Matrix (Gains & Taxes), leading to confusion when compared against the side drawer.
2. **Vertical Space Ballooning:** The inline card pushed chat inputs and controls down by 450px+.
3. **Premature Verdict Display in AI Chat:** Having an inline verdict sitting below the chat while the user is actively asking follow-up questions made the debate feel prematurely finalized.

**The Stage-3 Solution: Sleek Verdict Action Trigger Bar**  
Instead of injecting a bulky, truncated card, computing a verdict surfaces an elegant, high-visibility **Verdict Action Trigger Bar** (~64px height). The slide-over `NotesDrawer` serves as the **Single Source of Truth** for the 100% complete, un-truncated Architectural Decision Record (ADR).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MASTERCLASS / DECISION ENGINE                                        [ 📋 Decision Ledger (2) ]  [ 📖 ] │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MODE: [ 🧭 Problem Diagnostic (Active) ]   [ ⚖️ Versus Dilemmas ]   [ 🏢 Production Scenarios ]          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│ [ INPUT AREA: Prompt Input OR GoF Causes of Redesign Decision Tree ]                                    │
│                                                                                                         │
│ ▼ UPON COMPUTING VERDICT / HEURISTIC EVALUATION                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚡ VERDICT READY: Strategy Pattern (94% Fit) · Behavioral Family                                    │ │
│ │ Encapsulates interchangeable algorithms behind a contract; swappable dynamically at runtime.        │ │
│ │                                                                                                     │ │
│ │ [ 📖 Open Full Decision Record in Drawer → ]         [ 💾 Record to Session Ledger ]                │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Topbar Decision Ledger Drawer Behavior
Clicking **`[ 📋 Decision Ledger (2) ]`** opens the slide-over `NotesDrawer` with all recorded decisions:
* **Item 1:** `⚡ AI Copilot: Strategy (94%) · Pricing Engine` — *14:32*
* **Item 2:** `⚖️ Dilemma Pick: State over Strategy (93%)` — *14:40*
* **Footer Actions:** `[ Copy All ADRs as Markdown ]` and `[ Clear Ledger ]`.

---

## 5. Versus Matrix: Option B Layout & Custom Pattern Comparator

### 5.1 Option B: Single-Row Category Filter (Height ~42px, Zero View Shift)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 02 / VERSUS MATRIX: SIBLING DISAMBIGUATION & CUSTOM COMPARATOR                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SUB-TAB: [ ⚖️ 7 Curated GoF Dilemmas (Active) ]   [ 🔬 Custom 2-Pattern Comparator ]                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY: [ All (7) ]  [ Behavioral (3) (Active) ]  [ Structural (3) ]  [ Creational (1) ]              │
│ DILEMMAS: [ ⚡ Strategy vs State (Active) ]  [ 🔄 Strategy vs Template ]  [ 📡 Mediator vs Observer ]   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│ ┌───────────────────────────────────────────────────┬─────────────────────────────────────────────────┐ │
│ │ CANDIDATE 01: STRATEGY (100% FULL WIDTH)          │ CANDIDATE 02: STATE (100% FULL WIDTH)           │ │
│ │ • Primary Move: Interchangeable algorithms        │ • Primary Move: State-dependent behavior        │ │
│ │ • UML: Context references Strategy interface      │ • UML: Context references State interface       │ │
│ │ [ 🔗 Open Blueprint Notes ↗ ]                     │ [ 🔗 Open Blueprint Notes ↗ ]                   │ │
│ └───────────────────────────────────────────────────┴─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Deep-Dive: Why Irrelevant Patterns Cannot Be Compared

#### Background & Authoritative References
* **Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (*Design Patterns*, 1994, Chapter 1, Figure 1.1 "Design pattern relationships"):**  
  The GoF catalog is not a flat list of 23 interchangeable tools. It is an interconnected graph structured by:
  1. **Structural Isomorphism:** Patterns that share identical or near-identical UML structures but diverge completely in intent (e.g. *Strategy vs State*, *Decorator vs Proxy*).
  2. **Synergistic Collaborators:** Patterns designed to work together as a pipeline (e.g. *Composite + Visitor*, *Abstract Factory + Prototype*, *Command + Memento*).
  3. **Orthogonal Concerns:** Patterns solving completely unrelated, independent axes of variation (e.g. *Singleton vs Visitor*).
* **Joshua Kerievsky (*Refactoring to Patterns*, 2004, Addison-Wesley / Martin Fowler Signature Series):**  
  Kerievsky cautions against **"Patternitis" / "Patterns-Happy" syndrome**:
  * Forcing a false choice between two unrelated patterns is an architectural anti-pattern.
  * Comparing *Singleton* vs *Visitor* is like asking: *"Should we use a refrigerator or a hammer?"* One manages object instance lifecycle; the other traverses complex hierarchical tree structures. They solve non-competing concerns.

---

### 5.3 Custom 2-Pattern Comparator: The 3 Visual States (ASCII Wireframes)

Inside the sub-tab **`[ 🔬 Custom 2-Pattern Comparator ]`**, the user can pick any two patterns from dropdowns. The engine automatically classifies their relationship:

---

#### Case A: Sibling Competitors (e.g. Strategy vs. State)
*UML structures are isomorphic; architectural intent competes.*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT ANY TWO PATTERNS TO COMPARE:                                                                     │
│ Pattern A: [ Dropdown: Strategy               ▾ ]   vs   Pattern B: [ Dropdown: State                 ▾ ]│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔴 RELATIONSHIP: DIRECT SIBLING COMPETITORS (STRUCTURAL ISOMORPHISM)                                    │
│ These patterns share an identical class diagram (Context has-a Interface), but solve competing forces. │
│                                                                                                         │
│ 🎯 DECISIVE PIVOT RULE:                                                                                 │
│ • Pick Strategy if the CLIENT chooses and injects the algorithm.                                        │
│ • Pick State if the OBJECT TRANSITIONS ITSELF internally based on lifecycle events.                     │
├───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┤
│ CANDIDATE 01: STRATEGY                            │ CANDIDATE 02: STATE                                 │
│ Category: Behavioral                              │ Category: Behavioral                                │
│ Axis of Change: An algorithm or calculation rule  │ Axis of Change: States of an object                 │
│                                                   │                                                     │
│ Architectural Intent:                             │ Architectural Intent:                               │
│ Decouples caller from algorithm variants.         │ Eliminates massive `switch(status)` statements.     │
│                                                   │                                                     │
│ Anti-Pattern to Avoid:                            │ Anti-Pattern to Avoid:                              │
│ YAGNI: Creating 8 classes for a boolean toggle.   │ State explosion when an object has 2 simple flags.  │
│                                                   │                                                     │
│ 🔗 [ Open Strategy Blueprint ↗ ] (New Tab)        │ 🔗 [ Open State Blueprint ↗ ] (New Tab)             │
│ [ ⚡ Select as Chosen Move ]                      │ [ ⚡ Select as Chosen Move ]                        │
└───────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

#### Case B: Synergistic Collaborators (e.g. Composite vs. Visitor)
*Patterns do NOT compete; they are designed to work together!*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT ANY TWO PATTERNS TO COMPARE:                                                                     │
│ Pattern A: [ Dropdown: Composite              ▾ ]   vs   Pattern B: [ Dropdown: Visitor               ▾ ]│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 RELATIONSHIP: SYNERGISTIC COLLABORATORS (PIPELINE PARTNERS)                                          │
│ These patterns DO NOT compete! In enterprise architecture, they are designed to collaborate together.   │
│                                                                                                         │
│ 🤝 HOW THEY COLLABORATE IN REAL SYSTEMS:                                                                │
│ 1. Composite constructs the recursive tree hierarchy (Document DOM, UI Widgets, or AST Nodes).          │
│ 2. Visitor traverses that Composite tree to run operations (Typechecking, Rendering, Code Gen)          │
│    WITHOUT polluting the Composite classes with dozens of unrelated methods!                            │
├───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┤
│ ROLE 1: COMPOSITE (DATA STRUCTURE)                │ ROLE 2: VISITOR (OPERATION ENGINE)                  │
│ Category: Structural                              │ Category: Behavioral                                │
│ Axis of Change: Object composition & hierarchy    │ Axis of Change: Operations applied to objects       │
│                                                   │                                                     │
│ When to Use:                                      │ When to Use:                                        │
│ When clients treat leaf and branches uniformly.   │ When you have many distinct, evolving operations.   │
│                                                   │                                                     │
│ 🔗 [ Open Composite Blueprint ↗ ] (New Tab)       │ 🔗 [ Open Visitor Blueprint ↗ ] (New Tab)           │
│ [ ⚡ Record Composite as Structural Foundation ]  │ [ ⚡ Record Visitor as Operational Engine ]         │
└───────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

#### Case C: Orthogonal Concerns (e.g. Singleton vs. Visitor)
*Patterns operate on unrelated axes of change. Cures "Patternitis".*

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT ANY TWO PATTERNS TO COMPARE:                                                                     │
│ Pattern A: [ Dropdown: Singleton              ▾ ]   vs   Pattern B: [ Dropdown: Visitor               ▾ ]│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ⚪ RELATIONSHIP: ORTHOGONAL CONCERNS (INDEPENDENT PROBLEM SPACES)                                        │
│ These patterns operate on completely independent axes of change. Comparing them is a false dilemma.     │
│                                                                                                         │
│ 💡 ARCHITECTURAL REALITY & CAUTION:                                                                     │
│ • Singleton manages Object Lifecycle & Global Instance Access (Creational).                             │
│ • Visitor executes Algorithms across Heterogeneous Composite Data Structures (Behavioral).              │
│ Your system can use both, neither, or one. There is zero architectural rivalry or conflict.             │
├───────────────────────────────────────────────────┬─────────────────────────────────────────────────────┤
│ CANDIDATE 01: SINGLETON                           │ CANDIDATE 02: VISITOR                               │
│ Category: Creational                              │ Category: Behavioral                                │
│ Problem: Exact single instance coordination       │ Problem: Operations across node hierarchies         │
│                                                   │                                                     │
│ Anti-Pattern Risk:                                │ Anti-Pattern Risk:                                  │
│ Global state anti-pattern, hidden dependencies.   │ Double dispatch overhead; hard to add node types.   │
│ (Prefer Dependency Injection containers)          │ (Prefer Pattern Matching where supported)           │
│                                                   │                                                     │
│ 🔗 [ Open Singleton Blueprint ↗ ] (New Tab)       │ 🔗 [ Open Visitor Blueprint ↗ ] (New Tab)           │
│ 📚 Ref: [ Martin Fowler on DI ↗ ]                 │ 📚 Ref: [ GoF AST Traversal ↗ ]                     │
└───────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 6. Deep-Links to Notes & External References (Opening in New Tab)

Each pattern comparison card will include:
1. **Direct Link to Masterclass Playground & Blueprint:**
   ```tsx
   <a
     href={`/playground?pattern=${pattern.id}`}
     target="_blank"
     rel="noopener noreferrer"
     className="blueprint-link"
   >
     <span>Open {pattern.name} Blueprint</span>
     <ExternalLink size={13} />
   </a>
   ```
2. **Authoritative Literature Citations:**
   - Gang of Four (1994) Chapter 1.7 *Causes of Redesign*.
   - Joshua Kerievsky (*Refactoring to Patterns*) cautionary guidelines against premature abstraction.
   - Martin Fowler architecture references on Dependency Injection vs. Singleton.

---

## 7. Field Guide & Heuristics Content Specification

In `DecisionGuideCard.tsx`, the content will be refreshed with:
1. **The 3 Canonical GoF Principles:**
   - *Encapsulate what varies.*
   - *Favor object composition over class inheritance.*
   - *Program to an interface, not an implementation.*
2. **The 7 Causes of Redesign (GoF Table 1.1):**
   - Explicit table mapping reasons for redesign to matching patterns.
3. **The Pattern Relationship Taxonomy:**
   - Clear guidelines distinguishing Competitors vs. Collaborators vs. Orthogonal concerns.
4. **The Anti-Pattern Guardrail (Kerievsky & Fowler):**
   - The Rule of Three: *Don't introduce a design pattern on the first occurrence; wait until the third variation reveals the genuine axis of change.*

---

## 8. Step-by-Step Implementation Roadmap

When authorized with **"GO"**, the implementation will follow this exact order:

1. **Step 1: AI Architect Enhancements (`AIArchitectBar.tsx` & `index.css`)**
   - Implement flex-wrapped 2-row template grid on desktop.
   - Implement `messagesEndRef` auto-scroll on new chat turns.
   - Render local inline verdict card immediately below prompt.
2. **Step 2: Diagnostic Wizard Clean State & Gating (`DiagnosticWizard.tsx`)**
   - Initialize `selectedCause = null` and `constraints = []`.
   - Gate the calculate button (`disabled={!selectedCause}`).
   - Fix Reset button to clear selections and local verdict state.
   - Render local inline verdict card directly below Step 3.
3. **Step 3: Versus Matrix Option B & Custom Comparator (`DisambiguationMatrix.tsx` & `decision-data.ts`)**
   - Implement Option B single-row category filter (~42px height, full-width).
   - Implement Custom 2-Pattern Comparator with automated GoF Relationship Classifier (Competitors, Collaborators, Orthogonal).
   - Add deep-links opening pattern blueprints and external references in new tab (`target="_blank"`).
4. **Step 4: Layout & Hybrid Ledger (`DecisionEnginePage.tsx` & `index.css`)**
   - Implement High-Contrast Segmented Switcher for Problem Diagnostic.
   - Implement `[ 📋 Decision Ledger (N) ]` topbar pill opening session history in `NotesDrawer`.
5. **Step 5: Field Guide Refresh (`DecisionGuideCard.tsx`)**
   - Update content with GoF Chapter 1.7 table, relationship taxonomy, and Kerievsky anti-pattern rules.
6. **Step 6: Quality Gates Verification**
   - Run TypeScript typecheck: `tsc -p tsconfig.json --noEmit` (0 errors).
   - Verify production build: `vite build`.
   - Browser QA via browser subagent.
   - Stage all files in Git (without committing).

---

## 9. Stage-3 Architectural Specifications & ASCII Wireframe Blueprint

### 9.1 Paradigm Shift: Eliminating Truncated Inline Cards in Favor of the Verdict Action Trigger Bar

#### Problem Analysis
During Stage-2, an inline truncated card (`local-inview-verdict-card`) was rendered directly beneath the chat debate and wizard steps. User feedback identified four fundamental flaws with this design:
1. **Split-Brain / Content Discrepancy:** The inline card omitted the full Trade-Off Matrix (Gains & Taxes), causing confusion when compared against the comprehensive `DecisionVerdictCard` inside the side drawer.
2. **Vertical Space Bloat:** Injecting a 450px+ card pushed input controls and chat boxes off the screen.
3. **Premature Finalization in AI Chat:** Having an inline verdict sitting below the chat while the user is actively asking follow-up questions made the debate feel prematurely finalized.
4. **Mobile Redundancy:** On mobile (500x749), displaying both the inline card and the sticky bottom dock created two competing views of the exact same result.

#### The Architectural Solution
1. **Single Source of Truth (SSOT):** The slide-over `NotesDrawer` hosting `DecisionVerdictCard` is the **only** place where the full-fidelity Architectural Decision Record (ADR) lives.
2. **Verdict Action Trigger Bar:** When a verdict is computed or updated, instead of injecting a giant card, the UI displays a compact, sleek **Verdict Action Trigger Bar** (~64px height) with a clear recommendation summary and an unmissable button to open the full ADR in the side drawer.
3. **Zero Involuntary Interruption:** The side drawer will **NEVER** automatically fly open during chat turns. The user triggers it manually via the action button.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ VERDICT READY: Strategy Pattern (94% Fit) · Behavioral Family                                        │
│ Encapsulates interchangeable algorithms behind a contract; swappable dynamically at runtime.            │
│                                                                                                         │
│ [ 📖 Open Full Decision Record in Drawer → ]                 [ 💾 Record to Decision Ledger ]           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 9.2 GoF Chapter 1.7 Table 1.1 Domain Integrity & Wizard Gating

#### The Domain Flaw (Behavioral + Creation -> Chain of Responsibility)
In the original wizard, selecting **Behavioral** in Step 1, **Creating an object...** in Step 2, and checking **Pipeline handlers** in Step 3 resulted in recommending *Chain of Responsibility*. This is an authentic architectural contradiction: *Chain of Responsibility* has zero connection to object creation.

#### Authoritative GoF Table 1.1 Mapping & Filtering Rules
In Gang of Four (1994) Chapter 1.7 Table 1.1, causes strictly map to specific pattern families:

```text
Cause 1: Creating an object explicitly       --> Abstract Factory, Factory Method, Prototype (Creational ONLY)
Cause 2: Dependence on specific operations   --> Chain of Responsibility, Command (Behavioral ONLY)
Cause 3: Dependence on hardware platforms    --> Abstract Factory, Bridge (Creational, Structural)
Cause 4: Dependence on object representations--> Abstract Factory, Bridge, Memento, Proxy (All 3)
Cause 5: Algorithmic dependencies            --> Builder, Iterator, Strategy, Template Method, Visitor (Creational, Behavioral)
Cause 6: Tight coupling                      --> Abstract Factory, Bridge, Chain of Resp, Command, Facade, Mediator, Observer (All 3)
Cause 7: Extending via subclassing           --> Bridge, Composite, Decorator, Observer, Strategy (Structural, Behavioral)
Cause 8: Inability to alter classes          --> Adapter, Decorator, Visitor (Structural, Behavioral)
```

#### The Stage-3 Rules:
1. **Dynamic Step 1 -> Step 2 Cascading Filter:**
   * When **Behavioral** is active in Step 1, Cause 1 (*Creating an object...*) and Cause 3 (*Hardware platforms*) are **disabled/greyed out** with a badge: `[ Creational Only ]`.
   * When **Creational** is active in Step 1, Cause 2 (*Dependence on operations*) is disabled with `[ Behavioral Only ]`.
2. **Hard Candidate Boundaries:** A pattern outside the selected Cause's canonical Table 1.1 mapping can **NEVER** be recommended, regardless of constraint checkboxes.
3. **Dual-Requirement Gating (Step 2 + Step 3):**
   * A Cause of Redesign (Step 2) identifies the general problem force (matching 3-5 candidates).
   * Engineering Constraints (Step 3) provide the decisive discriminator.
   * The `"Compute GoF Verdict"` button is disabled until **both a Cause in Step 2 AND at least one Constraint in Step 3** are selected.

```text
STEP 1: ARCHITECTURAL FAMILY
[ All Patterns ]  [ Creational ]  [ Structural ]  [ 🔘 Behavioral (Active) ]
                                                             │
                                                             ▼ (Dynamically disables incompatible causes!)
STEP 2: CAUSE OF REDESIGN (GOF TABLE 1.1)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔒 [Creating an object by specifying its class explicitly] (Creational Only)│
│    Disabled: Contains no behavioral patterns in GoF Table 1.1               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [Dependence on specific operations / requests]                           │
│    Canonical Behavioral Match: Chain of Responsibility, Command             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🔘 [Algorithmic dependencies or changing business rules]                    │
│    Canonical Behavioral Match: Strategy, State, Template Method, Visitor   │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: ENGINEERING CONSTRAINTS (Must select at least 1)
[ ] Avoid sprawling inheritance / class explosion
[✓] Allow individual handlers in pipeline to stop or pass requests

FOOTER BAR:
[ ↺ Reset All ]       ⚠️ Select at least 1 constraint in Step 3
                      [ Compute GoF Verdict: Chain of Responsibility (94%) ➔ ]
```

---

### 9.3 AI Copilot UX Flow: Capsule Pills & Non-Intrusive Drawer Trigger

1. **Capsule Pill Aesthetics:**
   * Rounded corners: `border-radius: 9999px` (`rounded-full`).
   * Replace misleading `+` sign with a `Sparkles` icon (`✨`) to signify **"Preset Architectural Template"** rather than an append action.
2. **Zero Involuntary Drawer Popups:**
   * During multi-turn debates, chat turns will **never** automatically open the side drawer.
   * Upon receiving an AI recommendation, the chat surfaces the **Verdict Action Trigger Bar** right beneath the response.
3. **Mobile Layout Simplification:**
   * On mobile viewports, the bulky inline card is removed.
   * The sticky bottom dock acts as the sole mobile drawer trigger when scrolling, preventing duplicate UI elements.

---

### 9.4 Custom 2-Pattern Comparator: Authoritative Clickable References

In `DisambiguationMatrix.tsx` under the Custom 2-Pattern Comparator, plain text citations are replaced with active, verified hyperlinks:
1. **Refactoring Guru Canonical Catalog:** `https://refactoring.guru/design-patterns/${pattern.id}` (`target="_blank" rel="noopener noreferrer"`).
2. **Martin Fowler Architecture Reference:** Authoritative essays on Dependency Injection, CQRS, and State vs Strategy.
3. **Internal Masterclass Blueprint Study:** Clickable link directly to the internal interactive pattern guide: `[ 📖 Study ${pattern.name} Blueprint & Trade-offs → ]`.

---

### 9.5 Side Drawer Icon-Only Mode (Zero Text Wrapping)

In `NotesDrawer`, wide text buttons (`Verdict`, `Ledger (2)`, `Field Guide`) that wrap on narrower screens are replaced with sleek, icon-only buttons with tooltips:

```text
┌─────────────────────────────────────────────────────────────┐
│ 📋 ARCHITECTURAL DECISION RECORD                        [X] │
│ Strategy Pattern                                            │
│ Recommended Behavioral pattern for dynamic algorithms.      │
│                                                             │
│ Switches:   [ ⚡ ]   [ 📋 (2) ]   [ 📖 ]                    │
│             Verdict    Ledger      Guide                    │
│            (tooltip)  (tooltip)   (tooltip)                 │
└─────────────────────────────────────────────────────────────┘
```

* `[ ⚡ ]`: Tooltip *"Active Verdict"*
* `[ 📋 2 ]`: Tooltip *"Session Decision Ledger (2 recorded)"* with numerical badge
* `[ 📖 ]`: Tooltip *"Gang of Four Field Guide & Rules"*

---

### 9.6 Context-Aware Blueprint Navigation (`?from=decision-engine`)

#### Problem
Clicking "Open Blueprint Notes" in `DecisionVerdictCard` routed the user to `/pattern/:id`. However, the back button inside `PatternDetailPage` was hardcoded to `setLoc('/')`, sending the user back to the root Pattern Library catalog instead of the Decision Engine.

#### The Context-Aware Solution
1. When routing from `/decision-engine` to `/pattern/:id`, append `?from=decision-engine`:
   ```tsx
   setLoc(`/pattern/${pattern.id}?from=decision-engine`);
   ```
2. In `PatternDetailPage.tsx`:
   * Inspect `new URLSearchParams(window.location.search).get('from')`.
   * If `from === 'decision-engine'`:
     * Inline back button label: **`← Back to Decision Engine`**
     * Click action: `setLoc('/decision-engine')`.
   * If `from` is empty (navigated from catalog):
     * Inline back button label: **`← Back to pattern library`**
     * Click action: `setLoc('/')`.
   * Preserves standard browser history stack so the browser back button also functions seamlessly.

---

### 9.7 Stage-3 Master Implementation Plan & Execution Checklist

- [x] **Phase 1: AI Architect Copilot UX Refinements**
  - [x] 1.1 Capsule pill aesthetics (`border-radius: 9999px` / `rounded-full`).
  - [x] 1.2 Remove misleading `+` prefix; add `Sparkles` icon (`✨`) and template micro-copy.
  - [x] 1.3 Eliminate `local-inview-verdict-card` from chat flow; replace with compact **Verdict Action Trigger Bar** (~64px height).
  - [x] 1.4 Suppress `setIsDrawerOpen(true)` during active chat turns; make drawer opening manual via action button.
  - [x] 1.5 Mobile layout simplification: remove duplicate inline card, relying on action trigger and slide-up sheet.

- [x] **Phase 2: GoF Causes of Redesign (Diagnostic Wizard) Domain Integrity**
  - [x] 2.1 Fix `.wizard-footer-bar` layout alignment (vertical centering and spacing).
  - [x] 2.2 Dual-requirement gating: Require both Step 2 (Cause) AND at least one Step 3 (Constraint) before button enables.
  - [x] 2.3 Fix "Behavioral + Creation" GoF Table 1.1 domain flaw:
    - [x] Dynamic Step 1 -> Step 2 cascading filter (e.g. Behavioral disables Cause 1 & Cause 3 with `[ Creational Only ]`).
    - [x] Hard candidate boundary: only canonical GoF Table 1.1 patterns for that cause can be recommended.
  - [x] 2.4 Eliminate truncated inline card in wizard; replace with the **Verdict Action Trigger Bar**.

- [x] **Phase 3: Versus Dilemmas — Custom 2-Pattern Comparator**
  - [x] 3.1 Replace plain text citations with active clickable links to Refactoring Guru (`https://refactoring.guru/design-patterns/...`) and Martin Fowler architecture references (`target="_blank"`).
  - [x] 3.2 Add internal masterclass pattern study deep-link (`/pattern/:id?from=decision-engine`).

- [x] **Phase 4: Side Drawer (`NotesDrawer`) & Navigation Flow**
  - [x] 4.1 Implement icon-only drawer switcher (`[ ⚡ ]`, `[ 📋 N ]`, `[ 📖 ]`) with hover tooltips to eliminate text wrapping.
  - [x] 4.2 Context-aware blueprint navigation:
    - [x] Pass `?from=decision-engine` from Decision Engine.
    - [x] In `PatternDetailPage.tsx`, detect `from === 'decision-engine'` and render `← Back to Decision Engine` returning to `/decision-engine`.

- [x] **Phase 5: Styling, Quality Gates, & Verification**
  - [x] 5.1 Update `index.css` for Verdict Action Trigger Bar, capsule chips, icon tooltips, and wizard alignment.
  - [x] 5.2 TypeScript typecheck verification (`tsc -p tsconfig.json --noEmit` and `pnpm run typecheck`).
  - [x] 5.3 Browser QA automation testing.
  - [x] 5.4 Stage all files in Git (`git add`), strictly **without committing**.

---

## 10. Stage-4 Architectural Fixes & Specifications

### 10.1 BYOK Modal Opacity & Contrast Rectification

#### Root Cause Analysis
During live browser inspection, the computed `backgroundColor` of `.byok-modal-card` evaluated to `rgba(0, 0, 0, 0)` (fully transparent). 
This occurred because `background: hsl(var(--card))` failed to resolve an opaque color in the modal portal context, causing the entire underlying page content ("Production Scenarios", chat prompt textarea, "NATURAL LANGUAGE ARCHITECT") to bleed right through the dialog, making the text unreadable.

#### The Architectural Solution
1. **Explicit Opaque Surfaces:** Apply solid, opaque background colors to `.byok-modal-card` for both themes:
   - Light Mode: `#ffffff` / `hsl(var(--card))` with explicit fallback.
   - Dark Mode: `#181d27` / `#1c202a` with high contrast borders (`#2e3545`).
2. **Elevated Visual Hierarchy & Backdrop Blur:**
   - Backdrop overlay: `background: rgba(15, 17, 23, 0.75)` with `backdrop-filter: blur(8px)`.
   - Card shadow: `box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.6)`.
   - Card z-index: `z-index: 101` (strictly above backdrop).
3. **Inner Component Contrast:**
   - Privacy Banner: `background: rgba(16, 185, 129, 0.08)` with solid border `rgba(16, 185, 129, 0.3)`.
   - API Key Input: Opaque `#faf9f6` in light mode, `#11141c` in dark mode.

```text
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🔑 ]  BRING YOUR OWN KEY (BYOK)                                [ X ] │
│         Zero-Trust AI Key Manager                                      │
├────────────────────────────────────────────────────────────────────────┤
│  🛡️ Zero-Disk Guarantee: Stored strictly in browser RAM. Never written │
│     to disk or backend servers. Purged on tab close.                   │
├────────────────────────────────────────────────────────────────────────┤
│  SELECT AI PROVIDER                                                    │
│  ┌─────────────────────────┐  ┌─────────────────────────┐             │
│  │ 🔘 Google Gemini (3.8)  │  │ ⚪ OpenAI GPT-4o        │             │
│  ├─────────────────────────┤  ├─────────────────────────┤             │
│  │ ⚪ Groq Cloud           │  │ ⚪ Local Ollama         │             │
│  └─────────────────────────┘  └─────────────────────────┘             │
│                                                                        │
│  API KEY                                  Get key on Google AI Studio ↗│
│  ┌──────────────────────────────────────────────────────────────[👁️]─┐ │
│  │ AIzaSy... (Solid Opaque Input)                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  Free tier available (15 RPM). Recommended default for testing.        │
├────────────────────────────────────────────────────────────────────────┤
│  [ 🗑️ Disconnect & Purge ]               [ Cancel ]  [ ⚡ Connect Key ] │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 10.2 Gemini Model Deprecation & Dynamic Discovery Imperative

#### Root Cause Analysis
When dispatching requests to Google's Generative Language API endpoint (`https://generativelanguage.googleapis.com/v1beta/models/...`), Google returned HTTP 404/400:
> *"This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.8-flash for the latest features and improvements. We recommend you to use the Interactions API (https://ai.google.dev/gemini-api/docs/get-started)."*

Google sunset `gemini-2.0-flash`. However, merely hardcoding `gemini-3.8-flash` is an anti-pattern: when Google rolls out `4.x`, `5.x`, or deprecates `3.8-flash`, a hardcoded system will break again. 
Furthermore, the previous BYOK modal saved keys blindly without dry-run testing, falsely marking the AI as "Connected" even with an invalid key or discontinued model.

The comprehensive solution requires **Dynamic Model Discovery** and **Active Dry-Run Verification**, detailed in Section 11.

---

### 10.3 Production Scenarios Drawer Inspection Trigger Fix

#### Root Cause Analysis
In Stage-3, `handleVerdictGenerated` intentionally suppressed `setIsDrawerOpen(true)` during active AI Copilot debate turns to prevent intrusive side drawer flyouts.
However, `ScenarioMatcher` was also bound to `onSelectScenarioVerdict={handleVerdictGenerated}`.
When a user clicked "Inspect" or clicked on any of the 16+ Production Scenario cards, `handleVerdictGenerated` ran, which updated state but **never opened the drawer**. The user perceived this as a broken action.

Furthermore, `ScenarioMatcher` had a hardcoded `category: 'Structural'` fallback for both Primary and Runner-Up patterns, which caused Creational scenarios (like *Abstract Factory*) or Behavioral scenarios (like *Strategy*) to display incorrect category tags when loaded.

#### The Architectural Solution
1. **Dedicated Scenario Inspection Handler in `DecisionEnginePage.tsx`:**
   ```tsx
   const handleSelectScenarioVerdict = (v: GoFDecisionVerdict) => {
     setVerdict(v);
     setDrawerTab('verdict');
     setIsDrawerOpen(true); // Direct user click on scenario card explicitly pulls open the drawer!
   };
   ```
2. **Catalog-Derived Categories in `ScenarioMatcher.tsx`:**
   Lookup genuine pattern metadata from `PATTERNS` so that `primaryPattern.category` and `runnerUpPattern.category` dynamically reflect the true GoF taxonomy (`Creational`, `Structural`, `Behavioral`).
3. **Two-Way Card Feedback:**
   Clicking anywhere on the scenario card or clicking the `[ Inspect → ]` action button triggers `handleSelectScenario(sc)`, smoothly pulling open the `NotesDrawer` with the full ADR, forces, and trade-offs.

---

## 11. Stage-5 Architectural Specifications & Robust Solutions

### 11.1 Dynamic Model Discovery Engine (Google 4.x / 5.x Future-Proofing)

#### The Architectural Risk
Hardcoding specific model strings (`gemini-2.0-flash`, `gemini-3.8-flash`) creates fragile code that guarantees failure when Google sunsets or upgrades models. 

#### The Dynamic Discovery Mechanism
Google's Generative Language API provides an endpoint to query all active models enabled for an API key:
```http
GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}
```

```json
{
  "models": [
    {
      "name": "models/gemini-3.8-flash",
      "version": "001",
      "displayName": "Gemini 3.8 Flash",
      "supportedGenerationMethods": ["generateContent", "countTokens"]
    },
    {
      "name": "models/gemini-4.0-flash",
      "version": "001",
      "displayName": "Gemini 4.0 Flash",
      "supportedGenerationMethods": ["generateContent"]
    }
  ]
}
```

#### Dynamic Ranking & Selection Algorithm
1. **Fetch & Filter:** Enumerate models and keep only those supporting `"generateContent"`.
2. **Version Extraction Regex:**
   ```ts
   function extractGeminiVersion(name: string): number {
     // Matches gemini-3.8, gemini-4.0, gemini-5, etc.
     const m = name.match(/gemini[^\d]*(\d+(?:\.\d+)?)/i);
     return m ? parseFloat(m[1]) : 0;
   }
   ```
3. **Flash-First Prioritization:**
   - Filter for active models containing `"flash"`.
   - Sort descending by extracted version number: `version(B) - version(A)`.
   - Index 0 is automatically the highest, newest active flash model (e.g. `gemini-5.0-flash` > `gemini-4.0-flash` > `gemini-3.8-flash` > `gemini-2.5-flash`).
4. **Self-Healing Fallback:**
   If a prompt call ever encounters a 404/deprecated error, the client automatically triggers dynamic discovery, selects the newest active model, updates session state, and retries the request without failing the user's turn.

---

### 11.2 Live Dry-Run Connection Verification Flow

#### User Problem
Previously, a user could paste an invalid key, corrupted string, or expired credential into `BYOKModal.tsx` and click "Connect Key". The modal closed and falsely displayed a green "AI Ready" badge. The failure only surfaced later when the user submitted a complex prompt, creating a jarring UX.

#### Architectural Specification
1. **Active Dry-Run Probe:**
   Clicking `"Connect Key"` or `"Test Connection"` initiates an immediate lightweight dry-run test:
   - For **Gemini**: Calls `GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`.
   - For **OpenAI**: Calls `GET https://api.openai.com/v1/models` (`Authorization: Bearer ${apiKey}`).
   - For **Groq**: Calls `GET https://api.groq.com/openai/v1/models` (`Authorization: Bearer ${apiKey}`).
   - For **Ollama**: Calls `GET http://localhost:11434/api/tags`.
2. **Strict Gating:**
   - **If the dry run FAILS (HTTP 400, 401, 403, Network Error):**
     - The modal **DOES NOT CLOSE**.
     - An explicit high-contrast error banner is rendered inside the modal:
       `❌ Connection Failed: [Exact Provider Error Message]`
     - The application state remains **Disconnected**. No false green badges.
   - **If the dry run SUCCEEDS (HTTP 200):**
     - Discovers and selects the newest active model.
     - Displays confirmation: `✓ Verified: Active connection to [Discovered Model]`.
     - Saves configuration to memory and transitions the status pill to `Connected: [Model]`.
     - Closes modal gracefully.

#### ASCII Wireframe: BYOK Live Dry-Run Test States

```text
STATE A: TESTING IN PROGRESS
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🔑 ]  BRING YOUR OWN KEY (BYOK)                                [ X ] │
│         Zero-Trust AI Key Manager                                      │
├────────────────────────────────────────────────────────────────────────┤
│  API KEY                                  Get key on Google AI Studio ↗│
│  ┌──────────────────────────────────────────────────────────────[👁️]─┐ │
│  │ AIzaSy...                                                         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ⏳ [PROBING API] Contacting Google API & discovering active models... │
├────────────────────────────────────────────────────────────────────────┤
│  [ Cancel ]                                   [ ⏳ Verifying Key... ]  │
└────────────────────────────────────────────────────────────────────────┘

STATE B: DRY RUN FAILED (GATED - REMAINS OPEN)
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🔑 ]  BRING YOUR OWN KEY (BYOK)                                [ X ] │
│         Zero-Trust AI Key Manager                                      │
├────────────────────────────────────────────────────────────────────────┤
│  API KEY                                  Get key on Google AI Studio ↗│
│  ┌──────────────────────────────────────────────────────────────[👁️]─┐ │
│  │ AIzaSy_bad_key_example...                                         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ❌ CONNECTION FAILED (400 INVALID_ARGUMENT)                       │ │
│  │ API key not valid. Please verify your key on Google AI Studio.    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  [ Cancel ]                                   [ ⚡ Verify & Connect ]  │
└────────────────────────────────────────────────────────────────────────┘

STATE C: DRY RUN VERIFIED (DYNAMIC DISCOVERY SUCCESS)
┌────────────────────────────────────────────────────────────────────────┐
│  [ 🔑 ]  BRING YOUR OWN KEY (BYOK)                                [ X ] │
│         Zero-Trust AI Key Manager                                      │
├────────────────────────────────────────────────────────────────────────┤
│  API KEY                                  Get key on Google AI Studio ↗│
│  ┌──────────────────────────────────────────────────────────────[👁️]─┐ │
│  │ AIzaSyValidKeyProd...                                             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ✓ VERIFIED ACTIVE CONNECTION                                      │ │
│  │ Auto-discovered latest model: gemini-3.8-flash (Future-Proofed)   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  [ 🗑️ Purge Key ]                             [ Close (Connected) ]    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 11.3 Disambiguation Matrix `col-action-btns`: Icons + Tooltips & Correct Playground Semantics

#### Problem Analysis
1. **Semantic Contradiction:**
   The first button in `.col-action-btns` previously stated `"Open Blueprint ↗"`, but navigated to `/playground?pattern=${id}`.
   This contradicted the **"AUTHORITATIVE REFERENCES & BLUEPRINTS"** study section, where blueprints represent comprehensive pattern notes (`/pattern/:id`). The playground is an interactive code execution sandbox.
2. **Horizontal Space Bloat & Text Wrapping:**
   Rendering three text buttons (`[ Open Blueprint ↗ ]`, `[ Pick Verdict ]`, `[ Ledger ]`) occupied over 300px in the candidate column header. On split screens or laptops, this forced candidate names to squash and button rows to wrap onto multiple lines.

#### The Architectural Solution
1. **Compact 32px Icon Buttons:**
   Replace the text buttons with three sleek, square icon buttons (`32px` x `32px`, `rounded-md`):
   - **Button 1: `<Code2 size={15} />` (Code Playground)**
     - Target: `/playground?pattern=${id}` (`target="_blank"`).
     - Tooltip: `"Open Interactive Code Playground for ${name} (runs in new tab)"`.
     - Accessible Label: `aria-label="Open Code Playground for ${name}"`.
     - Resolves semantic confusion: Accurately represents the interactive code playground!
   - **Button 2: `<Zap size={15} />` (Session Verdict)**
     - Action: Adopts pattern as the active session verdict.
     - Tooltip: `"Adopt ${name} as Session Verdict"`.
     - Accessible Label: `aria-label="Adopt ${name} as session verdict"`.
   - **Button 3: `<BookmarkCheck size={15} />` (Session Ledger)**
     - Action: Records pattern to the session decision ledger.
     - Tooltip: `"Save ${name} to Session Decision Ledger"`.
     - Accessible Label: `aria-label="Save ${name} to ledger"`.
2. **Space Utilization:**
   - Width consumed reduced by **65%** (from ~300px down to ~104px).
   - Candidate names receive full horizontal room.
   - Applied consistently across both Curated Dilemma and Custom Comparator candidate columns.

#### ASCII Wireframe: Column Top Banner Transformation

```text
BEFORE (Text Bloat - Button Wrapping & Title Squashing):
┌────────────────────────────────────────────────────────────────────────┐
│ CANDIDATE 01   [ Open Blueprint ↗ ]  [ Pick Verdict ]  [ Ledger ]     │
│ Strategy Pattern                                                       │
└────────────────────────────────────────────────────────────────────────┘

AFTER (Optimized Space - Icon Toolbar + Floating Tooltips):
┌────────────────────────────────────────────────────────────────────────┐
│ CANDIDATE 01                                           [</>]  [⚡]  [🔖]│
│ Strategy Pattern                                         │     │     │ │
└──────────────────────────────────────────────────────────┼─────┼─────┼─┘
                                                           │     │     │
   Tooltip 1: "Open Interactive Code Playground" ──────────┘     │     │
   Tooltip 2: "Adopt Strategy as Session Verdict" ───────────────┘     │
   Tooltip 3: "Save Strategy to Decision Ledger" ──────────────────────┘
```

---

---

## 12. Stage-6 Architectural Specifications: Pattern Studio & Scenario Lab Work In Progress (WIP) Experience

### 12.1 User Requirement & Motivation
The user specified:
> *"I want to hide the content for pattern studio and scenario lab and display with a msg that work in progress and soon will be published, thank ouu for waiting such similar msg should be dispaled while hiding current html ui, in future we plan to implement the full fledge code."*

Currently:
- `/simulators` renders the initial Pattern Studio simulation controls.
- `/quiz-lab` renders the initial Scenario Lab questions and Leitner box.

In Stage-6, the current HTML UI for both screens will be cleanly hidden, replaced with an aesthetic, professional, and informative **Work In Progress (WIP) / Coming Soon** experience, while preserving the existing underlying code for future full-fledged implementation.

---

### 12.2 Architectural Blueprint & Code Preservation Guarantee

1. **Zero-Code-Loss Principle:**
   The existing `Simulators` and `QuizLab` logic in `App.tsx` (the simulators action engine, ripple event trace, Leitner 5-box memory cards, quiz scoring) remains intact in the codebase. It will be wrapped or placed behind a feature toggle (`const SHOW_LEGACY_MODULES = false;`) so that when the team is ready to build out the full-fledged implementations, it can be re-enabled or refactored with zero loss of progress.

2. **Dedicated, High-Contrast Reusable Component (`WipModulePlaceholder`):**
   A dedicated component `WipModulePlaceholder` will be created with first-class design aesthetics matching the Masterclass dark/light design system:
   - **Hero Eyebrow:** Index badge (`04 / PATTERN STUDIO` or `05 / SCENARIO LAB`).
   - **Status Pill:** Glowing indicator `🚧 WORK IN PROGRESS · COMING SOON`.
   - **Empathetic & Professional Headline:**
     - Pattern Studio: *"Pattern Studio is actively being engineered."*
     - Scenario Lab: *"Scenario Lab is actively being engineered."*
   - **Courteous User Notification:**
     *"Work in progress and will soon be published. Thank you for your patience while we craft this experience! In the meantime, explore our 23 interactive pattern blueprints, the AI Decision Engine, and the live code playground."*
   - **Feature Roadmap Teaser:**
     Highlights of what the full-fledged module will provide once released:
     - *For Pattern Studio:* Multi-node interactive event simulations, dynamic state transitions, and collaboration ripple inspectors.
     - *For Scenario Lab:* Production constraint recognition drills, 5-box Leitner spaced-repetition memory engine, and personal field note tracking.
   - **Alternative Path Navigation Toolbar:**
     Three unmissable buttons ensuring users never encounter a dead-end:
     - `[ 🧭 Go to Decision Engine → ]`
     - `[ 💻 Launch Code Playground → ]`
     - `[ 📚 Browse 23 Pattern Library → ]`

3. **Sidebar Navigation Cue:**
   In the sidebar nav list (`App.tsx`), `Pattern studio` and `Scenario lab` will feature a subtle `WIP` or `Soon` badge next to the title, setting clear expectations before navigation.

---

### 12.3 ASCII Wireframe: Work In Progress (WIP) Module Experience

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 04 / PATTERN STUDIO                                                                                    │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                                                    │ │
│ │                    ┌──────────────────────────────────────────────────┐                            │ │
│ │                    │ 🚧 WORK IN PROGRESS · V2 FULL-FLEDGED RELEASE   │                            │ │
│ │                    └──────────────────────────────────────────────────┘                            │ │
│ │                                                                                                    │ │
│ │                         Pattern Studio is actively being engineered.                               │ │
│ │                                                                                                    │ │
│ │    Work in progress and will soon be published. Thank you for your patience while we craft        │ │
│ │    this experience! In the meantime, explore our 23 interactive pattern blueprints, the            │ │
│ │    AI Decision Engine, and the live code playground.                                               │ │
│ │                                                                                                    │ │
│ │    ────────────────────────────────────────────────────────────────────────────────────────────    │ │
│ │                                                                                                    │ │
│ │    WHAT TO EXPECT IN THE UPCOMING RELEASE:                                                         │ │
│ │    • Multi-node dynamic event ripple simulations for all 23 GoF patterns                           │ │
│ │    • Real-time state machine & runtime strategy swapping visualizers                               │ │
│ │    • Step-by-step collaboration inspector tracking responsibilities and decoupling axes           │ │
│ │                                                                                                    │ │
│ │    ────────────────────────────────────────────────────────────────────────────────────────────    │ │
│ │                                                                                                    │ │
│ │    [ 🧭 Go to Decision Engine ]     [ 💻 Launch Code Playground ]     [ 📚 Browse Pattern Library ]│ │
│ │                                                                                                    │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Master Implementation Plan & Execution Checklist (Stages 4, 5, & 6)

- [x] **Phase 1: BYOK Modal Opaque Styling & High Contrast**
  - [x] 1.1 Update `.byok-modal-card` in `index.css` with explicit solid opaque background (`#faf9f6` light, `#171b24` dark) to eliminate text bleed-through.
  - [x] 1.2 Darken modal backdrop overlay (`rgba(15, 17, 23, 0.75)`) and apply `backdrop-filter: blur(8px)`.
  - [x] 1.3 Ensure opaque backgrounds on `.byok-input`, `.provider-chip`, and `.byok-privacy-notice`.
  - [x] 1.4 Verify zero text bleed-through and crisp contrast.

- [x] **Phase 2: Dynamic Model Discovery & Live Dry-Run Connection Engine**
  - [x] 2.1 Implement `testAndDiscoverAIProvider(config)` in `ai-service.ts`:
    - [x] Dynamic Gemini model discovery via `GET /v1beta/models?key=...`.
    - [x] Auto-ranking algorithm extracting version numbers and selecting newest active flash model (`5.x` > `4.x` > `3.x` > `2.x`).
    - [x] Dry-run key validation probes for OpenAI (`/v1/models`), Groq (`/v1/models`), and Ollama (`/api/tags`).
  - [x] 2.2 Wire live dry run into `BYOKModal.tsx`:
    - [x] Testing spinner state during probe (`Validating key...`).
    - [x] Live error banner on failure (modal remains open, key not saved, app remains Disconnected).
    - [x] Verified badge on success (`✓ Verified: [Discovered Model]`).
  - [x] 2.3 Add dynamic self-healing fallback in `callGeminiAPI` (auto-revalidating models on 404/sunset).

- [x] **Phase 3: Production Scenarios Drawer Inspection Trigger**
  - [x] 3.1 Implement `handleSelectScenarioVerdict` in `DecisionEnginePage.tsx` with `setIsDrawerOpen(true)`.
  - [x] 3.2 Pass `onSelectScenarioVerdict={handleSelectScenarioVerdict}` to `<ScenarioMatcher>`.
  - [x] 3.3 Dynamic category resolution in `ScenarioMatcher.tsx` deriving from `PATTERNS` catalog.
  - [x] 3.4 Verify clicking scenario cards or "Inspect" button immediately pulls open the side drawer.

- [x] **Phase 4: Disambiguation Matrix `col-action-btns` Redesign**
  - [x] 4.1 In `DisambiguationMatrix.tsx` (Curated Dilemma Candidate A & B, Custom Comparator Candidate A & B):
    - [x] Replace wide text buttons with 32px icon buttons (`<Code2 />`, `<Zap />`, `<BookmarkCheck />`).
    - [x] Correct first button semantics: Tooltip & label `"Open Interactive Code Playground (runs in new tab)"`.
    - [x] Add rich tooltips for all three action buttons.
  - [x] 4.2 Update `index.css` for `.col-action-btns` and `.col-icon-btn` with smooth hover states and tooltip micro-interactions.

- [x] **Phase 5: Stage-6 Pattern Studio & Scenario Lab Work In Progress (WIP) Experience**
  - [x] 5.1 Create `WipModulePlaceholder` component with rich typography, glowing WIP badge, courteous message, and alternative navigation actions.
  - [x] 5.2 In `App.tsx`, preserve the existing `Simulators` and `QuizLab` implementations intact for future full-fledged release, while rendering `WipModulePlaceholder` for `/simulators` and `/quiz-lab`.
  - [x] 5.3 Add subtle `WIP` badge to sidebar nav items for Pattern Studio and Scenario Lab.
  - [x] 5.4 Update styling in `index.css` for `.wip-placeholder-card` and `.wip-status-badge`.

- [x] **Phase 6: Quality Gates & Verification**
  - [x] 6.1 Run TypeScript typecheck: `npm --prefix artifacts/pattern-masterclass run typecheck` (Passed: 0 errors).
  - [x] 6.2 Browser QA automation: Verify opaque modal, dynamic model test, scenario drawer open, icon buttons, and WIP placeholder views on `/simulators` and `/quiz-lab`.
  - [x] 6.3 Stage all files in Git (`git add`), strictly **without committing**.




