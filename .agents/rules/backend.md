# Backend Coding Standards (Node.js & Express 5)

These rules apply to all backend services and shared database libraries in this monorepo, primarily **`@workspace/api-server`** and **`@workspace/db`**.

---

## 1. Clean Architecture & Layered Structure

To maintain separation of concerns and ensure business logic is decoupled from HTTP transport and specific databases, all backend code must follow this layered structure:

```
src/
├── routes/          # Express route definitions (URL mapping)
├── controllers/     # Request/Response handling & input extraction
├── services/        # Business logic orchestration (Application Layer)
├── repositories/    # Database queries via Drizzle ORM (Infrastructure Layer)
├── middlewares/     # Auth, validation, error handling, logging
├── config/          # Environment variables & constants
├── app.ts           # Express application configuration
└── index.ts         # Server process entry point & lifecycle
```

### Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies |
| :--- | :--- | :--- |
| **Routes** | Binds HTTP paths and methods to controller functions. | Express Router |
| **Controllers** | Extracts parameters, validates inputs with Zod, invokes services, formats HTTP response. | Services, Zod Schemas |
| **Services** | Core business logic, domain rules, and transaction boundaries. | Repositories, Domain models (No `req`/`res`) |
| **Repositories** | Executes database queries, joins, and mutations via Drizzle ORM. | `@workspace/db`, Drizzle schemas |

---

## 2. Boundary Validation with Zod

1. **Validate All Inbound Data**:
   * Every endpoint accepting inputs must validate `req.body`, `req.query`, or `req.params` against a Zod schema before invoking business services.
   * Prefer auto-generated Zod schemas from `@workspace/api-zod` derived from `openapi.yaml`.
2. **Rejection at the Boundary**:
   * If validation fails, immediately return HTTP `400 Bad Request` with structured error details:
     ```typescript
     import { SaveProgressInput } from "@workspace/api-zod";

     export async function saveProgressController(req: Request, res: Response) {
       const result = SaveProgressInput.safeParse(req.body);
       if (!result.success) {
         return res.status(400).json({
           error: {
             message: "Invalid request payload",
             details: result.error.format(),
           },
         });
       }

       const saved = await progressService.save(result.data);
       return res.status(200).json(saved);
     }
     ```

---

## 3. Centralized Error Handling

1. **No Silent Swallowing of Errors**:
   * Never wrap code in empty `catch (e) {}` blocks.
2. **Express 5 Native Async Forwarding**:
   * In Express 5, async errors automatically bubble to the error middleware without requiring `try/catch` boilerplate in every route.
3. **Standardized Error Middleware**:
   * Mount a single centralized error handler at the end of `app.ts`:
     ```typescript
     import type { ErrorRequestHandler } from "express";
     import { logger } from "../lib/logger";

     export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
       logger.error({ err, path: req.path, method: req.method }, "Request error");

       if (res.headersSent) {
         return next(err);
       }

       const statusCode = err.statusCode || err.status || 500;
       res.status(statusCode).json({
         error: {
           message: statusCode === 500 ? "Internal server error" : err.message,
           code: err.code || "INTERNAL_ERROR",
         },
       });
     };
     ```

---

## 4. Database Access with Drizzle ORM

1. **No Raw SQL String Concatenation**:
   * Always use Drizzle ORM type-safe query builders:
     ```typescript
     // ✅ Best Practice: Type-safe query
     const userProgress = await db
       .select()
       .from(progressTable)
       .where(eq(progressTable.userId, userId));
     ```
2. **Connection Pool Hygiene**:
   * Always configure pool boundaries in `lib/db/src/index.ts`:
     * `max`: Limit concurrent connections (default: 10).
     * `idleTimeoutMillis`: Release idle connections after 30 seconds.
     * `connectionTimeoutMillis`: Fail fast (e.g. 5 seconds) if the database is unreachable.

---

## 5. Observability & Operational Readiness

1. **Structured JSON Logging**:
   * Use `pino` for all application logs.
   * Never use `console.log()` or `console.error()` in backend code.
   * Include structured context: `logger.info({ userId, patternId }, "Progress updated")`.
2. **Graceful Shutdown**:
   * Listen for `SIGTERM` and `SIGINT` in `index.ts`.
   * Stop accepting new HTTP requests, complete active in-flight requests, and drain the database connection pool before exiting.
3. **Strict Environment Validation**:
   * Validate all environment variables (`PORT`, `DATABASE_URL`, `NODE_ENV`) at startup with Zod. Fail fast if required variables are missing.
