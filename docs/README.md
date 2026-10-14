# GoF Design Patterns Masterclass — Technical Documentation Index

Welcome to the technical documentation directory for the **GoF Design Patterns Masterclass** monorepo. This directory houses architectural specifications, operational user guides, product requirement documents, and future implementation roadmaps organized into dedicated category domains.

---

## 1. Documentation Index by Category

```text
docs/
├── setup-guide/        # Developer onboarding, prerequisites, and step-by-step run instructions
├── architecture/           # System topology, runtime sandboxes, current implementation
├── code-editor/            # Multi-file interactive code playground guides & runtime contracts
├── decision-engine/        # 3-Pillar Decision Engine specs, zero-trust BYOK, stage-2 wireframes
├── prd/                    # Product Requirements Documents (PRD) for all core modules
├── future-extensions/      # Full-stack PostgreSQL guide, multi-language expansion roadmap
├── audit/                  # Architecture, code standards, security & quality gate audit reports
└── investigation/          # Architectural validation reports & cloud enterprise research
```

---

### A. Setup & Run Guide (Start Here)
* **[Getting Started: Setup & Running Guide](./setup-guide/getting-started.md)**: Complete developer onboarding guide covering prerequisites (Node.js, pnpm, JDK), clone and install instructions, step-by-step commands for starting the frontend Vite dev server and backend Express server, environment variable reference, quality gates (typecheck and build), API codegen workflow, port map, and 7 troubleshooting scenarios.

---

### B. Architecture & System Topology
* **[System Architecture & Design Specification](./architecture/system-architecture.md)**: High-level monorepo layout, client engines, sequence diagrams for Web Worker execution and zero-trust AI debate flows, and architectural quality attributes.
* **[Current Implementation Details & Feature Catalog](./architecture/current-implementation.md)**: Deep dive into all 5 feature screens, the dual canonical/cloud perspective model, normalized SOLID principles matrix with literature citations, and shared scaffolding.
* **[ARCH-2026-004: Database & Object Storage Migration Plan](./architecture/01-database-and-object-storage-migration.md)**: Comprehensive migration guide from browser `localStorage` / `IndexedDB` to PostgreSQL JSONB (Drizzle ORM) and switchable S3-compatible object storage (Cloudflare R2 & Backblaze B2).
* **[ARCH-2026-005: Authentication, Session Management & RBAC Architecture](./architecture/02-auth-sessions-rbac-identity-architecture.md)**: Complete identity architecture using Better Auth + Drizzle Adapter + RBAC plugin, credentials login, Google & GitHub OAuth 2.0 PKCE, and hardened HttpOnly cookie sessions.
* **[ARCH-2026-006: Monorepo Deployment, Decoupled CI/CD & Custom Domain Strategy](./architecture/03-monorepo-deployment-and-decoupling-strategy.md)**: Deep analysis of monorepo vs polyrepo, why backend upgrades do not cause frontend downtime, zero-downtime rolling deploys, and Cloudflare Pages unified custom domain reverse proxy.
* **[ARCH-2026-007: Full-Stack Implementation Action Plan](./architecture/04-execution-action-plan.md)**: Phased execution tracker with status checkboxes covering database schemas, Better Auth, switchable S3 storage, contracts, and frontend integration.


---

### C. Interactive Code Playground & Multi-File Architecture
* **[Code Playground User Guide: Code Editor & Multi-File Architecture](./code-editor/code-editor-and-multi-file-guide.md)**: Operational guide for the dual-mode layout (Stacked vs. Resizable Split with `react-resizable-panels`), single-scroll standard, multi-file virtual tabs, ⭐ Entry points, Java default package rules, and TypeScript in-memory bundler contracts.

---

### D. GoF Decision Engine & Zero-Trust Copilot
* **[ARCH-2026-008: BYOK vs. Built-in Pro AI Architect Architecture & Action Plan](./decision-engine/01-byok-and-managed-pro-ai-architecture.md)**: Architectural comparison, security guarantees, data flow, and phased execution tracker for the dual-mode AI engine (Zero-Trust BYOK in volatile RAM vs. server-managed Built-in Pro AI with zero key required and PostgreSQL Decision Ledger synchronization).
* **[Production Architectural Specification: GoF Decision Engine & Copilot](./decision-engine/decision-engine-architecture.md)**: Detailed specification for the 3 core pillars (Diagnostic Wizard, 16+ Production Scenarios, 7 Sibling Dilemmas), natural language AI debate copilot, Zero-Trust in-memory RAM key manager, dynamic Gemini model discovery with self-healing JSON mode fallbacks, session decision ledger, slide-over NotesDrawer, and mobile bottom sheet.
* **[Stage-2 Wireframes & Investigation Document](./decision-engine/decision-engine-stage-2-wireframes.md)**: Historical architectural wireframes, design rationale, and step-by-step UX flows leading from Stage-2 through Stage-7.

