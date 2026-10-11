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
| **Node.js** | `v20.x LTS` or higher | JavaScript runtime (includes `npm`) | [nodejs.org](https://nodejs.org/) |
| **npm** or **pnpm** | `npm v9+` or `pnpm v9/v10` | Package manager | `npm` comes with Node.js; or `npm install -g pnpm` |
| **Git** | `2.x+` | Source control | [git-scm.com](https://git-scm.com/) |
| **Java JDK** | `JDK 25 LTS` *(optional)* | Java code execution in playground | [openjdk.org](https://openjdk.org/) |
| **PostgreSQL** | `16+` *(optional)* | Full-stack persistence (future roadmap) | [postgresql.org](https://www.postgresql.org/) |

> **Important:**
> - **Global `pnpm` is NOT required:** If you only have `npm`, the project's root scripts automatically bootstrap `pnpm` via `npx -y pnpm@10` under the hood. You can run all primary tasks with standard `npm run <script>` commands!
> - **Java JDK is optional** — the application runs fully without it. Java is only required if you want to execute Java code snippets inside the Interactive Code Playground. TypeScript execution uses an in-browser Web Worker and works without any extra setup.

### Verifying Installations

```bash
node --version   # Expected: v20.x.x or higher
npm --version    # Expected: 9.x.x or 10.x.x (or `pnpm --version` if pnpm is installed)
git --version
java --version   # Expected: openjdk 25.x.x (optional)
```

---

## 2. Clone and Install

```bash
# 1. Clone the repository
git clone https://github.com/gandholi-kumar/design-patterns.git

# 2. Navigate into the project directory
cd design-patterns

# 3. Install all workspace dependencies
# Option A: If you have pnpm installed globally (recommended)
pnpm install

# Option B: If you only have npm installed (bootstraps pnpm workspace engine via npx)
npx -y pnpm@10 install
```

> **Note:** Because this monorepo uses the `workspace:*` dependency protocol, dependencies across all packages (`artifacts/pattern-masterclass`, `artifacts/api-server`, `artifacts/mockup-sandbox`, `lib/*`, `scripts`) are linked by the pnpm workspace manager. If you use `npm`, `npx -y pnpm@10 install` handles this seamlessly in a single command without needing a permanent global install.

### First-time install tips

- pnpm enforces a **minimum release age of 1440 minutes (24 hours)** on packages as a supply-chain attack defense. This is by design.
- Run `pnpm install --frozen-lockfile` (or `npx -y pnpm@10 install --frozen-lockfile`) in CI environments to ensure reproducible builds.
- If you see peer dependency warnings, they are expected — the workspace uses `autoInstallPeers: false` intentionally.

---

## 3. Running the Frontend (Pattern Masterclass)

The primary learning application is a **React 19 + Vite** SPA (`@workspace/pattern-masterclass`).

### Quick Start (from monorepo root)

**With npm:**
```bash
npm run dev
# or
npm run dev:frontend
```

**With pnpm:**
```bash
pnpm run dev
# or with explicit filter:
pnpm --filter @workspace/pattern-masterclass run dev
```

Both commands start the Vite development server targeting the `pattern-masterclass` application.

### Access the app

Open your browser and navigate to:

```
http://localhost:5173
```

On successful startup, Vite will display:

```
  VITE v7.x.x  ready in ~800 ms

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

> **Important:** The backend **requires** a `PORT` environment variable. Without it, the server throws an error on startup:
> `"PORT environment variable is required but was not provided."`

### Step 1: Set the PORT environment variable

**Windows (PowerShell):**
```powershell
$env:PORT = "3000"
```

**Windows (Command Prompt / CMD):**
```cmd
set PORT=3000
```

**macOS / Linux / WSL:**
```bash
export PORT=3000
```

### Step 2: Start the API server

**With npm (from monorepo root):**
```bash
npm run dev:backend
# or
npm run dev:api
```

*One-liner in Windows PowerShell:*
```powershell
$env:PORT = "3000"; npm run dev:backend
```

*One-liner in macOS / Linux / WSL:*
```bash
PORT=3000 npm run dev:backend
```

**With pnpm (from monorepo root):**
```bash
pnpm run dev:backend
# or with explicit workspace filter:
pnpm --filter @workspace/api-server run dev
```

*One-liner in Windows PowerShell:*
```powershell
$env:PORT = "3000"; pnpm run dev:backend
```

*One-liner in macOS / Linux / WSL:*
```bash
PORT=3000 pnpm --filter @workspace/api-server run dev
```

The server startup performs two steps automatically:

1. **Build** — Compiles TypeScript via `esbuild` (`node ./build.mjs`)
2. **Start** — Launches the compiled server (`node --enable-source-maps ./dist/index.mjs`)

> **Windows Compatibility Note:** The backend `dev` script in `artifacts/api-server/package.json` executes cross-platform `node ./build.mjs && node --enable-source-maps ./dist/index.mjs` directly. This avoids Unix `export` syntax and ensures that both npm and pnpm work cleanly out-of-the-box on Windows PowerShell, CMD, macOS, and Linux.

### Expected output

```
[22:22:09.725] INFO (13424): Server listening
    port: 3000
```

The backend uses **pino** with pretty-printing enabled in development.

---

## 5. Running Both Services Concurrently

The frontend Vite dev server is pre-configured to proxy all `/api` requests to `http://localhost:3000`, so no manual CORS setup is needed.

### For npm users:

**Terminal 1 — Backend:**
```powershell
# Windows PowerShell:
$env:PORT = "3000"; npm run dev:backend

# macOS / Linux / WSL:
PORT=3000 npm run dev:backend
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

### For pnpm users:

**Terminal 1 — Backend:**
```powershell
# Windows PowerShell:
$env:PORT = "3000"; pnpm run dev:backend

# macOS / Linux / WSL:
PORT=3000 pnpm --filter @workspace/api-server run dev
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

**With npm (from monorepo root):**
```bash
# Typecheck all libraries, apps, and scripts:
npm run typecheck
```

**With pnpm:**
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

**With npm (from monorepo root):**
```bash
# Builds all workspace packages:
npm run build
```

**With pnpm:**
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

**With pnpm:**
```bash
# After editing lib/api-spec/openapi.yaml, regenerate Zod validators and React Query hooks:
pnpm --filter @workspace/api-spec run codegen
```

**With npm (via npx):**
```bash
npx -y pnpm@10 --filter @workspace/api-spec run codegen
```

> **Rule:** Never hand-write API types. Always edit `openapi.yaml` first, then regenerate.

### Database operations (future full-stack)

**With pnpm:**
```bash
# Push Drizzle ORM schema changes to PostgreSQL:
pnpm --filter @workspace/db run push

# Generate a SQL migration from schema diffs:
pnpm --filter @workspace/db run generate
```

**With npm:**
```bash
npx -y pnpm@10 --filter @workspace/db run push
npx -y pnpm@10 --filter @workspace/db run generate
```

---

## 9. Troubleshooting

### Error: PORT environment variable is required

**Cause:** Starting the API server without setting the `PORT` environment variable.

**Fix:**

**Windows (PowerShell):**
```powershell
# With npm:
$env:PORT = "3000"; npm run dev:backend

# With pnpm:
$env:PORT = "3000"; pnpm run dev:backend
```

**Windows (Command Prompt / CMD):**
```cmd
set PORT=3000 && npm run dev:backend
```

**macOS / Linux / WSL:**
```bash
PORT=3000 npm run dev:backend
```

---

### Error: 'export' is not recognized as an internal or external command

**Cause:** Running a script that uses Unix `export VAR=val` syntax on Windows PowerShell or CMD.

**Resolution:**
The repository scripts have been updated to be fully cross-platform. The backend script runs via `node ./build.mjs && node --enable-source-maps ./dist/index.mjs` directly. If you are starting manually in PowerShell, always use `$env:PORT = "3000"` instead of `export PORT=3000`.

---

### Error: pnpm: command not found

**Cause:** You have `npm` installed (bundled with Node.js) but not `pnpm` installed globally.

**Fix:** You do **not** need to install `pnpm` globally! The repository includes root-level `npm` script wrappers that automatically bootstrap `npx -y pnpm@10` behind the scenes:

```bash
# Everything works with npm from the root:
npm run dev            # Start frontend
npm run dev:backend    # Start backend
npm run typecheck      # Run all typechecks
npm run build          # Build all packages

# For one-off package commands without global pnpm:
npx -y pnpm@10 install
npx -y pnpm@10 --filter <package-name> run <script>
```

Alternatively, if you prefer having `pnpm` globally:
```bash
npm install -g pnpm
```

---

### Error: Port 5173 / 3000 already in use

**Fix:** Kill the occupying process or use a different port:

```bash
# With npm:
PORT=5174 npm run dev          # different frontend port
$env:PORT="3001"; npm run dev:backend  # different backend port (PowerShell)

# With pnpm:
PORT=5174 pnpm run dev
$env:PORT="3001"; pnpm --filter @workspace/api-server run dev
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
