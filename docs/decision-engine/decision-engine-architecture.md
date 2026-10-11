# Production Architectural Specification: GoF Decision Engine & Zero-Trust Copilot

**Target Application:** `@workspace/pattern-masterclass` (`artifacts/pattern-masterclass`)  
**Domain Scope:** GoF 3-Pillar Decision Engine, Zero-Trust In-Memory BYOK Key Management, Interactive AI Architectural Debate, Slide-Over NotesDrawer & Session Ledger, Mobile Responsive Bottom Sheet, Stage-7 Quality & Accessibility Hardening

---

## 1. What We Achieved (Current Application Status)

The **GoF Decision Engine** ([artifacts/pattern-masterclass/src/pages/DecisionEnginePage.tsx](../../artifacts/pattern-masterclass/src/pages/DecisionEnginePage.tsx)) is a production-grade architectural guidance system engineered to help software developers and architects choose, validate, and debate the optimal design pattern for any system challenge.

### 1.1 The 3 Core Pillars of Heuristic Pattern Selection
1. **Pillar 1: Diagnostic Wizard (`DiagnosticWizard.tsx`)**:
   - 3-step decision flow mapped to the original Gang of Four "Causes of Redesign" (e.g., creating an object by specifying a class explicitly, algorithmic dependencies, tight coupling, extending functionality by subclassing).
   - Evaluates system constraints against a deterministic weighted scoring matrix covering **all 23 GoF patterns**.
   - Outputs primary recommendation, confidence match percentage, runner-up alternative, and decisive architectural trade-offs.
2. **Pillar 2: Real-World Scenario Matcher (`ScenarioMatcher.tsx`)**:
   - 16+ production architectural dilemmas from modern engineering domains:
     - Cloud Infrastructure (Multi-region failover, Kubernetes ingress controllers)
     - Fintech & Payments (Multi-gateway routing, PCI-DSS compliance vaults)
     - Microservices (Circuit breakers, event routing meshes)
     - UI & Graphics (Canvas rendering engines, undo/redo state stacks)
   - Searchable with live keyword filtering and domain tag pills.
3. **Pillar 3: Sibling Disambiguation Matrix (`DisambiguationMatrix.tsx`)**:
   - Resolves the 7 classic GoF dilemma pairs where patterns look virtually identical in UML class diagrams but differ fundamentally in architectural intent:
     1. Strategy vs. State
     2. Decorator vs. Proxy
     3. Factory Method vs. Abstract Factory
     4. Adapter vs. Bridge
     5. Mediator vs. Observer
     6. Composite vs. Decorator
     7. Chain of Responsibility vs. Command
   - Highlights the **Decisive Pivot Question**, core intent difference, and Martin Fowler refactoring references.
   - Provides direct action buttons to open the interactive code playground, adopt the pattern in the active session, or save to the session ledger.

---

### 1.2 Interactive AI Architect Copilot with Zero-Trust BYOK
* **Freeform Architectural Prompts**: Enter any custom design challenge or select from domain-specific prompt template chips (`Cloud Ingress`, `Payment Gateway`, `UI State Machine`, `Document AST`).
* **Multi-Turn Architectural Debate**:
   - Challenge the recommendation in up to 5 interactive follow-up turns.
   - Evaluates YAGNI, over-engineering risks, runtime complexity, and alternative patterns.
   - Employs a sliding context window to prevent token explosion.
* **Zero-Trust BYOK Key Manager (`BYOKModal.tsx`)**:
   - **Zero-Disk Guarantee**: API keys are stored **strictly in browser RAM** (never written to `localStorage`, `sessionStorage`, or backend disks) and are purged permanently upon tab closure.
   - **Supported Providers**: Google Gemini, OpenAI GPT-4o, Groq Cloud, and Local Ollama.
   - **Automated Dry-Run Probing**: Live dry-run connection test validates keys before accepting them into RAM.
* **Stage-7 Dynamic Model Discovery & Self-Healing Fallback**:
   - Google Gemini model discovery filters out specialized non-chat suffixes (`tts`, `image`, `audio`, `embed`, `robotics`, `transcribe`) to ensure valid chat models (e.g. `gemini-3.8-flash`) are selected.
   - Automatic self-healing fallback retry without `responseMimeType` if a provider model rejects structured JSON mode, preventing HTTP 400 errors.
