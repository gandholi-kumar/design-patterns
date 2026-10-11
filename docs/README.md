# Project Documentation Directory

Welcome to the technical documentation for the **GoF Design Patterns Masterclass** workspace. This directory details the project's system architecture, current implementation state, data flow, and step-by-step guides for future full-stack extensions.

---

## Documentation Index

| Document | Description |
| :--- | :--- |
| **[Architecture Design](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/architecture-design.md)** | High-level system structure, monorepo design, Mermaid component diagrams, API code-generation pipeline, and sequence diagrams for both current and future data flows. |
| **[Current Implementation](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/current-implementation.md)** | Deep dive into the current client-side application (`pattern-masterclass`), local-first state model (`localStorage`), catalog structure, and the starter backend/database scaffolding. |
| **[Future Extension Guide](file:///h:/System%20design/design-pattern/replet/design-patterns/docs/future-extensions.md)** | Actionable blueprint for transitioning into a full-stack platform: adding endpoints, persisting progress to PostgreSQL, switching database engines, and adding authentication. |

---

## Project Refactoring Guides

Each package directory includes its own dedicated refactoring notes:

* **[pattern-masterclass Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/refactoring/REFACTORING_NOTES.md)**: God Component decomposition, Zod backup validation, custom store hook, and Strategy Pattern for simulators.
* **[api-server Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/refactoring/REFACTORING_NOTES.md)**: Centralized error handling middleware, graceful shutdown, environment validation, and modular routes.
* **[mockup-sandbox Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/mockup-sandbox/refactoring/REFACTORING_NOTES.md)**: React error boundary protection and responsive viewport controls.
* **[db Library Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/refactoring/REFACTORING_NOTES.md)**: Connection pool parameters, migration scripts, and schema design.
* **[api-spec Library Refactoring Notes](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/refactoring/REFACTORING_NOTES.md)**: OpenAPI spec expansion, standardized error components, and build-time codegen automation.

---

## Antigravity Agent Guidelines

* **[AGENTS.md](file:///h:/System%20design/design-pattern/replet/design-patterns/AGENTS.md)**: Primary project-level directives and quality gates for AI agents.
* **[.agents/rules/frontend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/frontend.md)**: React 19 standards, component decomposition, and accessibility.
* **[.agents/rules/state-management.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/state-management.md)**: 4-Layer state architecture (TanStack Query + Zustand + local primitives).
* **[.agents/rules/backend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/backend.md)**: Node.js, Express 5, Clean Architecture, and Drizzle ORM standards.



---

## Workspace Quick Reference

```text
design-patterns/
├── artifacts/
│   ├── pattern-masterclass/    # 🌟 Client-side React 19 learning application
│   ├── api-server/             # Express 5 backend server scaffolding
│   └── mockup-sandbox/         # Prototyping sandbox for previewing UI components
├── lib/
│   ├── api-spec/               # OpenAPI 3.1 contract and Orval generator config
│   ├── api-zod/                # Auto-generated Zod runtime validation schemas
│   ├── api-client-react/       # Auto-generated TanStack React Query hooks
│   └── db/                     # Drizzle ORM schema and PostgreSQL connection pool
├── docs/                       # Architecture and implementation documentation
├── scripts/                    # Workspace automation scripts
├── package.json                # Root build and dev scripts
└── pnpm-workspace.yaml         # Monorepo configuration and dependency catalog
```

### Key Commands

```bash
# Start the primary frontend application (React + Vite)
pnpm --filter @workspace/pattern-masterclass run dev

# Run full TypeScript check across all packages
pnpm run typecheck

# Build all packages in the workspace
pnpm run build

# Push database schema changes to PostgreSQL
pnpm --filter @workspace/db run push
```
