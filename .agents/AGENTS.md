# Antigravity Workspace Rules Manifest

This directory defines the automated instructions and coding standards enforced by Antigravity agents in this workspace.

---

## Active Modular Rules

The following rule files are located in [`.agents/rules/`](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/):

* **[frontend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/frontend.md)**: Frontend engineering guidelines (React 19, Vite, Tailwind CSS v4, Accessibility, and Component Decomposition).
* **[state-management.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/state-management.md)**: Universal state management mental model (TanStack Query for server state, Zustand for client state, local React primitives).
* **[backend.md](file:///h:/System%20design/design-pattern/replet/design-patterns/.agents/rules/backend.md)**: Backend engineering guidelines (Node.js, Express 5, Clean Architecture, Drizzle ORM, Zod validation, and structured logging).

---

## Workspace Precedence

1. Any constraints defined in `.agents/rules/*.md` take immediate precedence when modifying code within their domain.
2. If modifying API boundaries, always prioritize [lib/api-spec/openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) as the single source of truth.
