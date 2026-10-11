# Antigravity Agent Guidelines & Project Instructions

Welcome to the **GoF Design Patterns Masterclass** workspace. This file serves as the primary system-level directive for AI coding agents operating within this repository.

---

## 1. Project Overview & Workspace Layout

This repository is a **pnpm monorepo** featuring client applications, shared schema protocols, and backend services:

```text
design-patterns/
├── artifacts/
│   ├── pattern-masterclass/     # Primary React 19 + Vite learning application
│   ├── api-server/              # Node.js + Express 5 backend service
│   └── mockup-sandbox/          # Isolated UI component prototyping sandbox
├── lib/
│   ├── api-spec/                # OpenAPI 3.1 specification & Orval codegen
│   ├── api-zod/                 # Auto-generated Zod runtime validation schemas
│   ├── api-client-react/        # Auto-generated TanStack React Query hooks
│   └── db/                      # Drizzle ORM schema & PostgreSQL pool
├── docs/                        # Architecture & implementation documentation
├── .agents/                     # Antigravity agent configuration & modular rules
│   └── rules/
│       ├── frontend.md          # React 19 & UI design guidelines
│       ├── state-management.md  # 4-Layer state management framework
│       └── backend.md           # Node.js / Express 5 & Clean Architecture
├── package.json                 # Monorepo task runner & scripts
└── pnpm-workspace.yaml          # Monorepo packages & security policies
```

---

## 2. Core Agent Operating Principles

When proposing or generating code changes in this repository, always enforce:

1. **Strict Type Safety**: Never use `any`. Use `unknown` with runtime type narrowing or derive types directly from schemas (Zod or Drizzle).
2. **Contract-First APIs**: Never write ad-hoc API types. Add endpoints to [lib/api-spec/openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) first, then regenerate with `pnpm --filter @workspace/api-spec run codegen`.
3. **Modular Component Architecture**: Avoid "God components". Decompose UI screens into focused components under `src/components/` and routes under `src/pages/`.
4. **Boundary Validation**: Every external input (HTTP request body, query parameter, uploaded backup file) must be validated using Zod at runtime.
5. **No Premature Optimization or Hallucinated Dependencies**: Do not install unverified third-party libraries. Utilize the existing catalog defined in `pnpm-workspace.yaml`.

---

## 3. Modular Rule Index

Specific engineering standards are partitioned into modular rules inside [`.agents/rules/`](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/):

| Rule Document | Domain & Scope |
| :--- | :--- |
| **[frontend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/frontend.md)** | React 19 best practices, JSX hygiene, custom hooks, accessible UI primitives, and Tailwind CSS v4 design tokens. |
| **[state-management.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/state-management.md)** | The 4-Layer State Architecture: TanStack Query (server), Zustand (global client), `useState`/`useReducer` (local), and Context (static values). |
| **[backend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/backend.md)** | Node.js & Express 5 standards, Clean Architecture layers, Drizzle ORM queries, error middleware, and graceful shutdown. |

---

## 4. Verification & Quality Gates

Before declaring any coding task complete, verify that the workspace passes all quality gates:

```bash
# 1. Typecheck the entire workspace
pnpm run typecheck

# 2. Typecheck specific applications
pnpm --filter @workspace/pattern-masterclass run typecheck
pnpm --filter @workspace/api-server run typecheck

# 3. Test production build
pnpm run build
```
