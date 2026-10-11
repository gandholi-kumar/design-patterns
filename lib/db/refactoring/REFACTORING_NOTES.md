# Refactoring Notes: `@workspace/db`

**Project Type**: Database & ORM Layer (Drizzle ORM)  
**Location**: `lib/db`  
**Primary Files**: [drizzle.config.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/drizzle.config.ts), [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts), [src/schema/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/schema/index.ts)

---

## 1. Current State & Gaps

1. **Empty Schema**: [src/schema/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/schema/index.ts) contains only comment templates and exports `{}`.
2. **Missing Migration Scripts**: [package.json](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/package.json) contains `push` and `push-force`, but no `generate` or `migrate` scripts. In team environments or production CI/CD, raw `drizzle-kit push` can risk silent data loss compared to versioned SQL migration files.
3. **Unbounded Connection Pool**: [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts) instantiates `new Pool({ connectionString })` with default settings (unbounded connection lifetime, no timeouts, no max limit).

---

## 2. Refactoring Actions

### Action 1: Add Production Connection Pool Limits
Configure robust connection parameters in [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts):

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                      // Maximum active connections
  idleTimeoutMillis: 30000,     // Close idle connections after 30s
  connectionTimeoutMillis: 5000,// Fail fast if DB unreachable
});

export const db = drizzle(pool, { schema });
export * from "./schema";
```

---

### Action 2: Add Versioned Migration Scripts to `package.json`
Update [package.json](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/package.json):

```json
{
  "scripts": {
    "generate": "drizzle-kit generate --config ./drizzle.config.ts",
    "migrate": "drizzle-kit migrate --config ./drizzle.config.ts",
    "push": "drizzle-kit push --config ./drizzle.config.ts",
    "push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
  }
}
```

Update `drizzle.config.ts` to output migration files into `./migrations`:
```typescript
export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: path.join(__dirname, "./migrations"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

### Action 3: Define Production Domain Tables
Create `lib/db/src/schema/progress.ts`:

```typescript
import { pgTable, text, integer, timestamp, serial, uniqueIndex } from "drizzle-orm/pg-core";

export const progressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  patternId: text("pattern_id").notNull(),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  box: integer("box").notNull().default(1),
  note: text("note").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userPatternIdx: uniqueIndex("user_pattern_idx").on(table.userId, table.patternId),
}));

export const bookmarksTable = pgTable("user_bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  patternId: text("pattern_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userBookmarkIdx: uniqueIndex("user_bookmark_idx").on(table.userId, table.patternId),
}));
```
Export both from [src/schema/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/schema/index.ts).
