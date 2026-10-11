# GoF Design Patterns Masterclass & Decision Workshop

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express 5](https://img.shields.io/badge/Express-5.0-black.svg)](https://expressjs.com/)
[![JDK 25 LTS](https://img.shields.io/badge/Java-JDK_25_LTS-red.svg)](https://openjdk.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F.svg)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive, production-grade learning platform, multi-file code playground, and architectural decision engine covering all 23 Gang of Four (GoF) design patterns reimagined for modern engineering.

---

## 🌟 Key Application Modules

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 01 / THE LIBRARY & DETAIL STUDIO                                                       │
│ • Complete catalog of all 23 classic GoF patterns (Creational, Structural, Behavioral)  │
│ • Dual-Perspective Architecture: Canonical GoF (1994) vs. Enterprise Cloud (2026)      │
│ • Normalized SOLID Principles Evaluation Matrix grounded in Refactoring Guru & Martin   │
│ • Interactive UML and Mermaid diagrams with pan/zoom controls and source toggles       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 02 / INTERACTIVE CODE PLAYGROUND                                                       │
│ • Multi-File Project Workspace with protected entry points (⭐ index.ts / Main.java)    │
│ • Dual Execution Engines: Client-side TypeScript Web Worker + Java JDK 25 LTS Sandbox  │
│ • Dual-Mode Viewport: Stacked Editorial Flow vs. Resizable Split (react-resizable-panels)│
│ • Strict Single-Scroll Standard: Zero nested double-scrollbar traps                   │
│ • Robust Clipboard Suite: Copy File vs. Copy All with visual confirmations             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 03 / GOF DECISION ENGINE & ZERO-TRUST COPILOT                                          │
│ • Pillar 1: Diagnostic Wizard (3-step GoF causes of redesign weighted heuristic engine)│
│ • Pillar 2: Real-World Scenario Matcher (16+ production Cloud/Fintech/UI scenarios)    │
│ • Pillar 3: Sibling Disambiguation Matrix (7 classic GoF dilemma pairs resolved)       │
│ • AI Architect Copilot with multi-turn architectural debate dialog (up to 5 turns)      │
│ • Zero-Trust BYOK Key Manager: Strictly in browser RAM · Zero disk persistence         │
│ • Future-proof dynamic Gemini model discovery with self-healing JSON mode fallbacks    │
│ • Slide-Over NotesDrawer hosting Architectural Decision Records (ADRs) & Session Ledger│
│ • Mobile-First Responsive Architecture: Animated slide-up bottom sheet (< 768px)       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 04 & 05 / PATTERN STUDIO & SCENARIO LAB (STAGED)                                       │
│ • Rendered with elegant WIP placeholders preserving future route architecture          │
│ • Staged for visual object simulators and Leitner 5-box spaced repetition testing      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Monorepo Architecture

This repository is organized as a high-performance **pnpm monorepo**:

```text
design-patterns/
├── artifacts/
│   ├── pattern-masterclass/     # 🌟 Primary React 19 + Vite learning application
│   ├── api-server/              # Express 5 backend server & JDK 25 Java execution runner
│   └── mockup-sandbox/          # Isolated prototyping sandbox for UI components
├── lib/
│   ├── api-spec/                # OpenAPI 3.1 contract-first spec & Orval generator config
│   ├── api-zod/                 # Auto-generated Zod runtime validation schemas
│   ├── api-client-react/        # Auto-generated TanStack React Query hooks
│   └── db/                      # Drizzle ORM schema & PostgreSQL connection pool
├── docs/                        # Comprehensive categorized documentation
│   ├── architecture/            # System topology, sequence diagrams, current implementation
│   ├── code-editor/             # Code playground user guide & multi-file runtime contracts
│   ├── decision-engine/         # Decision Engine specs, zero-trust copilot, stage-2 wireframes
│   ├── prd/                     # Product Requirements Documents (PRDs)
│   ├── future-extensions/       # Full-stack PostgreSQL guide, multi-language roadmap
│   └── investigation/           # Enterprise cloud research & validation reports
├── package.json                 # Monorepo build and development scripts
└── pnpm-workspace.yaml          # Monorepo packages and dependency catalog
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: `v20.x` or higher
* **pnpm**: `v9.x` or `v10.x` (or use `npx -y pnpm@10`)
* **Java** (optional, for Java code playground): JDK 25 LTS installed locally

### Installation & Local Development

```bash
# 1. Clone repository
git clone https://github.com/gandholi-kumar/design-patterns.git
cd design-patterns

# 2. Install workspace dependencies
pnpm install

# 3. Start development server (React + Vite)
pnpm run dev
```

Visit **`http://localhost:5173`** in your browser.

### Quality Gates & Verification

```bash
# Typecheck all 9 workspace packages
pnpm run typecheck

# Build all packages for production
pnpm run build

# Regenerate API contracts and React Query hooks
pnpm --filter @workspace/api-spec run codegen
```

---

## 🔒 Security & Privacy (Zero-Disk RAM Guarantee)

The Decision Engine incorporates a **Zero-Trust Bring-Your-Own-Key (BYOK)** model:
* **In-Memory RAM Only**: Keys for Google Gemini, OpenAI, Groq, or Ollama exist **strictly in React RAM**.
* **Zero Disk Persistence**: Keys are never written to `localStorage`, `sessionStorage`, cookies, or backend servers.
* **Ephemeral Lifecycle**: Closing or reloading the browser tab permanently purges the key from memory.
* **Deterministic Offline Fallback**: Fully functional offline heuristic matching is always available without an API key.

---

## 📚 Documentation Index

Detailed technical documentation is partitioned into dedicated domain folders under [`docs/`](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/):

| Category | Key Documents |
| :--- | :--- |
| **🚀 Setup & Run Guide** | • [Getting Started: Setup & Running Guide](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/setup-guide/getting-started.md) — Prerequisites, installation, frontend & backend startup, env vars, troubleshooting |
| **System Architecture** | • [System Architecture Specification](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/architecture/system-architecture.md)<br>• [Current Implementation & Feature Catalog](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/architecture/current-implementation.md) |
| **Code Playground** | • [Code Editor & Multi-File Architecture Guide](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/code-editor/code-editor-and-multi-file-guide.md)<br>• [PRD: Interactive Code Playground](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/prd/prd-interactive-code-playground.md) |
| **Decision Engine** | • [GoF Decision Engine & Copilot Specification](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/decision-engine/decision-engine-architecture.md)<br>• [PRD: GoF Decision Engine](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/prd/prd-decision-engine.md)<br>• [Stage-2 Wireframes & Investigation](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/decision-engine/decision-engine-stage-2-wireframes.md) |
| **Future Extensions** | • [Roadmap, Full-Stack PostgreSQL & Migration Guide](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/future-extensions/roadmap-and-extensions.md) |
| **Research & Reports** | • [Enterprise Cloud Validation Report](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/investigation/enterprise-cloud-validation-report.md)<br>• [Pattern Authenticity & Dual-Example Architecture](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/investigation/pattern-authenticity-and-dual-example-architecture.md) |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
