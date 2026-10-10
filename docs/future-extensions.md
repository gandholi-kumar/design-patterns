# Future Extensions & Migration Guide

This guide provides concrete, step-by-step instructions for extending the project into a full-stack platform, wiring backend persistence, and switching database engines.

---

## 1. Connecting the Frontend to the Backend (Full-Stack Extension)

Currently, the user's progress and bookmarks live in browser `localStorage`. To sync progress across devices, follow this 4-step workflow:

### Step 1: Define Endpoints in `lib/api-spec/openapi.yaml`
Add routes to [lib/api-spec/openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml):

```yaml
paths:
  /progress:
    get:
      operationId: getProgress
      summary: Retrieve user progress
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserProgress"
    post:
      operationId: saveProgress
      summary: Save or update progress
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SaveProgressInput"
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserProgress"

components:
  schemas:
    SaveProgressInput:
      type: object
      required: [patternId, box]
      properties:
        patternId:
          type: string
        attempts:
          type: integer
          default: 0
        correct:
          type: integer
          default: 0
        box:
          type: integer
          minimum: 1
          maximum: 5
        note:
          type: string
    UserProgress:
      type: object
      properties:
        progress:
          type: object
          additionalProperties:
            $ref: "#/components/schemas/SaveProgressInput"
```

### Step 2: Regenerate Types & Schemas
Run the code generation script from the root directory:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This automatically generates:
1. `SaveProgressInput` Zod schema in [lib/api-zod/](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-zod)
2. `useGetProgress()` and `useSaveProgress()` React Query hooks in [lib/api-client-react/](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-client-react)

### Step 3: Implement the Route in `artifacts/api-server`
Create `artifacts/api-server/src/routes/progress.ts`:

```typescript
import { Router } from "express";
import { SaveProgressInput } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { progressTable } from "@workspace/db/schema";

const router = Router();

router.post("/", async (req, res) => {
  // 1. Validate request body at runtime with Zod
  const parsed = SaveProgressInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { patternId, box, attempts, correct, note } = parsed.data;

  // 2. Persist to database using Drizzle ORM
  const result = await db.insert(progressTable).values({
    patternId,
    box,
    attempts,
    correct,
    note,
  }).onConflictDoUpdate({
    target: progressTable.patternId,
    set: { box, attempts, correct, note, updatedAt: new Date() }
  });

  return res.json({ success: true, data: result });
});

export default router;
```

### Step 4: Consume in `pattern-masterclass`
In [artifacts/pattern-masterclass/src/App.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/App.tsx), import and use the generated hook:

```typescript
import { useSaveProgress } from "@workspace/api-client-react";

function PatternCard({ pattern }) {
  const { mutate: saveProgress, isPending } = useSaveProgress();

  const handleQuizSuccess = () => {
    saveProgress({
      data: { patternId: pattern.id, box: 2, attempts: 1, correct: 1 }
    });
  };
  // ...
}
```

---

## 2. Setting Up the Database Layer

### Step 1: Create Table Schemas in `lib/db/src/schema/`
Create a new file `lib/db/src/schema/progress.ts`:

```typescript
import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const progressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").default("default-user"),
  patternId: text("pattern_id").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  correct: integer("correct").default(0).notNull(),
  box: integer("box").default(1).notNull(),
  note: text("note").default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Export it in [lib/db/src/schema/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/schema/index.ts):
```typescript
export * from "./progress";
```

### Step 2: Push Schema to PostgreSQL
Set your database connection URL in `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/design_patterns
```

Run Drizzle schema synchronization:
```bash
pnpm --filter @workspace/db run push
```

---

## 3. Database Migration Options

Thanks to **Drizzle ORM**, moving to a different database requires only minimal configuration changes.

### Option A: Migrating to SQLite / LibSQL / Turso
If you prefer a self-contained local file (`.db`) without running a PostgreSQL daemon:

1. **Update dependencies** in [lib/db/package.json](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/package.json):
   * Remove `pg` and `@types/pg`
   * Add `better-sqlite3` and `@types/better-sqlite3` (or `@libsql/client` for Turso)
2. **Update [lib/db/drizzle.config.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/drizzle.config.ts)**:
   ```typescript
   export default defineConfig({
     schema: "./src/schema/index.ts",
     dialect: "sqlite",
     dbCredentials: {
       url: process.env.DATABASE_URL || "file:./local.db",
     },
   });
   ```
3. **Update [lib/db/src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts)**:
   ```typescript
   import { drizzle } from "drizzle-orm/better-sqlite3";
   import Database from "better-sqlite3";
   import * as schema from "./schema";

   const sqlite = new Database(process.env.DATABASE_URL || "local.db");
   export const db = drizzle(sqlite, { schema });
   ```
4. **Update Table Schemas**:
   Replace `drizzle-orm/pg-core` with `drizzle-orm/sqlite-core` (`sqliteTable`, `text`, `integer`).

---

### Option B: Migrating to MySQL / PlanetScale
1. In [lib/db/package.json](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/package.json), replace `pg` with `mysql2`.
2. In [lib/db/drizzle.config.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/drizzle.config.ts), set:
   ```typescript
   dialect: "mysql"
   ```
3. In schemas, replace `drizzle-orm/pg-core` with `drizzle-orm/mysql-core` (`mysqlTable`).
4. In [lib/db/src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts), initialize with:
   ```typescript
   import { drizzle } from "drizzle-orm/mysql2";
   import mysql from "mysql2/promise";
   
   const pool = mysql.createPool(process.env.DATABASE_URL!);
   export const db = drizzle(pool, { schema });
   ```

---

### Option C: Migrating to MongoDB (Document Store)
Because MongoDB is non-relational, Drizzle ORM does not support it. To switch to MongoDB:
1. Replace `@workspace/db` with [Mongoose](https://mongoosejs.com/) or [Prisma ORM](https://www.prisma.io/).
2. Define a Mongoose model:
   ```typescript
   import mongoose from "mongoose";

   const ProgressSchema = new mongoose.Schema({
     patternId: { type: String, required: true },
     box: { type: Number, default: 1 },
     attempts: { type: Number, default: 0 },
     correct: { type: Number, default: 0 },
     note: String,
   });

   export const ProgressModel = mongoose.model("Progress", ProgressSchema);
   ```

---

## 4. Adding User Authentication

The custom fetch client in [lib/api-client-react/src/custom-fetch.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-client-react/src/custom-fetch.ts) already includes a built-in hook for token injection:

```typescript
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Automatically appends Bearer <token> to every API request
setAuthTokenGetter(async () => {
  return localStorage.getItem("auth_token") || "";
});
```

To secure endpoints:
1. Add an authentication middleware in `artifacts/api-server/src/middlewares/auth.ts` (validating JWT or session cookie).
2. Attach `userId` to `req.user` to scope all database reads and writes to the authenticated individual.

---

## 5. Architectural Pattern Extensions

Beyond the 23 Gang of Four patterns, the catalog can be expanded to cover modern distributed and enterprise patterns by adding entries in [artifacts/pattern-masterclass/src/data.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/data.ts):

* **Cloud & Distributed Patterns**: Circuit Breaker, Saga, Event Sourcing, CQRS, Ambassador.
* **Architectural Enterprise Patterns**: Repository Pattern, Unit of Work, Clean Architecture, Dependency Injection.
