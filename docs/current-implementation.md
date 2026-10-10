# Current Implementation Details

This document covers the technical implementation of all packages currently running in the repository.

---

## 1. Primary Application: `pattern-masterclass`

The main application located in **[artifacts/pattern-masterclass/](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass)** is a full-featured, client-side educational platform covering all 23 Gang of Four (GoF) design patterns.

### 1.1 State Management & Local Storage Model

The application operates on a **Local-First / Zero-Cloud** model. All user actions (quiz scores, bookmarks, study notes, display scale, theme preferences) are stored in the user's browser using `localStorage`.

* **Storage Key**: `'gof-masterclass-storage'`
* **State Schema ([src/App.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/App.tsx#L12-L30))**:

```typescript
type Progress = {
  attempts: number;     // Number of quiz attempts
  correct: number;      // Successful answers
  bookmarked: boolean;  // Saved for quick reference
  note: string;         // User study notes
  box: number;          // Spaced repetition Leitner box (1 to 5)
};

type Saved = {
  theme: 'light' | 'dark';
  bookmarks: string[];
  progress: Record<string, Progress>;
  mode: string;         // 'typescript' | 'java'
  scale?: 'normal' | 'large' | 'projector';
};
```

* **Backup & Restore**:
  Users can download their learning state as a `.json` backup file or import a saved backup using the native browser File API.

---

### 1.2 Core Modules & Feature Screens

The application UI is managed by [artifacts/pattern-masterclass/src/App.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/App.tsx) and split into five primary views:

| View | Route | Description |
| :--- | :--- | :--- |
| **Pattern Library** | `/` | Grid and list view of all 23 GoF patterns categorized by family (*Creational*, *Structural*, *Behavioral*). Filterable by search terms, complexity, and bookmarks. |
| **Decision Engine** | `/decision-engine` | Interactive diagnostic tree that recommends the best design pattern based on specific architectural trade-offs (e.g., decoupling instantiation vs. managing tree structures). |
| **Code Playground** | `/playground` | Side-by-side code viewer demonstrating TypeScript implementations vs. Java implementations ([src/java-examples.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/java-examples.ts)). |
| **Pattern Studio** | `/simulators` | Interactive sandbox simulations (e.g., executing Strategy swaps, Observer pub/sub broadcasts, or Decorator wrappings). |
| **Scenario Lab** | `/quiz-lab` | Scenario-driven quiz module applying the **Leitner Spaced Repetition** method (Boxes 1–5) to reinforce pattern recognition. |

---

### 1.3 Data Catalog & Architecture Diagrams

* **Static Catalog ([src/data.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/data.ts))**:
  Contains detailed records for all 23 patterns, including:
  * Intent, Problem Statement, Solution, and Real-world Analogy
  * When to Use vs. When to Avoid (Trade-offs)
  * UML relations and participant roles
  * Scenario quiz questions with explanation feedback
* **Diagram Rendering ([src/PatternDiagrams.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/PatternDiagrams.tsx))**:
  Renders interactive UML diagrams and architecture flows using Mermaid and scalable vector layouts.

---

### 1.4 Styling & UI Components

* **CSS & Design System**: Built with **Tailwind CSS v4** ([src/index.css](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/index.css)) featuring customized HSL tokens, dark/light themes, and glassmorphic card effects.
* **Component Library**: Primitive UI controls in [src/components/ui/](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/components/ui) based on `@radix-ui` (Accordion, Dialog, Tabs, Tooltip, Toast notifications, Select).
* **Iconography**: Icons provided by `lucide-react`.

---

## 2. Scaffolding & Shared Infrastructure

The repository includes pre-configured full-stack scaffolding designed for future extension.

### 2.1 Backend Server: `artifacts/api-server`
* **Framework**: Node.js with **Express 5** ([src/app.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/app.ts)).
* **Logging**: Structured JSON logging powered by `pino` and `pino-http`.
* **Middlewares**: Configured with CORS, JSON body parsers, URL-encoded parsers, and custom request serialization.
* **Current Endpoints**:
  * `GET /api/healthz` — Returns `{ "status": "ok" }` for infrastructure health probes.

### 2.2 Database Layer: `lib/db`
* **Driver**: Node Postgres (`pg` module using connection pooling via `new Pool()`).
* **ORM**: **Drizzle ORM** ([src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/index.ts)).
* **Configuration**: [drizzle.config.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/drizzle.config.ts) expects a `DATABASE_URL` environment variable.
* **Current State**: The schema folder ([src/schema/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/db/src/schema/index.ts)) contains boilerplate comments ready for table definitions.

### 2.3 API Spec & Validation: `lib/api-spec` and `lib/api-zod`
* **Specification**: [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) contains the OpenAPI 3.1 declaration.
* **Current Generation**:
  Because only `/healthz` is currently defined in `openapi.yaml`, the auto-generated [lib/api-zod/src/generated/api.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-zod/src/generated/api.ts) currently contains only:
  ```typescript
  export const HealthCheckResponse = zod.object({
    status: zod.string(),
  });
  ```
  *When additional endpoints with request bodies/parameters are added to `openapi.yaml`, Orval will automatically generate the corresponding input validation schemas here.*

### 2.4 UI Mockup Sandbox: `artifacts/mockup-sandbox`
* An isolated Vite + React sandbox used for prototyping components, test layouts, and reviewing UI widgets independently of the main application state.
