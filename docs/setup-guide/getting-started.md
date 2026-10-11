# Getting Started: Setup & Running Guide

> **GoF Design Patterns Masterclass** — Complete developer onboarding guide for local development, backend API server, and production builds.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone and Install](#2-clone-and-install)
3. [Running the Frontend (Pattern Masterclass)](#3-running-the-frontend-pattern-masterclass)
4. [Running the Backend (API Server)](#4-running-the-backend-api-server)
5. [Running Both Services Concurrently](#5-running-both-services-concurrently)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Quality Gates (Typecheck and Build)](#7-quality-gates-typecheck-and-build)
8. [API Contract Codegen](#8-api-contract-codegen)
9. [Troubleshooting](#9-troubleshooting)
10. [Project Port Map](#10-project-port-map)

---

## 1. Prerequisites

Ensure the following tools are installed on your machine before proceeding:

| Tool | Minimum Version | Purpose | Install |
| ------ | ---------------- | --------- | --------- |
| **Node.js** | `v20.x LTS` or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **pnpm** | `v9.x` or `v10.x` | Monorepo package manager | `npm install -g pnpm` |
| **Git** | `2.x+` | Source control | [git-scm.com](https://git-scm.com/) |
| **Java JDK** | `JDK 25 LTS` *(optional)* | Java code execution in playground | [openjdk.org](https://openjdk.org/) |
| **PostgreSQL** | `16+` *(optional)* | Full-stack persistence (future roadmap) | [postgresql.org](https://www.postgresql.org/) |

> **Important:** **Java JDK is optional** — the application runs fully without it. Java is only required if you want to execute Java code snippets inside the Interactive Code Playground. TypeScript execution uses an in-browser Web Worker and works without any extra setup.

### Verifying Installations

```bash
node --version   # Expected: v20.x.x or higher
pnpm --version   # Expected: 9.x.x or 10.x.x
java --version   # Expected: openjdk 25.x.x (optional)
git --version
```

---

## 2. Clone and Install

```bash
# 1. Clone the repository
git clone https://github.com/gandholi-kumar/design-patterns.git

# 2. Navigate into the project directory
cd design-patterns

# 3. Install all workspace dependencies (pnpm handles all packages in one command)
pnpm install
```

> **Note:** `pnpm install` reads `pnpm-workspace.yaml` and installs dependencies for **all** monorepo packages simultaneously:
> `artifacts/pattern-masterclass`, `artifacts/api-server`, `artifacts/mockup-sandbox`, `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`, `lib/db`, and `scripts`.

### First-time install tips

- pnpm enforces a **minimum release age of 1440 minutes (24 hours)** on packages as a supply-chain attack defense. This is by design.
- Run `pnpm install --frozen-lockfile` in CI environments to ensure reproducible builds.
- If you see peer dependency warnings, they are expected — the workspace uses `autoInstallPeers: false` intentionally.

---

## 3. Running the Frontend (Pattern Masterclass)

The primary learning application is a **React 19 + Vite** SPA (`@workspace/pattern-masterclass`).

### Quick Start (from monorepo root)

```bash
pnpm run dev
```

This shorthand alias is defined in the root `package.json` and targets the `pattern-masterclass` app.

### Explicit filter command

```bash
pnpm --filter @workspace/pattern-masterclass run dev
```

### Access the app

Open your browser and navigate to:

`
http://localhost:5173
`

On successful startup, Vite will display:

```
  VITE v7.x.x  ready in 800 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

### Application modules available

| Module | Route | Status |
| -------- | ------- | -------- |
| The Library | `/` | ✅ Production |
| Interactive Code Playground | `/playground` | ✅ Production |
| GoF Decision Engine | `/decision` | ✅ Production |
| Pattern Studio | `/studio` | 🚧 Work In Progress |
| Scenario Lab | `/lab` | 🚧 Work In Progress |

---

## 4. Running the Backend (API Server)

The backend is an **Express 5 + Node.js** service (`@workspace/api-server`) that also serves as the Java execution sandbox.

> **Important:** The backend **requires** a `PORT` environment variable. Without it, the server throws an error on startup.

### Step 1: Set the PORT environment variable

**macOS / Linux / WSL:**

```bash
export PORT=3000
```

**Windows (PowerShell):**

```powershell
set PORT="3000"
```

**Windows (Command Prompt):**

```cmd
set PORT=3000
```

### Step 2: Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

The `dev` script performs two steps automatically:

1. **Build** — Compiles TypeScript via `esbuild` (`node ./build.mjs`)
2. **Start** — Launches the compiled server (`node --enable-source-maps ./dist/index.mjs`)

### Expected output

```json
{"level":30,"time":...,"port":3000,"msg":"Server listening"}
```

The backend uses **pino** (a JSON logger). To pretty-print in development:

```bash
pnpm --filter @workspace/api-server run dev | npx pino-pretty
```

---

## 5. Running Both Services Concurrently

The frontend Vite dev server is pre-configured to proxy all `/api` requests to `http://localhost:3000`, so no manual CORS setup is needed.

**Terminal 1 — Backend:**

```bash
export PORT=3000
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**

```bash
pnpm run dev
```

The frontend at `http://localhost:5173` will automatically proxy `/api/*` calls to the backend at `http://localhost:3000`.

### Proxy configuration

This is defined in `artifacts/pattern-masterclass/vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

---

## 6. Environment Variables Reference

### Frontend (`pattern-masterclass`)

| Variable | Default | Description |
| ---------- | --------- | ------------- |
| `PORT` | `5173` | Port for the Vite dev server |
| `BASE_PATH` | `/` | Base URL path prefix for subdirectory deployments |
| `NODE_ENV` | `development` | Enables/disables Replit dev plugins |

### Backend (`api-server`)

| Variable | Required | Description |
| ---------- | ---------- | ------------- |
| `PORT` | **Required** | Port for the Express server (e.g. `3000`) |
| `NODE_ENV` | Recommended | Set to `development` or `production` |
| `DATABASE_URL` | Future | PostgreSQL connection string for full-stack persistence |

> **Security Note:** **Never** store your Google Gemini API key in environment variables or files. The AI Copilot uses a Zero-Trust in-browser BYOK (Bring Your Own Key) model — the key lives exclusively in React RAM, is never sent to the backend, and is never persisted to disk.

---

## 7. Quality Gates (Typecheck and Build)

Run these before committing or raising a pull request:

### TypeScript type checking

```bash
# Check all 9 workspace packages (runs in ~15-30s):
pnpm run typecheck

# Check only the frontend:
pnpm --filter @workspace/pattern-masterclass run typecheck

# Check only the backend:
pnpm --filter @workspace/api-server run typecheck

# Check only shared libraries:
pnpm run typecheck:libs
```

### Production build

```bash
# Build all packages:
pnpm run build

# Build only the frontend (outputs to artifacts/pattern-masterclass/dist/):
pnpm --filter @workspace/pattern-masterclass run build

# Preview the production build locally:
pnpm --filter @workspace/pattern-masterclass run preview
```

---

## 8. API Contract Codegen

The project follows **contract-first API design**. The OpenAPI 3.1 spec is the single source of truth:

```bash
# After editing lib/api-spec/openapi.yaml, regenerate Zod validators and React Query hooks:
pnpm --filter @workspace/api-spec run codegen
```

> **Rule:** Never hand-write API types. Always edit `openapi.yaml` first, then regenerate.

### Database operations (future full-stack)

```bash
# Push Drizzle ORM schema changes to PostgreSQL:
pnpm --filter @workspace/db run push

# Generate a SQL migration from schema diffs:
pnpm --filter @workspace/db run generate
```

---

## 9. Troubleshooting

### Error: PORT environment variable is required

**Cause:** Starting the API server without setting `PORT`.

**Fix:**

```bash
export PORT=3000 && pnpm --filter @workspace/api-server run dev
# PowerShell:
 = "3000"; pnpm --filter @workspace/api-server run dev
```

---

### Error: pnpm: command not found

**Fix:** Use npx to run pnpm without a global install:

```bash
npx -y pnpm@10 install
npx -y pnpm@10 run dev
```

---

### Error: Port 5173 / 3000 already in use

**Fix:** Kill the occupying process or use a different port:

```bash
PORT=5174 pnpm run dev          # different frontend port
PORT=3001 pnpm --filter @workspace/api-server run dev  # different backend port
```

Remember to update the Vite proxy `target` in `vite.config.ts` if you change the backend port.

---

### TypeScript errors after pulling new changes

**Cause:** Stale `*.tsbuildinfo` cache files.

**Fix:**

```bash
# macOS/Linux:
find . -name "*.tsbuildinfo" -delete && pnpm run typecheck

# Windows PowerShell:
Get-ChildItem -Recurse -Filter "*.tsbuildinfo" | Remove-Item
pnpm run typecheck
```

---

### Java execution not working in the Code Playground

**Cause:** JDK not installed or `java` is not on your PATH.

**Fix:**

1. Download and install [JDK 25 LTS](https://openjdk.org/projects/jdk/25/)
2. Verify: `java --version`
3. Ensure `JAVA_HOME` is correctly set in your shell profile

TypeScript execution still works without Java — only Java snippets require a JDK.

---

### AI Copilot error: model not available

**Cause:** A deprecated model name was used.

**How the app handles this:** The application uses **dynamic model discovery** — it calls the Gemini Models API to list available models at runtime, so it automatically adapts to new model versions. If you still see this error:

1. Open the BYOK key manager in the Decision Engine
2. Enter a valid Google Gemini API key
3. Click Connect — the app will run a live test and auto-discover available models

---

### pnpm install fails due to release age policy

**Cause:** A newly released package version was published less than 24 hours ago.

**Fix:** Wait 24 hours or add the specific package to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily. Remove the exclusion once the window has passed.

---

## 10. Project Port Map

| Service | Default Port | URL | Environment Variable |
| --------- | ------------- | ----- | --------------------- |
| Frontend dev server | `5173` | `http://localhost:5173` | `PORT` |
| Backend API server | `3000` | `http://localhost:3000` | `PORT` |
| Frontend preview (prod) | `5173` | `http://localhost:5173` | `PORT` |

---

## Related Documentation

| Document | Description |
| ---------- | ------------- |
| [System Architecture](../architecture/system-architecture.md) | High-level monorepo topology and sequence diagrams |
| [Current Implementation](../architecture/current-implementation.md) | All 5 feature screens and implementation catalog |
| [Code Editor Guide](../code-editor/code-editor-and-multi-file-guide.md) | Interactive playground operations and execution engines |
| [Decision Engine Spec](../decision-engine/decision-engine-architecture.md) | 3-Pillar engine, zero-trust BYOK, model discovery |
| [Future Extensions Roadmap](../future-extensions/roadmap-and-extensions.md) | PostgreSQL, multi-language runners, quiz lab |
| [Root README](../../README.md) | Project overview and quick start |
