# System Architecture & Design

This document details the architectural structure of the **GoF Design Patterns Masterclass** monorepo, including module responsibilities, API generation pipelines, and sequence diagrams illustrating runtime behavior.

---

## 1. High-Level System Architecture

The project is structured as a **pnpm monorepo** using modular separation between client applications (`artifacts/`), shared protocol packages (`lib/`), and backend services.

```mermaid
graph TB
    subgraph ClientLayer ["Client Applications (artifacts/)"]
        PMC["pattern-masterclass<br/>(React 19 + Vite + Tailwind CSS)"]
        MSB["mockup-sandbox<br/>(Component Prototyping)"]
    end

    subgraph ProtocolLayer ["Shared Contracts & Libraries (lib/)"]
        ASPEC["api-spec<br/>(openapi.yaml + Orval)"]
        AZOD["api-zod<br/>(Generated Zod Schemas)"]
        ACLI["api-client-react<br/>(Generated React Query Hooks)"]
        DB["db<br/>(Drizzle ORM + PG Pool)"]
    end

    subgraph BackendLayer ["Backend Services (artifacts/)"]
        SRV["api-server<br/>(Node.js / Express 5)"]
    end

    subgraph StorageLayer ["Persistence & Storage"]
        LSTORE[("Browser LocalStorage<br/>(Active Storage)")]
        PGDB[("PostgreSQL Database<br/>(Scaffolded)")]
    end

    %% Client flow
    PMC -.->|"Local progress & notes"| LSTORE
    PMC ==>|"Can consume hooks"| ACLI

    %% Code Gen Flow
    ASPEC -->|"Orval Code Generation"| AZOD
    ASPEC -->|"Orval Code Generation"| ACLI

    %% Backend flow
    SRV -->|"Validates requests with"| AZOD
    SRV -->|"Queries via"| DB
    DB -->|"TCP Pool"| PGDB
    ACLI -.->|"HTTP /api requests"| SRV
```

---

## 2. API Contract & Code Generation Pipeline

The repository utilizes a **Contract-First Architecture** driven by [lib/api-spec/openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml). Frontend and backend never write independent type contracts; both derive strictly from OpenAPI.

```mermaid
flowchart LR
    YAML["openapi.yaml<br/>(OpenAPI 3.1 Spec)"] --> ORVAL["Orval Generator<br/>(orval.config.ts)"]
    
    ORVAL -->|"Generates Zod Schemas"| ZOD["lib/api-zod<br/>(Runtime Validation)"]
    ORVAL -->|"Generates React Query Hooks"| RQ["lib/api-client-react<br/>(customFetch + Hooks)"]
    
    ZOD -->|"Used by"| EXP["Express Routes<br/>(artifacts/api-server)"]
    RQ -->|"Imported by"| REACT["React Components<br/>(pattern-masterclass)"]
```

### Protocol Responsibilities

| Package | Role | Key File |
| :--- | :--- | :--- |
| **`lib/api-spec`** | Single Source of Truth for all API endpoints and models. | [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) |
| **`lib/api-zod`** | Compiles schemas into runtime validators for input/output boundaries. | [src/index.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-zod/src/index.ts) |
| **`lib/api-client-react`** | Exports automated React Query hooks with automatic caching and retry logic. | [src/custom-fetch.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-client-react/src/custom-fetch.ts) |
| **`artifacts/api-server`** | Implements route handlers, middlewares (CORS, Pino logging), and business rules. | [src/app.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/api-server/src/app.ts) |

---

## 3. Sequence Diagram 1: Current Implementation (Client-First Flow)

In the current production build, the learning application executes **completely client-side**. User interaction does not depend on network requests or database availability.

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / User
    participant UI as React UI (App.tsx)
    participant Data as Static Catalog (data.ts)
    participant Store as Browser LocalStorage
    participant FileSys as Local File System (JSON Export)

    User->>UI: Opens Application URL
    UI->>Store: getItem("gof-masterclass-storage")
    alt Saved state exists
        Store-->>UI: Return saved progress, bookmarks & notes
    else First visit
        Store-->>UI: null (Initialize default settings)
    end
    UI->>Data: Load 23 GoF Patterns & Quiz questions
    Data-->>UI: Pattern metadata, diagrams & code snippets
    UI-->>User: Render Dashboard, Catalog & Decision Engine

    User->>UI: Bookmark pattern / Complete scenario quiz
    UI->>UI: Update local state (useState)
    UI->>Store: setItem("gof-masterclass-storage", JSON.stringify(state))
    Store-->>UI: Persisted locally

    opt User clicks "Export Backup"
        User->>UI: Trigger Backup
        UI->>FileSys: Trigger client-side JSON file download
    end
```

---

## 4. Sequence Diagram 2: Full-Stack Flow (Future Server-Backed Architecture)

When server-side persistence and API routes are connected, data flows through the generated Zod validation and Drizzle ORM layers:

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner / User
    participant UI as React UI (pattern-masterclass)
    participant Client as api-client-react (useSubmitProgress)
    participant Server as api-server (Express Router)
    participant Zod as api-zod (Validation Schema)
    participant ORM as lib/db (Drizzle ORM)
    participant DB as PostgreSQL Database

    User->>UI: Submits Scenario Quiz Answer
    UI->>Client: useSubmitProgress({ patternId, score, notes })
    Client->>Server: POST /api/progress (JSON payload)
    
    Server->>Zod: ProgressSchema.safeParse(req.body)
    alt Invalid Input
        Zod-->>Server: Validation Failure (Issues list)
        Server-->>Client: 400 Bad Request { error }
        Client-->>UI: Render validation alert
    else Valid Input
        Zod-->>Server: Sanitized Typed Payload
        Server->>ORM: db.insert(userProgressTable).values(...)
        ORM->>DB: SQL INSERT / UPSERT via pg.Pool
        DB-->>ORM: SQL Result (Row created/updated)
        ORM-->>Server: Record entity
        Server-->>Client: 200 OK { success: true, updatedProgress }
        Client-->>UI: Invalidate & refetch query cache
        UI-->>User: Display updated progress stats & badge
    end
```

---

## 5. Architectural Quality Attributes

* **Decoupling**: The UI application is independent of the backend implementation. The frontend can run in zero-infrastructure environments (static hosting) or connected to `api-server`.
* **Type Safety from Database to Client**:
  * PostgreSQL Types $\rightarrow$ Drizzle ORM Schema $\rightarrow$ API Spec $\rightarrow$ Zod Validators $\rightarrow$ React Query Hooks $\rightarrow$ React Components.
  * Any contract change in `openapi.yaml` will trigger TypeScript compiler errors during `pnpm run typecheck` across all impacted packages.
* **Fault Tolerance**: If the API server is unavailable, the application can cleanly fallback to browser `localStorage`.
