# Product Requirements Document (PRD): GoF Decision Engine & Zero-Trust Copilot

**Module**: GoF Decision Engine (`/decision-engine`)  
**Status**: **COMPLETED, VERIFIED & PRODUCTION READY**  
**Target Application**: `@workspace/pattern-masterclass` (`artifacts/pattern-masterclass`)

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Engineers and architects frequently struggle with pattern selection:
* **Superficial UML Equivalence**: Patterns like Strategy and State or Decorator and Proxy share virtually identical UML diagrams, yet represent completely different architectural intents.
* **Over-Engineering Risks**: Applying patterns prematurely introduces accidental complexity, indirection, and maintenance overhead.
* **Lack of Contextual Guidance**: Traditional pattern catalogs list definitions without interactive diagnostic flows tailored to real-world domain constraints.

### 1.2 Target Vision Achieved
The **GoF Decision Engine** provides a multi-dimensional recommendation and debate workshop:
1. **Pillar 1: Diagnostic Wizard**: 3-step decision flow evaluating system constraints against a deterministic weighted scoring matrix across all 23 patterns.
2. **Pillar 2: Real-World Scenario Matcher**: 16+ production scenarios across Cloud, Fintech, Microservices, and UI domains.
3. **Pillar 3: Sibling Disambiguation Matrix**: Resolves the 7 classic GoF dilemma pairs with decisive pivot questions and Fowler refactoring links.
4. **Natural Language AI Copilot**: Freeform architectural prompts and domain chips backed by an interactive multi-turn architectural debate (up to 5 turns).
5. **Zero-Trust BYOK Key Management**: API keys are stored strictly in browser RAM with zero disk persistence, supported by automated dry-run testing, dynamic Gemini model discovery, and self-healing JSON mode fallbacks.
6. **Side-Over NotesDrawer & Session Ledger**: Retains architectural decisions across active exploration without disrupting layout.
7. **Mobile-First Responsive Architecture**: Touch-friendly bottom sheet and sticky docked verdict bar on screens $< 768px$.

---

## 2. Functional Requirements (FR)

| ID | Requirement | Implementation Status |
| :--- | :--- | :--- |
| **FR-1** | **Diagnostic Wizard Flow**: Guide users through 3 progressive questions (Primary Problem, Axis of Change, Structural Constraints) and calculate percentage fit scores for all 23 GoF patterns. | **Completed** (`DiagnosticWizard.tsx`) |
| **FR-2** | **Production Scenario Matcher**: Provide 16+ pre-configured architectural scenarios with real-time text search and domain tag filters (Cloud, Fintech, UI, Microservices). | **Completed** (`ScenarioMatcher.tsx`) |
| **FR-3** | **Sibling Disambiguation Matrix**: Compare 7 classic GoF dilemma pairs side-by-side, displaying decisive pivot criteria, UML differences, and Fowler refactoring links. | **Completed** (`DisambiguationMatrix.tsx`) |
| **FR-4** | **AI Architect Copilot**: Support natural language problem statements with prompt template chips and multi-turn architectural debate (up to 5 follow-up turns). | **Completed** (`AIArchitectBar.tsx`) |
| **FR-5** | **Zero-Trust BYOK Modal**: Enable users to bring API keys for Gemini, OpenAI, Groq, or Ollama. Perform live dry-run validation before storing in RAM. | **Completed** (`BYOKModal.tsx`) |
| **FR-6** | **Session Decision Ledger**: Maintain an in-memory chronological ledger of all evaluated patterns during the active session. | **Completed** (`DecisionEnginePage.tsx`) |
| **FR-7** | **Slide-Over NotesDrawer**: Non-intrusive side panel hosting the active ADR, Session Ledger, and Field Guide heuristics. | **Completed** (`NotesDrawer.tsx`) |
| **FR-8** | **Deterministic Offline Heuristic**: Provide instant, zero-cost pattern recommendations when no cloud API key is configured. | **Completed** (`ai-service.ts`) |

---

## 3. Security & Privacy Requirements (SR)

* **SR-1 (Zero-Disk RAM Guarantee)**: API keys must never be written to `localStorage`, `sessionStorage`, cookies, or backend databases. Keys exist strictly in React memory and are destroyed on tab close.
* **SR-2 (Redacted Logging)**: If keys are forwarded via pass-through headers, backend logging must redact all key strings.
* **SR-3 (Safe Fallback)**: Rate limit errors (429) or model incompatibilities (400) must gracefully fall back to deterministic offline analysis without data loss.

---

## 4. UI/UX & Accessibility Requirements

* **UX-1 (100% Solid Cards & Scrims)**: Popups (`.byok-modal-card`) and drawers (`.notes-drawer-panel`) feature solid opaque backgrounds (`#ffffff` / `#121620`) with dark scrims (`rgba(0, 0, 0, 0.88)`), preventing text bleed-through.
* **UX-2 (Global Accessible Tooltips)**: All interactive buttons and badges utilize Radix UI `<AppTooltip>` primitives matching the top header Theme toggle button.
* **UX-3 (Mobile Responsiveness)**: On viewports $< 768px$, the side drawer transforms into an animated slide-up bottom sheet, complemented by a sticky docked verdict bar.
