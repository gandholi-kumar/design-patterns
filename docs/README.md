# GoF Design Patterns Masterclass — Technical Documentation Index

Welcome to the technical documentation directory for the **GoF Design Patterns Masterclass** monorepo. This directory houses architectural specifications, operational user guides, product requirement documents, and future implementation roadmaps organized into dedicated category domains.

---

## 1. Documentation Index by Category

```text
docs/
├── architecture/           # System topology, runtime sandboxes, current implementation
├── code-editor/            # Multi-file interactive code playground guides & runtime contracts
├── decision-engine/        # 3-Pillar Decision Engine specs, zero-trust BYOK, stage-2 wireframes
├── prd/                    # Product Requirements Documents (PRD) for all core modules
├── future-extensions/      # Full-stack PostgreSQL guide, multi-language expansion roadmap
└── investigation/          # Architectural validation reports & cloud enterprise research
```

---

### A. Architecture & System Topology
* **[System Architecture & Design Specification](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/architecture/system-architecture.md)**: High-level monorepo layout, client engines, sequence diagrams for Web Worker execution and zero-trust AI debate flows, and architectural quality attributes.
* **[Current Implementation Details & Feature Catalog](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/architecture/current-implementation.md)**: Deep dive into all 5 feature screens, the dual canonical/cloud perspective model, normalized SOLID principles matrix with literature citations, and shared scaffolding.

---

### B. Interactive Code Playground & Multi-File Architecture
* **[Code Playground User Guide: Code Editor & Multi-File Architecture](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/code-editor/code-editor-and-multi-file-guide.md)**: Operational guide for the dual-mode layout (Stacked vs. Resizable Split with `react-resizable-panels`), single-scroll standard, multi-file virtual tabs, ⭐ Entry points, Java default package rules, and TypeScript in-memory bundler contracts.

---

### C. GoF Decision Engine & Zero-Trust Copilot
* **[Production Architectural Specification: GoF Decision Engine & Copilot](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/decision-engine/decision-engine-architecture.md)**: Detailed specification for the 3 core pillars (Diagnostic Wizard, 16+ Production Scenarios, 7 Sibling Dilemmas), natural language AI debate copilot, Zero-Trust in-memory RAM key manager, dynamic Gemini model discovery with self-healing JSON mode fallbacks, session decision ledger, slide-over NotesDrawer, and mobile bottom sheet.
* **[Stage-2 Wireframes & Investigation Document](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/decision-engine/decision-engine-stage-2-wireframes.md)**: Historical architectural wireframes, design rationale, and step-by-step UX flows leading from Stage-2 through Stage-7.

---

### D. Product Requirements Documents (PRD)
* **[PRD: Interactive Multi-File Code Playground Engine](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/prd/prd-interactive-code-playground.md)**: Product vision, OneCompiler benchmark analysis, user stories, dual execution engine requirements, and multi-language roadmap.
* **[PRD: GoF Decision Engine & Zero-Trust Copilot](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/prd/prd-decision-engine.md)**: Product specification covering functional requirements (FR-1 through FR-8), zero-disk RAM security requirements, mobile responsiveness, and solid UI standards.

---

### E. Future Extensions & Full-Stack Roadmap
* **[Future Extensions, Architecture Roadmap & Migration Guide](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/future-extensions/roadmap-and-extensions.md)**: Actionable 5-step blueprint for wiring PostgreSQL persistence via Drizzle ORM, multi-language sandbox runners (Python Pyodide WASM, Go, Rust, C#), interactive visual simulator engines, and Leitner spaced repetition quiz lab.

---

### F. Architectural Research & Investigation
* **[Enterprise Cloud Validation Report](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/investigation/enterprise-cloud-validation-report.md)**: Formal verification and mapping of all 23 patterns to cloud-native microservice and Kubernetes primitives.
* **[Pattern Authenticity & Dual-Example Architecture](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/investigation/pattern-authenticity-and-dual-example-architecture.md)**: Original GoF literature analysis ensuring historical fidelity and modern relevance.

---

## 2. Package Refactoring Guides

* **[pattern-masterclass Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/refactoring/REFACTORING_NOTES.md)**: God Component decomposition, Zod backup validation, and custom store hooks.
* **[api-server Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/refactoring/REFACTORING_NOTES.md)**: Express 5 error handling middleware, graceful shutdown, and Java execution sandbox.
* **[mockup-sandbox Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/mockup-sandbox/refactoring/REFACTORING_NOTES.md)**: React error boundary protection and responsive viewport controls.
* **[db Library Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/refactoring/REFACTORING_NOTES.md)**: Connection pool parameters, migration scripts, and schema design.
* **[api-spec Library Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/refactoring/REFACTORING_NOTES.md)**: OpenAPI spec expansion and Orval build-time codegen automation.

---

## 3. Workspace Quick Reference

```text
design-patterns/
├── artifacts/
│   ├── pattern-masterclass/    # 🌟 Client-side React 19 + Vite learning application
│   ├── api-server/             # Express 5 backend server & Java execution sandbox
│   └── mockup-sandbox/         # Prototyping sandbox for previewing UI components
├── lib/
│   ├── api-spec/               # OpenAPI 3.1 contract and Orval generator config
│   ├── api-zod/                # Auto-generated Zod runtime validation schemas
│   ├── api-client-react/       # Auto-generated TanStack React Query hooks
│   └── db/                     # Drizzle ORM schema and PostgreSQL connection pool
├── docs/                       # Categorized technical documentation
├── scripts/                    # Workspace automation scripts
├── package.json                # Root build and dev scripts
└── pnpm-workspace.yaml         # Monorepo configuration and dependency catalog
```

### Key Commands

```bash
# Start the primary frontend application (React + Vite)
pnpm --filter @workspace/pattern-masterclass run dev

# Run full TypeScript check across all 9 packages in workspace
pnpm run typecheck

# Build all packages in the workspace
pnpm run build

# Push database schema changes to PostgreSQL
pnpm --filter @workspace/db run push

# Regenerate API types and React Query hooks from openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```
