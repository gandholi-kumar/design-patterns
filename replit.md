# GoF Design Patterns Masterclass

A client-side learning app for exploring the 23 Gang of Four design patterns through examples, decision guidance, simulations, and scenario practice.

## Run & Operate

- `pnpm --filter @workspace/pattern-masterclass run dev` — run the React app
- `pnpm --filter @workspace/pattern-masterclass run typecheck` — typecheck the app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, Vite, Tailwind CSS, Wouter
- Local-only progress and settings stored in browser `localStorage`

## Where things live

- `artifacts/pattern-masterclass/src/App.tsx` — app routes, screens, state, and interactions
- `artifacts/pattern-masterclass/src/data.ts` — pattern catalog and quiz scenarios
- `artifacts/pattern-masterclass/src/java-examples.ts` — Java example snippets
- `artifacts/pattern-masterclass/src/index.css` — visual theme and responsive styles

## Architecture decisions

- User progress stays in the browser; this first version has no account or server sync.
- Backup/restore and ZIP downloads are generated client-side.

## Product

- Browse, search, sort, filter, and bookmark 23 patterns across three families.
- Read pattern trade-offs and Java/TypeScript examples; use a decision guide, code playground, simulators, and scenario quiz.
- Persist learning state locally and export or restore it as a JSON backup.

## User preferences

_No additional standing preferences recorded._

## Gotchas

_No additional operational gotchas recorded._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
