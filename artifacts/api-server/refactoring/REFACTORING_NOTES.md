# Refactoring Notes: `@workspace/api-server`

**Project Type**: Node.js / Express 5 API Backend  
**Location**: `artifacts/api-server`  
**Primary Files**: [src/app.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/app.ts), [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/index.ts)

---

## 1. Architectural Diagnosis

### Current Strengths
1. **Modern Express Version**: Uses Express 5.2.1, which natively supports async route handlers and automatic promise rejection forwarding without requiring `express-async-errors`.
2. **High-Performance Structured Logging**: Uses `pino` and `pino-http` with request/response serializers, avoiding verbose console logs.
3. **Optimized Production Bundling**: Uses [build.mjs](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/build.mjs) via `esbuild` for fast single-bundle production output.

### Key Gaps & Vulnerabilities
1. **Missing Centralized Error-Handling Middleware**: If an error is thrown in an async route, Express default error handling triggers, which may leak internal error details.
2. **Missing Graceful Shutdown**: `server.close()` is not registered on `SIGTERM` or `SIGINT`. On pod restarts or container termination, in-flight HTTP requests and database connections will be forcefully killed.
3. **Environment Validation**: Port validation is manual. `DATABASE_URL` is not checked on startup.
4. **Security Hardening**: Missing `helmet` security headers and rate-limiting.

---

## 2. Refactoring Actions & Code Upgrades

### Action 1: Add Centralized Error-Handling Middleware
Create `src/middlewares/error-handler.ts`:

```typescript
import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled server error");

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : err.message,
      code: err.code || "INTERNAL_ERROR",
    },
  });
};
```

Mount it at the end of [src/app.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/app.ts):
```typescript
app.use("/api", router);
app.use(errorHandler); // Must be placed after all routes
```

---

### Action 2: Implement Graceful Shutdown & Database Teardown
Update [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/index.ts):

```typescript
import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const port = Number(process.env["PORT"] || 3000);

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received termination signal. Closing HTTP server...");
  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error during HTTP server shutdown");
      process.exit(1);
    }
    
    // Close PostgreSQL pool cleanly
    try {
      await pool.end();
      logger.info("Database pool closed successfully");
    } catch (dbErr) {
      logger.error({ dbErr }, "Error closing database pool");
    }

    process.exit(0);
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

---

### Action 3: Environment Variable Schema Validation with Zod
Replace manual string parsing in `src/index.ts` with a validated configuration:

```typescript
// src/config/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
});

export const env = EnvSchema.parse(process.env);
```

---

### Action 4: Modular Route Architecture
As the API expands beyond `/healthz`, organize routes cleanly:

```text
src/routes/
├── index.ts          # Mounts sub-routers on /api
├── health.ts         # GET /api/healthz
├── progress.ts       # GET & POST /api/progress
└── patterns.ts       # GET /api/patterns & bookmarks
```
