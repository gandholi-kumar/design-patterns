# Future Extensions, Architecture Roadmap & Migration Guide

This guide provides concrete, step-by-step instructions for extending the **GoF Design Patterns Masterclass** platform from its current local-first baseline into a full-stack, multi-language, enterprise-ready collaborative platform.

---

## 1. Roadmap Overview & Strategic Phases

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Full-Stack Persistence (PostgreSQL + Drizzle ORM + Orval Codegen)             │
│ • Migrate localStorage progress & bookmarks to PostgreSQL                              │
│ • Sync Decision Engine Session Ledgers across devices                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Multi-Language Code Playground (Python WASM, Go, Rust, C#)                    │
│ • Client-side Pyodide Web Worker for Python 3.12                                       │
│ • Containerized server-side sandbox runners for Go (go run .) and Rust (Cargo)         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: Interactive Pattern Studio Visual Simulators                                  │
│ • Real-time visual simulators replacing WIP placeholders                               │
│ • Strategy algorithm swap, Observer pub/sub mesh, Decorator stream wrapper             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Scenario Lab Leitner Spaced Repetition Engine                                 │
│ • 5-Box Leitner spaced testing algorithm with retention decay analytics                │
│ • Automated review reminders and mastery badges                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Collaborative Enterprise Features                                             │
│ • Multi-user team workspaces with shared Architectural Decision Ledgers                │
│ • Automated Markdown ADR export to GitHub / GitLab repositories                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Full-Stack Persistence Implementation Guide

Follow this 5-step workflow to connect frontend state to the PostgreSQL database via contract-first OpenAPI and Drizzle ORM:

### Step 1: Define Endpoints in `lib/api-spec/openapi.yaml`
Add routes for progress and decision ledgers to [lib/api-spec/openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml):

```yaml
paths:
  /progress:
    get:
      operationId: getProgress
      summary: Retrieve authenticated user progress
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserProgress"
    post:
      operationId: saveProgress
      summary: Save or update progress for a pattern
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

  /decision-ledger:
    get:
      operationId: getDecisionLedger
      summary: Retrieve session architectural decision records
      responses:
        "200":
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/DecisionRecord"
    post:
      operationId: saveDecisionRecord
      summary: Append a new decision record to the ledger
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/DecisionRecordInput"
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DecisionRecord"

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
    DecisionRecordInput:
      type: object
      required: [problemStatement, primaryPattern, confidence]
      properties:
        problemStatement:
          type: string
        primaryPattern:
          type: string
        runnerUpPattern:
          type: string
        confidence:
          type: integer
        tradeOffs:
          type: array
          items:
            type: string
    DecisionRecord:
      allOf:
        - $ref: "#/components/schemas/DecisionRecordInput"
        - type: object
          required: [id, createdAt]
          properties:
            id:
              type: string
            createdAt:
              type: string
```

---

### Step 2: Regenerate Types & Schemas
Run the code generator script from the root directory:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This automatically compiles:
1. Runtime Zod validators in `lib/api-zod/src/generated/api.ts`.
2. React Query hooks (`useGetProgress`, `useSaveProgress`, `useGetDecisionLedger`, `useSaveDecisionRecord`) in `lib/api-client-react/`.

---

### Step 3: Define Drizzle ORM Schemas in `lib/db/src/schema/`
Create `lib/db/src/schema/progress.ts`:

```typescript
import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const progressTable = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default-user"),
  patternId: text("pattern_id").notNull(),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  box: integer("box").notNull().default(1),
  note: text("note").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const decisionLedgerTable = pgTable("decision_ledger", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("default-user"),
  problemStatement: text("problem_statement").notNull(),
  primaryPattern: text("primary_pattern").notNull(),
  runnerUpPattern: text("runner_up_pattern"),
  confidence: integer("confidence").notNull(),
  tradeOffs: text("trade_offs").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Push changes to the database:
```bash
pnpm --filter @workspace/db run push
```

---

### Step 4: Implement Route Handlers in `artifacts/api-server`
Create `artifacts/api-server/src/routes/progress.ts`:

```typescript
import { Router } from "express";
import { SaveProgressInput } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { progressTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = SaveProgressInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { patternId, box, attempts, correct, note } = parsed.data;

  const result = await db.insert(progressTable).values({
    patternId,
    box,
    attempts,
    correct,
    note,
  }).onConflictDoUpdate({
    target: progressTable.patternId,
    set: { box, attempts, correct, note, updatedAt: new Date() },
  });

  return res.json({ success: true, data: result });
});

export default router;
```

---

### Step 5: Consume in `pattern-masterclass`
Import and invoke the generated hooks in `App.tsx` or `DecisionEnginePage.tsx`:

```typescript
import { useSaveProgress, useSaveDecisionRecord } from "@workspace/api-client-react";

// Seamless transition from local-first to server-backed sync
const { mutate: syncProgress } = useSaveProgress();
const { mutate: persistLedgerRecord } = useSaveDecisionRecord();
```

---

## 3. Phase 2: Multi-Language Code Playground Sandboxing

### Python (Client-Side Pyodide WASM Worker)
- **Engine**: Pyodide 0.26 compiled to WebAssembly.
- **Benefits**: Zero backend server costs, client-side execution, instant responsiveness.
- **Contract**: Multi-file virtual filesystem mounted in Pyodide memory (`/home/pyodide/`).

### Go (Server-Side Sandboxed Runner)
- **Engine**: Ephemeral Docker container or locked process executing `go run .`.
- **Contract**: All tabs written into an ephemeral directory with `package main` and `go.mod`.

---

## 4. Phase 3 & 4: Simulator Sandboxes & Leitner Quiz Lab

* **Pattern Studio Visualizers**: Replace `WipModulePlaceholder` with interactive SVG/Canvas state machines visualizing object lifecycles in real time.
* **Leitner Spaced Repetition**: Replace `WipModulePlaceholder` with an adaptive 5-box spaced repetition algorithm calculating retention decay and test intervals.
