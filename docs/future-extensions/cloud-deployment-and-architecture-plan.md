# Cloud Deployment, Dockerization & High-Scale Architecture Plan

This document outlines the strategic deployment guide, free-tier cloud platform analysis, containerization design, code portability requirements, and high-load microservices architecture for the **GoF Design Patterns Masterclass** platform.

---

## 1. Executive Summary & Codebase Constraints

An audit of the repository reveals key constraints that dictate the hosting and scaling model:

1. **Frontend (`artifacts/pattern-masterclass`)**:
   - Built on React 19 + Vite + Tailwind CSS v4 + Wouter routing.
   - Compiles down to pure static client-side assets (`dist/public/`).
   - TypeScript execution runs in-browser via a dedicated Web Worker (`ts-runner.worker.ts`).
   - Can be served via global Edge CDNs (Cloudflare Pages, Vercel) with 0ms cold starts and virtually unlimited bandwidth on free tiers.
2. **Backend (`artifacts/api-server`)**:
   - Built on Express 5 + Pino logger + Drizzle ORM.
   - Exposes `/api/healthz` and `/api/code/run`.
   - **Critical Constraint**: `/api/code/run` executes `javac` and `java` directly via Node.js `child_process.spawn`. Standard serverless platforms (Vercel serverless functions, Netlify functions, AWS Lambda standard) do not include a Java JDK. Therefore, the backend **must be hosted in a containerized environment (Docker)** or a VM with OpenJDK installed.
3. **Database Layer (`lib/db`)**:
   - Built with Drizzle ORM using `node-postgres` pool (`Pool({ connectionString: process.env.DATABASE_URL })`).
   - Fully compatible with any managed serverless PostgreSQL instance (Neon, Supabase).

---

## 2. Free-Tier Cloud Platform Comparison

| Platform | Role | Free Tier Specifications | JDK / Docker Support | Key Strengths & Caveats |
| :--- | :--- | :--- | :---: | :--- |
| **Cloudflare Pages** | **Frontend (SPA)** | Unlimited bandwidth, 300+ Edge locations, free custom domains & SSL. | N/A (Static Edge) | **Strengths:** 0ms cold start, best-in-class DDoS protection.<br>**Caveats:** Static files only. |
| **Render.com** | **Backend API** | 750 free compute hours/month, 512MB RAM, native Dockerfile builds. | **Yes** (via Dockerfile) | **Strengths:** Automated Git deploys, health checks, free SSL.<br>**Caveats:** Spins down after 15 min idle (~50s cold start). |
| **Koyeb** | **Backend API** | 1 free micro service (512MB RAM, micro vCPU), global edge mesh. | **Yes** (via Dockerfile) | **Strengths:** Native Docker support, very fast routing, less aggressive sleeping.<br>**Caveats:** Single free instance limit. |
| **Neon.tech** | **PostgreSQL DB** | 0.5 GB storage, serverless autoscaling, built-in connection pooling. | N/A (Database) | **Strengths:** Native PgBouncer connection pooling, instant branching.<br>**Caveats:** 0.5 GB limit (sufficient for thousands of users). |
| **Oracle Cloud** | **Unified Host** | 4 Ampere ARM cores, 24GB RAM, 200GB disk (Always Free). | **Yes** (Bare Linux / Docker) | **Strengths:** Sufficient capacity for 50,000+ daily active users without sleep.<br>**Caveats:** Requires credit card verification and manual VM setup. |

### Recommended Production Stack (100% Free)

```text
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Cloudflare Pages / Vercel   │           │          Render / Koyeb         │
│     (Frontend React 19 SPA)     │  /api/*   │     (Backend Docker with JDK)   │
│     - Global Edge CDN Cache     │ ────────> │  - Express 5 API Server         │
│     - Zero Cold Starts          │           │  - OpenJDK 17 (javac + java)    │
│     - Automatic SSL             │           │  - Non-root Container Sandbox   │
└─────────────────────────────────┘           └────────────────┬────────────────┘
                                                               │ Drizzle ORM
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │            Neon.tech            │
                                              │      (Serverless PostgreSQL)    │
                                              │      - PgBouncer Pooled Conn    │
                                              └─────────────────────────────────┘
```