* **Deterministic Offline Heuristic**:
   - When no API key is provided, the application runs deterministic offline matching without cloud dependency.
   - Validation ensures length warnings do not trigger misleading API key errors.

---

### 1.3 Side-Over NotesDrawer & Session Decision Ledger
* **Slide-Over NotesDrawer (`NotesDrawer.tsx`)**:
   - Accessible via top action pills or quick verdict triggers.
   - Hosts three distinct views:
     1. **Architectural Decision Record (ADR)**: Primary match, runner-up, confidence, gains, and architectural taxes.
     2. **Session Decision Ledger**: Audit trail of all decisions evaluated during the active session.
     3. **Field Guide & Heuristics**: Reference cheat-sheet and the 3 core principles of pattern selection.
* **Decoupled Visual Lifecycle**:
   - Closing the drawer collapses the visual panel without resetting active verdict state.

---

### 1.4 Mobile Responsive Architecture (< 768px / 48rem)
* **Slide-Up Bottom Sheet**: Transforms the desktop drawer into a touch-first bottom sheet with grab handle and backdrop blur dismiss.
* **Docked Bottom Verdict Bar**: When the sheet is dismissed, a floating sticky bar (`⚡ Strategy Pattern · 94% Fit | [ View Verdict 📋 ]`) remains accessible without obscuring content.

---

### 1.5 UI & Accessibility Hardening (Stage-7 Standard)
* **100% Solid Opaque Popups**: `.byok-modal-card` and `.notes-drawer-panel` feature solid opaque backgrounds (`#ffffff` light, `#121620` dark) with high-contrast dark scrims (`rgba(0, 0, 0, 0.88)`), eliminating text bleed-through.
* **Global Consistent Tooltips**: Standardized with Radix UI `<AppTooltip>` primitives matching the top header Theme toggle button across all candidate buttons, tabs, and drawer controls.

---

## 2. How It Is (Component Hierarchy & Subsystems)

```
artifacts/pattern-masterclass/src/
├── pages/
│   ├── DecisionEnginePage.tsx            # Main shell: Tabs, Layout grid, Responsive Drawer/Bottom Sheet
│   └── decision/
│       ├── BYOKModal.tsx                 # Zero-trust API Key Manager (In-Memory React RAM state)
│       ├── DiagnosticWizard.tsx          # Pillar 1: 3-step GoF causes of redesign engine (all 23 patterns)
│       ├── ScenarioMatcher.tsx           # Pillar 2: 16+ production scenarios with tag & search filters
│       ├── DisambiguationMatrix.tsx       # Pillar 3: 7 classic GoF dilemmas side-by-side comparator
│       ├── AIArchitectBar.tsx            # Natural language copilot + interactive debate dialog (max 5 turns)
│       ├── DecisionVerdictCard.tsx       # Composite output card (Primary, Runner-Up, Gains/Taxes, ADR Export)
│       ├── DecisionGuideCard.tsx         # User Instructions, 3 Principles, & Heuristic Cheat-Sheet
│       ├── MobileVerdictBar.tsx          # Mobile docked sticky floating bar (<768px)
│       ├── decision-data.ts              # Deterministic scoring matrix, 16 scenarios, 7 dilemmas, heuristics
│       └── ai-service.ts                 # Multi-provider client + model discovery + retry/backoff + offline fallback
```

---

## 3. Future Enhancements

1. **Session Decision Ledger Export**:
   - Export full session ledger as industry-standard Markdown Architectural Decision Records (ADRs) or JSON schemas for CI/CD documentation repositories.
2. **PostgreSQL Ledger Synchronization**:
   - Synchronize decision ledgers to PostgreSQL via Drizzle ORM for multi-device recall and team sharing.
3. **Custom Dilemma Comparator**:
   - Allow users to select any arbitrary pair of GoF patterns from the 23 catalog entries and generate a side-by-side trade-off matrix on demand.
