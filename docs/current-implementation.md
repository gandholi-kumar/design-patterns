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

### 1.5 SOLID Principles Evaluation & Normalization Standard

Under the **Trade-offs** tab ("WHAT IT SUPPORTS"), the application provides a structured architectural evaluation mapping each pattern against the 5 SOLID principles.

#### Invariants & Normalization Rules:
1. **Guaranteed Impact-First Ordering**: `adheres` (positive indicator) always precedes `trades-off` (warning indicator).
2. **Canonical Acronym Sorting**: Within the same impact tier, principles follow the canonical SOLID acronym order (**S** $\rightarrow$ **O** $\rightarrow$ **L** $\rightarrow$ **I** $\rightarrow$ **D**).
3. **Cardinality**: Every pattern evaluates exactly 2 substantive principles.
4. **Defense-in-Depth Sorting**: Both `PatternDetailPage.tsx` and `PatternDetailSections.tsx` enforce deterministic sorting at render time.

#### Canonical Validation Matrix & Literature Citations:
Grounded in **Refactoring Guru** (*Alexander Shvets*), **Robert C. Martin** (*Agile Software Development*, 2002), and the **Gang of Four** (*Design Patterns*, 1994):

| Pattern | Verified Evaluation | Architectural Justification | Primary Source Citation |
| :--- | :--- | :--- | :--- |
| **Factory Method** | `adheres: SRP`<br>`adheres: OCP` | Product creation logic isolated from business logic; new products added without modifying existing code. | *Refactoring Guru* ("Pros and Cons: SRP, OCP") |
| **Abstract Factory** | `adheres: SRP`<br>`trades-off: OCP` | Isolates suite creation. Adding a new factory variant adheres to OCP, but adding a new product kind violates OCP across all factories. | *GoF* (p. 90: "Supporting new products is difficult"); *Refactoring Guru* |
| **Builder** | `adheres: SRP`<br>`adheres: OCP` | Separates step sequencing and validation from representation; new builder variants added without breaking directors. | *Robert C. Martin* (2002, Ch. 21); *Refactoring Guru* |
| **Prototype** | `adheres: SRP`<br>`adheres: DIP` | Delegates clone construction to the object itself; clients depend on the generic clone abstraction rather than concrete classes. | *GoF* (p. 119: "Hiding concrete product classes"); *Refactoring Guru* |
| **Singleton** | `trades-off: SRP`<br>`trades-off: OCP` | Inherently violates SRP (lifecycle + business logic); violates OCP (hard to subclass, mock, or substitute due to static global access). | *Refactoring Guru* ("Cons: Violates SRP"); *Uncle Bob* (Anti-pattern treatise) |
| **Adapter** | `adheres: SRP`<br>`adheres: OCP` | Separates interface translation from business logic; new adapters introduced without modifying legacy code. | *Refactoring Guru* ("Pros and Cons: SRP, OCP") |
| **Bridge** | `adheres: SRP`<br>`adheres: OCP` | Decouples abstraction and implementation hierarchies independently; both vary without mutual churn. | *GoF* (p. 153); *Refactoring Guru* ("Pros and Cons") |
| **Composite** | `adheres: OCP`<br>`trades-off: ISP` | Open to new tree elements. Transparency vs. safety trade-off: declaring child management on Component violates ISP on Leaf nodes. | *GoF* (p. 167: "Transparency vs Safety"); *Uncle Bob* (2002, ISP Case Studies) |
| **Decorator** | `adheres: SRP`<br>`adheres: OCP` | Divides cross-cutting responsibilities into distinct wrappers; dynamically composes behaviors without altering core class. | *Refactoring Guru* ("Pros and Cons: SRP"); *GoF* (p. 177) |
| **Facade** | `adheres: OCP`<br>`trades-off: SRP` | Shields clients from subsystem churn. Risk of degenerating into a monolithic "God Object" coupled to all classes. | *Refactoring Guru* ("Cons: Can become a god object"); *Uncle Bob* (Clean Architecture) |
| **Flyweight** | `adheres: SRP`<br>`trades-off: OCP` | Separates invariant intrinsic state from contextual extrinsic state. Modifying intrinsic state alters central factory pool. | *GoF* (p. 200: "Run-time costs vs storage"); *Refactoring Guru* |
| **Proxy** | `adheres: SRP`<br>`adheres: OCP` | Separates secondary concerns (lazy loading, caching, auth) from service logic; proxies can be added without modifying target service. | *Refactoring Guru* ("Pros and Cons: SRP, OCP"); *GoF* (p. 210) |
| **Chain of Responsibility** | `adheres: SRP`<br>`adheres: OCP` | Decouples senders from handlers; handlers can be dynamically inserted, removed, or reordered without breaking caller code. | *Refactoring Guru* ("Pros and Cons: SRP, OCP") |
| **Command** | `adheres: SRP`<br>`adheres: OCP` | Decouples invocation from execution; new commands can be introduced without breaking invokers or receivers. | *Refactoring Guru* ("Pros and Cons: SRP, OCP"); *Uncle Bob* (2002, Ch. 22) |
| **Iterator** | `adheres: SRP`<br>`adheres: OCP` | Cleans up collection classes by extracting traversal algorithms; allows new collection types and traversal strategies. | *Refactoring Guru* ("Pros and Cons: SRP, OCP") |
| **Mediator** | `adheres: OCP`<br>`trades-off: SRP` | Introduces new mediator coordinators without altering components. Centralizes multi-party interaction and risks God Object bloat. | *Refactoring Guru* ("Cons: Over time can evolve into a God Object"); *GoF* (p. 276) |
| **Memento** | `adheres: SRP`<br>`adheres: OCP` | Isolates state snapshot storage from Originator logic; Caretakers can implement new retention/undo policies without modifying Originator. | *GoF* (p. 286: "Preserving encapsulation boundaries"); *Refactoring Guru* |
| **Observer** | `adheres: SRP`<br>`adheres: OCP` | Decouples publisher subject state management from subscriber action logic; subscribers listen without altering publisher. | *Refactoring Guru* ("Pros and Cons: OCP"); *Uncle Bob* (2002, Ch. 23) |
| **State** | `adheres: SRP`<br>`adheres: OCP` | Encapsulates state-specific behaviors into dedicated classes; new states introduced without altering existing states or context. | *Refactoring Guru* ("Pros and Cons: SRP, OCP"); *Uncle Bob* (2002, Ch. 29) |
| **Strategy** | `adheres: SRP`<br>`adheres: OCP` | Isolates algorithm implementations from consuming business logic; interchangeable algorithms added without altering context. | *Uncle Bob* (2002, Ch. 22: "Canonical OCP"); *Refactoring Guru* ("Pros and Cons: OCP") |
| **Template Method** | `adheres: SRP`<br>`trades-off: LSP` | Pulls invariant workflow skeletons into superclass. Overriding or suppressing default template hooks risks violating base invariants. | *Refactoring Guru* ("Cons: You might violate LSP by suppressing default step"); *Uncle Bob* (2002, LSP) |
| **Visitor** | `adheres: SRP`<br>`trades-off: OCP` | Consolidates related operations across heterogeneous classes into visitor. Open for new operations, but closed/fragile for new element types. | *GoF* (p. 336: "Adding new ConcreteElement classes is hard"); *Refactoring Guru* |
| **Interpreter** | `adheres: SRP`<br>`adheres: OCP` | Encapsulates each grammar rule in a dedicated expression class; new grammar rules added without breaking expression trees. | *GoF* (p. 245: "Changing and extending grammar"); *Refactoring Guru* |

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