---

## 3. Platform-Agnostic Docker Implementation

Containerizing the application ensures portability across Render, Koyeb, Railway, AWS ECS, Google Cloud Run, or any private VPS.

### A. Production Multi-Stage Backend Dockerfile (`Dockerfile.backend`)

Place this file at the workspace root:

```dockerfile
# ==============================================================================
# Stage 1: Build Workspace & Bundles
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

# Copy workspace package manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install dependencies and build shared libraries & api-server
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @workspace/api-zod run build || true
RUN pnpm --filter @workspace/db run build || true
RUN pnpm --filter @workspace/api-server run build

# ==============================================================================
# Stage 2: Minimal Runtime with OpenJDK for Code Sandbox
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Install OpenJDK for Java code execution
RUN apk add --no-cache openjdk17-jdk-headless

ENV NODE_ENV=production
ENV PORT=3000

# Copy built bundle and node runtime
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/package.json ./package.json

# Run as non-root user for security sandbox isolation
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/healthz || exit 1

CMD ["node", "./dist/index.mjs"]
```

### B. Local Development & Self-Hosted `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: masterclass_password
      POSTGRES_DB: gof_masterclass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-server:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: always
    environment:
      PORT: 3000
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:masterclass_password@postgres:5432/gof_masterclass
      CORS_ORIGIN: "*"
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

---

## 4. Code Adjustments for Universal Portability

To ensure the codebase runs across any host without breaking or requiring manual changes:

### 1. Robust Port Handling & Graceful Shutdown
In [artifacts/api-server/src/index.ts](../../artifacts/api-server/src/index.ts):
- **Current Issue**: Throws a fatal exception if `PORT` environment variable is not defined.
- **Solution**: Default to `process.env.PORT || 3000`, bind explicitly to `"0.0.0.0"`, and attach `SIGTERM` / `SIGINT` listeners for container orchestrators.

```typescript
const port = Number(process.env["PORT"] || 3000);
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  logger.info({ port, host }, "Server listening");
});

// Clean socket termination for Docker/Kubernetes rolling updates
const shutdown = (signal: string) => {
  logger.info({ signal }, "Graceful shutdown initiated");
  server.close(() => {
    logger.info("HTTP server closed cleanly");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref(); // 10s force exit fallback
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### 2. Configurable Dynamic CORS
In [artifacts/api-server/src/app.ts](../../artifacts/api-server/src/app.ts):
- Allow cross-origin requests from the production frontend domain while maintaining local development flexibility:

```typescript
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : "*";

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

### 3. Dynamic Frontend API Base URL
In [artifacts/pattern-masterclass/src/hooks/useCodeRunner.ts](../../artifacts/pattern-masterclass/src/hooks/useCodeRunner.ts):
- Update the fetch URL to use `import.meta.env.VITE_API_BASE_URL`:

```typescript
const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const response = await fetch(`${apiBase}/api/code/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'java', files, entryPoint, timeoutMs }),
  signal: controller.signal,
});
```

### 4. SPA Fallback Routing Configuration
Because Wouter handles routing on the client side, static hosting providers must redirect non-file paths to `index.html`:
- **Cloudflare Pages**: Add `public/_redirects`:
  ```text
  /*    /index.html   200
  ```
- **Vercel**: Add `artifacts/pattern-masterclass/vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 5. Architecture Evolution & High-Load Blueprint

### Monorepo vs Polyrepo Strategy

**Verdict: Retain Monorepo in Git, Decouple CI/CD Deployment Pipelines.**
- Splitting into separate git repositories causes contract drift between OpenAPI schemas, Zod types, and frontend clients.
- Use path-based triggers in CI/CD:
  - Frontend triggers build when `artifacts/pattern-masterclass/**` or `lib/**` changes.
  - Backend triggers build when `artifacts/api-server/**` or `lib/**` changes.

### High-Scale Microservices Architecture (10,000+ Concurrent Users)

When traffic grows, executing Java directly within Express HTTP handlers will saturate CPU and RAM. The target architecture separates heavy compute from API serving:

```text
                                [ CLIENT TRAFFIC ]
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │     Cloudflare Edge CDN      │ ── (Serves 95% of traffic:
                         │   Static Assets & Caching    │     WASM, CSS, JS, SVGs)
                         └──────────────┬───────────────┘
                                        │ /api/*
                                        ▼
                         ┌──────────────────────────────┐
                         │     Express API Gateway      │
                         │   - Token Bucket Rate Limit  │
                         │   - Health / Auth Probes     │
                         └───────┬──────────────┬───────┘
                                 │              │
          ┌──────────────────────┘              └──────────────────────┐
          │ (DB Queries)                                               │ (Code Run Task)
          ▼                                                            ▼
┌───────────────────────────┐                            ┌───────────────────────────┐
│     Neon PostgreSQL       │                            │    Redis Task Queue       │
│  - User Progress & State  │                            │    (BullMQ Job Broker)    │
│  - PgBouncer Conn Pool    │                            └─────────────┬─────────────┘
└───────────────────────────┘                                          │
                                                                       ▼
                                                         ┌───────────────────────────┐
                                                         │ Sandboxed Worker Pool     │
                                                         │ - Ephemeral Micro-VMs     │
                                                         │ - Max 4 Concurrent Tasks  │
                                                         │ - Hard 256MB RAM Limit    │
                                                         └───────────────────────────┘
```

#### High-Load Optimization Strategies:
1. **Edge Offloading**:
   - 95% of user interactions (browsing patterns, viewing diagrams, running TypeScript via Web Workers) are completely client-side. The backend only handles Java runs and API calls.
2. **Worker Queue Isolation**:
   - Java compilation jobs should be dispatched to an asynchronous Redis queue (BullMQ), preventing HTTP server thread starvation.
3. **Dedicated Sandbox Clusters (Piston / Judge0)**:
   - For enterprise-grade isolation, route `/api/code/run` to self-hosted [Piston](https://github.com/engineer-man/piston) or [Judge0](https://github.com/judge0/judge0) instances running on isolated VMs.
4. **PostgreSQL Connection Pooling**:
   - Standard Node.js connections exhaust Postgres limits under burst load. Use Neon's pooled endpoint (`-pooler.neon.tech`) to multiplex thousands of client queries through PgBouncer.

---

## 6. Step-by-Step Deployment Runbook

Follow these steps to deploy the application completely free:

### Step 1: Provision Free Serverless Database
1. Sign up at [neon.tech](https://neon.tech).
2. Create a database called `gof_masterclass`.
3. Copy the **Pooled Connection String** (`postgres://...-pooler.neon.tech/gof_masterclass?sslmode=require`).

### Step 2: Deploy Backend to Render / Koyeb
1. Push this repository to GitHub.
2. Sign in to [render.com](https://render.com) (or [koyeb.com](https://koyeb.com)).
3. Select **New** -> **Web Service** -> Connect your GitHub repo.
4. Set **Environment**: `Docker`.
5. Set **Dockerfile Path**: `Dockerfile.backend`.
6. Configure Environment Variables:
   - `PORT`: `3000`
   - `DATABASE_URL`: *(Your Neon connection string)*
   - `CORS_ORIGIN`: `*` (or your frontend domain once provisioned)
7. Deploy service and copy the public URL (e.g. `https://gof-masterclass-api.onrender.com`).

### Step 3: Deploy Frontend to Cloudflare Pages
1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages**.
2. Select **Create application** -> **Pages** -> Connect your GitHub repo.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `artifacts/pattern-masterclass`
   - **Build command**: `pnpm run build`
   - **Build output directory**: `dist/public`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://gof-masterclass-api.onrender.com`
5. Click **Save and Deploy**.