---

### E. Product Requirements Documents (PRD)
* **[PRD: Per-Pattern Rich Notes System](./prds/prd-per-pattern-notes.md)**: Complete product requirements document for the dual-orientation rich notes system with DB-agnostic persistence and IndexedDB media caching.
* **[PRD: Interactive Multi-File Code Playground Engine](./prd/prd-interactive-code-playground.md)**: Product vision, OneCompiler benchmark analysis, user stories, dual execution engine requirements, and multi-language roadmap.
* **[PRD: GoF Decision Engine & Zero-Trust Copilot](./prd/prd-decision-engine.md)**: Product specification covering functional requirements (FR-1 through FR-8), zero-disk RAM security requirements, mobile responsiveness, and solid UI standards.

---

### F. Architectural Decision Records (ADR) & Design Specifications
* **[ADR-2026-003: Per-Pattern Rich Notes Architecture](./adr/2026-10-12-per-pattern-notes-architecture.md)**: Repository pattern abstraction, dual-orientation layout system, hybrid LocalStorage/IndexedDB transitioning to PostgreSQL JSONB + Backblaze B2, BlockNote rich text block tree, and zero-3rd-nested-scroll guarantee.
* **[Frontend & UX Spec: Per-Pattern Rich Notes](./design/notes-ui-spec.md)**: Design system tokens, save state indicators, responsive panel dynamics, image zoom/resize handles, and accessibility mapping.

---

### F. Future Extensions & Full-Stack Roadmap
* **[Future Extensions, Architecture Roadmap & Migration Guide](./future-extensions/roadmap-and-extensions.md)**: Actionable 5-step blueprint for wiring PostgreSQL persistence via Drizzle ORM, multi-language sandbox runners (Python Pyodide WASM, Go, Rust, C#), interactive visual simulator engines, and Leitner spaced repetition quiz lab.
* **[Cloud Deployment, Dockerization & High-Scale Architecture Plan](./future-extensions/cloud-deployment-and-architecture-plan.md)**: Complete guide covering free frontend/backend hosting platform evaluations (Cloudflare Pages, Render, Koyeb, Neon), multi-stage Dockerfile with OpenJDK runtime, code adjustments for cloud portability, and high-load microservices scaling architecture.


---

### G. Architectural Research & Investigation
* **[Enterprise Cloud Validation Report](./investigation/enterprise-cloud-validation-report.md)**: Formal verification and mapping of all 23 patterns to cloud-native microservice and Kubernetes primitives.
* **[Pattern Authenticity & Dual-Example Architecture](./investigation/pattern-authenticity-and-dual-example-architecture.md)**: Original GoF literature analysis ensuring historical fidelity and modern relevance.

---

### H. Architecture & Code Standards Audits
* **[Comprehensive Architecture & Code Standards Audit](./audit/codebase-architecture-standards-audit.md)**: In-depth evaluation of monorepo topology, contract-first enforcement, 4-layer state management gap analysis, backend Clean Architecture compliance, dependency CVE scan, Java sandbox security assessment, and prioritized remediation roadmap.

---

## 2. Package Refactoring Guides

* **[pattern-masterclass Refactoring Notes](../artifacts/pattern-masterclass/refactoring/REFACTORING_NOTES.md)**: God Component decomposition, Zod backup validation, and custom store hooks.
* **[api-server Refactoring Notes](../artifacts/api-server/refactoring/REFACTORING_NOTES.md)**: Express 5 error handling middleware, graceful shutdown, and Java execution sandbox.
* **[mockup-sandbox Refactoring Notes](../artifacts/mockup-sandbox/refactoring/REFACTORING_NOTES.md)**: React error boundary protection and responsive viewport controls.
* **[db Library Refactoring Notes](../lib/db/refactoring/REFACTORING_NOTES.md)**: Connection pool parameters, migration scripts, and schema design.
* **[api-spec Library Refactoring Notes](../lib/api-spec/refactoring/REFACTORING_NOTES.md)**: OpenAPI spec expansion and Orval build-time codegen automation.

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
