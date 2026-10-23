# Production Deployment Guide: Neon, Render & Vercel

This document provides the definitive, step-by-step production runbook for deploying the **GoF Design Patterns Masterclass** platform. 

It details the clean, decoupled architecture:
1. **Database Layer**: Serverless PostgreSQL on **Neon.tech**
2. **Backend Service**: Containerized Express 5 + OpenJDK 17 on **Render.com**
3. **Frontend Application**: React 19 + Vite Static SPA on **Vercel**

---

## Architecture Overview

```text
┌─────────────────────────────────┐           ┌────────────────────────────────────────┐
│         Vercel (Frontend)       │           │          Render.com (Backend)          │
│   React 19 + Vite Static SPA    │  /api/*   │   Docker Container (node:22-alpine)    │
│   - Global Edge CDN Cache       │──────────>│   - Express 5 API Server (Port 3000)   │
│   - SPA Client-Side Rewrites    │           │   - OpenJDK 17 (javac + java sandbox)  │
│   - Reads VITE_API_BASE_URL     │           │   - Self-contained bundled runtime     │
└─────────────────────────────────┘           └───────────────────┬────────────────────┘
                                                                  │ Drizzle ORM (Pooled TCP)
                                                                  ▼
                                              ┌────────────────────────────────────────┐
                                              │            Neon.tech (Database)        │
                                              │   Serverless PostgreSQL 16             │
                                              │   - PgBouncer connection pooling       │
                                              │   - Automated SSL & High Availability  │
                                              └────────────────────────────────────────┘
```

---

## Core Codebase Configuration Files

The repository is pre-configured with three key files that govern this architecture:

### 1. `Dockerfile.backend` (Workspace Root)
A multi-stage Docker build that creates an isolated production image bundling Node.js 22 and OpenJDK 17:

```dockerfile
# Stage 1: Build Workspace & Bundles
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @workspace/api-zod run build || true
RUN pnpm --filter @workspace/db run build || true
RUN pnpm --filter @workspace/api-server run build

# Stage 2: Minimal Runtime with OpenJDK for Code Sandbox
FROM node:22-alpine AS runner
WORKDIR /app
# Install OpenJDK 17 for Java code compilation and execution (javac + java)
RUN apk add --no-cache openjdk17-jdk

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/healthz || exit 1

CMD ["node", "./dist/index.mjs"]
```

### 2. `artifacts/api-server/build.mjs`
Ensures the server bundle is self-contained. Internal telemetry dependencies like `@opentelemetry/semantic-conventions` are bundled directly into `dist/index.mjs` so the container boots without requiring a separate `node_modules` directory in production.

### 3. `vercel.json` (Workspace Root)
Standardizes the Vercel deployment as a Vite Single Page Application (SPA):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm --filter @workspace/pattern-masterclass run build",
  "outputDirectory": "artifacts/pattern-masterclass/dist/public",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Stage 1: Database Provisioning & Schema Migration (Neon)

### 1. Provision the Database
1. Go to **[neon.tech](https://neon.tech)** and sign in.
2. Click **Create Project**:
   - **Project Name**: `gof-masterclass`
   - **Postgres Version**: `16`
   - **Region**: Choose the region closest to your compute (e.g. `eu-central-1` or `us-east-1`).
3. Under **Connection Details** on the project dashboard:
   - Select **Pooled connection**.
   - Copy the connection string format:
     ```text
     postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require
     ```

### 2. Push Schema to Neon
Run Drizzle Kit from your local development machine using `npx -y pnpm@10` to initialize all database tables:

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"
npx -y pnpm@10 --filter @workspace/db run push
```

Output confirmation:
```text
Reading config file '.../lib/db/drizzle.config.ts'
Using 'pg' driver for database querying
[✓] Pulling schema from database...
[✓] Changes applied
```

---

## Stage 2: Backend Deployment (Render.com)

### 1. Create Web Service
1. Log in to **[render.com](https://dashboard.render.com/)** via GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select **Build and deploy from a Git repository** ➔ Select `gandholi-kumar/design-patterns`.
4. Configure the service settings:
   - **Name**: `design-patterns-api`
   - **Branch**: `main`
   - **Language**: `Docker`
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Instance Type**: `Free` (or `Starter` for zero sleep)

### 2. Configure Environment Variables
In the Render dashboard under **Environment Variables**, add the following:

| Variable Key | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `3000` | Port container listens on |
| `DATABASE_URL` | `postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require` | Pooled Neon PostgreSQL connection |
| `CORS_ORIGIN` | `*` (or your Vercel URL) | Cross-origin resource sharing allowance |
| `BETTER_AUTH_SECRET` | `your_32_character_random_secret_key` | Better Auth session encryption key |
| `BETTER_AUTH_URL` | `https://design-patterns-api-xxxx.onrender.com` | Public URL assigned by Render |

### 3. Deploy & Verify
1. Click **Deploy Web Service**.
2. Once the build completes and status transitions to **Live**, test the healthcheck in your browser or terminal:
   ```bash
   curl https://design-patterns-api-xxxx.onrender.com/api/healthz
   ```
   Expected response:
   ```json
   {"status":"ok"}
   ```

---

## Stage 3: Frontend Deployment (Vercel)

### 1. Configure Framework Preset
1. Open your project on the **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Navigate to **Settings** ➔ **General**.
3. Under **Framework Preset**, select **`Vite`** (do not select "Services").
4. Click **Save**.

### 2. Configure Public API Base URL
1. Navigate to **Settings** ➔ **Environment Variables**.
2. Click **Add Variable**:
   - **Type**: Select **`Config`** *(Vercel prohibits `VITE_` public client-side variables from being marked as `Secret`)*.
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://design-patterns-api-xxxx.onrender.com` *(Your Render backend URL)*
   - **Environments**: Check **Production**, **Preview**, and **Development**.
3. Click **Save**.

### 3. Deploy / Redeploy
1. Go to the **Deployments** tab.
2. Click the three dots (`...`) next to the latest commit on `main` ➔ Click **Redeploy**.
3. Vercel compiles the Vite SPA and distributes it to the global Edge CDN.

---

## Verification & Sanity Checklist

After completing the three stages, verify full system functionality:

| Check | Action | Expected Result |
| :--- | :--- | :--- |
| **Backend Health** | Visit `https://<render-url>/api/healthz` | `{"status":"ok"}` |
| **SPA Client Routing** | Visit `https://<vercel-url>/patterns/factory-method` directly | Renders Factory Method page without 404 |
| **Database Connectivity** | Create a note or update progress in the UI | Persists to Neon DB across reloads |
| **Java Code Runner** | Open the interactive code runner and execute Java code | Compiles with `javac` and runs with `java` via OpenJDK in the Render container |

---

## Ongoing Maintenance & Branch Workflow

1. **Developing Features**: Create a branch, push code, and open a PR. Vercel generates preview URLs automatically.
2. **Merging to Production**: Merge PR into `main`. 
   - Render automatically rebuilds and deploys the backend container from `main`.
   - Vercel automatically rebuilds and deploys the static frontend from `main`.
