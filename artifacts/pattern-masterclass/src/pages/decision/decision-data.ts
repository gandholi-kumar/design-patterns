export interface PatternOption {
  id: string;
  name: string;
  category: 'Creational' | 'Structural' | 'Behavioral';
  tagline: string;
}

export interface ProductionScenario {
  id: string;
  title: string;
  category: 'Cloud & Infra' | 'Fintech & Billing' | 'Distributed Systems' | 'UI & Graphics' | 'Developer Tools' | 'Web Architecture' | 'Systems Architecture';
  scenarioNumber: string;
  headline: string;
  systemContext: string;
  architecturalForces: string[];
  primaryPatternId: string;
  primaryPatternName: string;
  confidence: number;
  primaryRationale: string;
  runnerUpPatternId: string;
  runnerUpPatternName: string;
  runnerUpConfidence: number;
  runnerUpRationale: string;
  whenToChooseRunnerUp: string;
  gains: string[];
  taxes: string[];
  antiPatternWarning: string;
}

export interface SiblingDilemma {
  id: string;
  title: string;
  subtitle: string;
  category: 'Behavioral' | 'Structural' | 'Creational';
  patternA: {
    id: string;
    name: string;
    intent: string;
    structure: string;
    coupling: string;
    swappability: string;
    codeSnippet: string;
  };
  patternB: {
    id: string;
    name: string;
    intent: string;
    structure: string;
    coupling: string;
    swappability: string;
    codeSnippet: string;
  };
  decisiveRule: string;
  whenToPickA: string[];
  whenToPickB: string[];
}

export const GOF_PRINCIPLES = [
  {
    num: '01',
    title: 'Encapsulate what varies',
    body: 'Identify the aspects of your application that change and separate them from what stays the same. Isolate the axis of change behind an abstraction so surrounding code remains untouched when requirements evolve.',
  },
  {
    num: '02',
    title: 'Favor object composition over class inheritance',
    body: 'Inheritance exposes subclass internals, creates compile-time locks, and breaks encapsulation across layers. Composition keeps objects focused and enables dynamic runtime behavior swapping.',
  },
  {
    num: '03',
    title: 'Program to an interface, not an implementation',
    body: 'Clients should depend exclusively on abstract contracts or polymorphic interfaces, never on concrete implementation types. This preserves total swappability.',
  },
];

export const RAPID_HEURISTICS = [
  { trigger: 'Creating a single product variant', recommendation: 'Factory Method' },
  { trigger: 'Creating a matched family of compatible products', recommendation: 'Abstract Factory' },
  { trigger: 'Step-by-step construction of complex multi-part objects', recommendation: 'Builder' },
  { trigger: 'Cloning pre-configured templates without costly instantiation', recommendation: 'Prototype' },
  { trigger: 'Reconciling incompatible interfaces between two systems', recommendation: 'Adapter' },
  { trigger: 'Clean, unified entry point to a complex subsystem', recommendation: 'Facade' },
  { trigger: 'Adding responsibilities dynamically without subclass explosion', recommendation: 'Decorator' },
  { trigger: 'Controlling access, lazy loading, caching, or auth guarding', recommendation: 'Proxy' },
  { trigger: 'Decoupling an abstraction from its platform implementation', recommendation: 'Bridge' },
  { trigger: 'Treating individual items and tree groupings uniformly', recommendation: 'Composite' },
  { trigger: 'Sharing fine-grained objects to minimize memory footprint', recommendation: 'Flyweight' },
  { trigger: 'Swapping algorithms or business rules at runtime', recommendation: 'Strategy' },
  { trigger: 'Altering object behavior based on internal lifecycle state', recommendation: 'State' },
  { trigger: 'Broadcasting state change events to decoupled subscribers', recommendation: 'Observer' },
  { trigger: 'Centralizing complex many-to-many communications in a hub', recommendation: 'Mediator' },
  { trigger: 'Encapsulating requests as objects with undo/redo execution', recommendation: 'Command' },
  { trigger: 'Passing a request along a sequence of responsible handlers', recommendation: 'Chain of Responsibility' },
  { trigger: 'Defining invariant skeleton steps with customizable hooks', recommendation: 'Template Method' },
  { trigger: 'Adding operations to a tree hierarchy without altering nodes', recommendation: 'Visitor' },
  { trigger: 'Capturing and restoring internal state without leaking internals', recommendation: 'Memento' },
  { trigger: 'Traversing a collection sequentially without exposing representation', recommendation: 'Iterator' },
  { trigger: 'Evaluating grammar or language sentences in an AST', recommendation: 'Interpreter' },
  { trigger: 'Guaranteeing a strict single instance with global access point', recommendation: 'Singleton' },
];

export const CAUSES_OF_REDESIGN = [
  { key: 'creation', label: 'Creating an object by specifying its class explicitly', hint: 'Hardcodes class names; prevents future variants without modifying caller.' },
  { key: 'algorithm', label: 'Algorithmic dependencies or changing business rules', hint: 'Algorithms embedded inside clients become hard to swap, test, and maintain.' },
  { key: 'platform', label: 'Dependence on hardware or third-party platform software', hint: 'Binds system to specific SDKs or operating systems.' },
  { key: 'operations', label: 'Dependence on specific operations or request handling', hint: 'Hardwires who fulfills a request; prevents undo, queuing, or routing.' },
  { key: 'coupling', label: 'Tight coupling between collaborating objects', hint: 'Changes to one class ripple uncontrollably across collaborators.' },
  { key: 'inheritance', label: 'Extending functionality by subclassing (class explosion)', hint: 'Creating subclasses for every feature combination causes exponential bloat.' },
  { key: 'interface', label: 'Inability to alter classes conveniently or incompatible APIs', hint: 'Legacy code or external libraries cannot be modified directly.' },
  { key: 'state', label: 'Behavior shifts dynamically based on object lifecycle state', hint: 'Monolithic switch/case statements sprawled across methods.' },
];

export interface CauseGoFMeta {
  families: ('Creational' | 'Structural' | 'Behavioral')[];
  canonicalPatterns: string[];
  familyBadge?: string;
}

export const CAUSE_GOF_MAPPING: Record<string, CauseGoFMeta> = {
  creation: {
    families: ['Creational'],
    canonicalPatterns: ['abstract-factory', 'factory-method', 'prototype', 'builder', 'singleton'],
    familyBadge: 'Creational Only',
  },
  operations: {
    families: ['Behavioral'],
    canonicalPatterns: ['chain-of-responsibility', 'command', 'mediator'],
    familyBadge: 'Behavioral Only',
  },
  platform: {
    families: ['Creational', 'Structural'],
    canonicalPatterns: ['bridge', 'abstract-factory', 'adapter'],
    familyBadge: 'Creational & Structural',
  },
  coupling: {
    families: ['Creational', 'Structural', 'Behavioral'],
    canonicalPatterns: ['mediator', 'observer', 'facade', 'abstract-factory', 'bridge', 'chain-of-responsibility', 'command'],
  },
  inheritance: {
    families: ['Structural', 'Behavioral'],
    canonicalPatterns: ['decorator', 'composite', 'strategy', 'bridge', 'observer'],
    familyBadge: 'Structural & Behavioral',
  },
  interface: {
    families: ['Structural', 'Behavioral'],
    canonicalPatterns: ['adapter', 'decorator', 'visitor'],
    familyBadge: 'Structural & Behavioral',
  },
  algorithm: {
    families: ['Creational', 'Behavioral'],
    canonicalPatterns: ['strategy', 'template-method', 'visitor', 'builder', 'iterator'],
    familyBadge: 'Creational & Behavioral',
  },
  state: {
    families: ['Behavioral'],
    canonicalPatterns: ['state', 'strategy'],
    familyBadge: 'Behavioral Only',
  },
};

export const ENGINEERING_CONSTRAINTS = [
  { key: 'avoid-subclasses', label: 'Avoid sprawling inheritance / class explosion' },
  { key: 'preserve-api', label: 'Preserve existing client interfaces without refactoring callers' },
  { key: 'runtime-swap', label: 'Allow behavior or implementations to be swapped live at runtime' },
  { key: 'undo-history', label: 'Require undo/redo transaction logging and command replay' },
  { key: 'tree-hierarchy', label: 'Treat leaf nodes and branch containers with uniform syntax' },
  { key: 'memory-footprint', label: 'Minimize memory footprint across thousands of lightweight instances' },
  { key: 'encapsulate-state', label: 'Restore checkpoints without violating private encapsulation' },
  { key: 'pipeline-handlers', label: 'Allow individual handlers in a pipeline to stop or pass requests' },
];

export const PRODUCTION_SCENARIOS: ProductionScenario[] = [
  {
    id: 'sc-01',
    scenarioNumber: '01',
    title: 'Multi-Cloud Infrastructure Provisioner',
    category: 'Cloud & Infra',
    headline: 'Consistent orchestration across AWS, Azure, and Google Cloud',
    systemContext: 'A DevOps platform needs to spin up matched suites of cloud resources (VPC, VM Instance, Object Storage, Routing Table) across AWS, Azure, and GCP. A cluster provisioned on AWS must never mix an Azure VNet with an AWS EC2 instance.',
    architecturalForces: [
      'Resources must belong to a strictly coordinated family per cloud provider.',
      'Caller orchestrator must remain 100% agnostic of cloud provider SDKs.',
      'Adding a new provider (e.g. Oracle Cloud) must not require modifying deployment pipelines.',
    ],
    primaryPatternId: 'abstract-factory',
    primaryPatternName: 'Abstract Factory',
    confidence: 96,
    primaryRationale: 'Abstract Factory creates families of related or dependent objects (VPC, VM, Storage) without specifying their concrete classes, guaranteeing that all resources in a provisioned cluster are mutually compatible.',
    runnerUpPatternId: 'builder',
    runnerUpPatternName: 'Builder',
    runnerUpConfidence: 81,
    runnerUpRationale: 'Builder could assemble the complex cluster step-by-step, but does not inherently enforce cloud family compatibility at the factory boundary.',
    whenToChooseRunnerUp: 'Choose Builder instead if your cloud clusters have dozens of optional configuration steps and parameter flags, rather than matched cross-provider suites.',
    gains: ['Guarantees family consistency across cloud providers', 'Complies with Open/Closed Principle', 'Isolates concrete provider SDK imports'],
    taxes: ['Adding a new resource type (e.g. KubernetesCluster) requires changing the abstract factory interface across all providers'],
    antiPatternWarning: 'Avoid creating a single mega-factory with switch(provider) inside every method; use polymorphic subclass factories.',
  },
  {
    id: 'sc-02',
    scenarioNumber: '02',
    title: 'Dynamic E-Commerce Pricing & Discount Matrix',
    category: 'Fintech & Billing',
    headline: 'Swapping pricing algorithms based on customer tier, region, and promotional events',
    systemContext: 'A global checkout engine calculates cart totals using various algorithms: Black Friday Tiered Discount, VIP Loyalty Points, Bulk Wholesale Volume, or Geographic Currency Surcharges. Algorithms change weekly and must be tested in total isolation.',
    architecturalForces: [
      'Pricing calculation algorithms change frequently and independently of the shopping cart.',
      'Cart checkout code must avoid nested switch/if-else ladders based on promotion codes.',
      'New seasonal pricing rules must be deployable with zero regression risk to existing algorithms.',
    ],
    primaryPatternId: 'strategy',
    primaryPatternName: 'Strategy',
    confidence: 95,
    primaryRationale: 'Strategy encapsulates each pricing algorithm into separate classes behind a unified IPricingStrategy interface, enabling the cart context to swap calculation rules at runtime without modifying checkout code.',
    runnerUpPatternId: 'state',
    runnerUpPatternName: 'State',
    runnerUpConfidence: 74,
    runnerUpRationale: 'State shares the same polymorphic class diagram as Strategy, but State represents autonomous lifecycle stages rather than externally selected algorithmic formulas.',
    whenToChooseRunnerUp: 'Choose State instead if the cart autonomously transitions between stages (e.g. Active -> Expired -> CheckedOut) where legal actions change per stage.',
    gains: ['Eliminates monolithic conditional branching', 'Enables isolated unit testing per formula', 'Honors Open/Closed Principle'],
    taxes: ['Clients must be aware of strategies to choose the right one; increases total class count'],
    antiPatternWarning: 'Do not use Strategy if you only have two static calculation formulas that will never change (YAGNI).',
  },
  {
    id: 'sc-03',
    scenarioNumber: '03',
    title: 'Legacy SOAP Banking Core to Modern REST API',
    category: 'Fintech & Billing',
    headline: 'Bridging modern mobile apps with an immutable XML banking mainframe',
    systemContext: 'A neo-bank mobile application expects modern async JSON REST interfaces (`transferFunds(accountId, amount, currency)`), but the underlying core banking mainframe is an immutable 20-year-old COBOL/SOAP service requiring XML envelope schemas and synchronous session tokens.',
    architecturalForces: [
      'The legacy banking interface cannot be modified or recompiled.',
      'Modern client services must not be contaminated with SOAP/XML protocol details.',
      'The target interface expected by clients differs significantly from the legacy provider interface.',
    ],
    primaryPatternId: 'adapter',
    primaryPatternName: 'Adapter',
    confidence: 94,
    primaryRationale: 'Adapter converts the incompatible SOAP XML interface of the legacy banking core into the clean JSON domain interface expected by modern clients, allowing systems to collaborate without modifying existing code.',
    runnerUpPatternId: 'facade',
    runnerUpPatternName: 'Facade',
    runnerUpConfidence: 79,
    runnerUpRationale: 'Facade also wraps a subsystem, but Facade defines a new, simplified interface for convenience, whereas Adapter converts an existing incompatible interface to match a specific target contract.',
    whenToChooseRunnerUp: 'Choose Facade instead if you are orchestrating multiple internal banking microservices (KYC, Ledger, Fraud, SMS) into a single unified front door.',
    gains: ['Protects modern domain models from legacy protocol pollution', 'Enables mock testing of the target interface', 'Requires zero mainframe alterations'],
    taxes: ['Adds an extra layer of indirection and data translation overhead'],
    antiPatternWarning: 'Avoid adding business logic or orchestrating other services inside the Adapter; keep it strictly focused on interface translation.',
  },
  {
    id: 'sc-04',
    scenarioNumber: '04',
    title: 'High-Throughput HTTP Middleware Pipeline',
    category: 'Web Architecture',
    headline: 'Sequential request authentication, rate limiting, and schema validation',
    systemContext: 'An API Gateway processes incoming HTTP requests through a sequence of checks: JWT Authentication, IP Rate Limiter, Payload Schema Validator, and Audit Logging. Any step must be capable of rejecting the request and short-circuiting the pipeline immediately.',
    architecturalForces: [
      'Multiple independent handlers must inspect the incoming request in a configurable order.',
      'Each handler must be able to terminate the pipeline (e.g. 401 Unauthorized) without invoking subsequent steps.',
      'The caller must not need to know which specific handler eventually fulfills or rejects the request.',
    ],
    primaryPatternId: 'chain-of-responsibility',
    primaryPatternName: 'Chain of Responsibility',
    confidence: 97,
    primaryRationale: 'Chain of Responsibility passes a request along a dynamic chain of handlers. Upon receiving a request, each handler either processes it and passes it to the next link, or drops/rejects the request entirely.',
    runnerUpPatternId: 'decorator',
    runnerUpPatternName: 'Decorator',
    runnerUpConfidence: 77,
    runnerUpRationale: 'Decorator also wraps execution in layers, but Decorators enhance and add responsibilities to an object rather than acting as a sequential decision/rejection pipeline.',
    whenToChooseRunnerUp: 'Choose Decorator instead if you need to wrap the response stream with gzip compression, caching headers, or encryption, where all layers must always execute.',
    gains: ['Decouples request senders from specific handlers', 'Pipelines are configurable at runtime', 'Single Responsibility Principle per link'],
    taxes: ['A request can fall off the end of the chain unhandled if no default terminal handler is configured'],
    antiPatternWarning: 'Ensure circular references are impossible when linking handler chains.',
  },
  {
    id: 'sc-05',
    scenarioNumber: '05',
    title: 'Complex SQL / MongoDB Query Builder',
    category: 'Developer Tools',
    headline: 'Step-by-step construction of complex database query objects',
    systemContext: 'A database ORM needs to construct intricate SQL queries with optional JOINs, WHERE filters, GROUP BY clauses, and pagination. Constructing this via a telescoping constructor with 15 arguments causes unreadable, bug-prone code.',
    architecturalForces: [
      'The query object consists of many optional components constructed in varying orders.',
      'Constructors with dozens of optional parameters (telescoping constructors) must be avoided.',
      'The same construction process must be able to create SQL queries or MongoDB aggregation pipelines.',
    ],
    primaryPatternId: 'builder',
    primaryPatternName: 'Builder',
    confidence: 95,
    primaryRationale: 'Builder separates the step-by-step construction of a complex object from its internal representation, allowing fluent method chaining (`.select().where().limit()`) to produce varying representations.',
    runnerUpPatternId: 'factory-method',
    runnerUpPatternName: 'Factory Method',
    runnerUpConfidence: 70,
    runnerUpRationale: 'Factory Method creates objects in a single method call, which is unsuitable when objects require dozens of configurable assembly steps.',
    whenToChooseRunnerUp: 'Choose Factory Method if queries are pre-defined, standardized, and instantiated in a single step rather than built dynamically.',
    gains: ['Eliminates telescoping constructors', 'Fluent and readable API chaining', 'Ensures constructed queries are validated before execution'],
    taxes: ['Increases codebase size by requiring dedicated Builder classes for each complex product'],
    antiPatternWarning: 'Do not use Builder for simple objects with only 2 or 3 mandatory fields.',
  },
  {
    id: 'sc-06',
    scenarioNumber: '06',
    title: 'Distributed Order Lifecycle Management',
    category: 'Distributed Systems',
    headline: 'State-driven transitions: Pending → Paid → Packed → Shipped → Delivered',
    systemContext: 'An enterprise logistics platform manages order lifecycles. Legal actions differ completely per stage: you can cancel an order in `Pending`, but cancelling a `Shipped` order is illegal. Sprawling `switch(order.status)` statements pollute every service method.',
    architecturalForces: [
      'Order behavior and allowable actions change drastically depending on its lifecycle stage.',
      'Branching conditional statements (`if status == PENDING`) are duplicated across dozens of methods.',
      'State transitions and validation must be managed cleanly without polluting the main Order aggregate.',
    ],
    primaryPatternId: 'state',
    primaryPatternName: 'State',
    confidence: 96,
    primaryRationale: 'State allows an Order object to alter its behavior when its internal lifecycle state changes. Each state is encapsulated in a dedicated class (`PendingState`, `ShippedState`), making illegal transitions impossible and eliminating switch statements.',
    runnerUpPatternId: 'strategy',
    runnerUpPatternName: 'Strategy',
    runnerUpConfidence: 75,
    runnerUpRationale: 'Strategy and State have identical UML class diagrams, but Strategy represents algorithms injected externally by the client, whereas State models autonomous transitions triggered internally.',
    whenToChooseRunnerUp: 'Choose Strategy instead if the caller decides which algorithm to execute (e.g. Choose Shipping Carrier: FedEx vs DHL), rather than an internal lifecycle progression.',
    gains: ['Eliminates monolithic state-checking conditionals', 'New states can be added without altering existing ones', 'Transitions are self-contained and explicit'],
    taxes: ['Can be overkill if the state machine only has 2 states that never transition or evolve'],
    antiPatternWarning: 'Ensure states do not hold shared mutable data that creates hidden race conditions.',
  },
  {
    id: 'sc-07',
    scenarioNumber: '07',
    title: 'Microservices Event Bus & Notification Hub',
    category: 'Distributed Systems',
    headline: 'Decoupled one-to-many publish-subscribe event notification',
    systemContext: 'When a customer places an order, multiple independent subsystems must react: the Inventory Service reserves stock, the Email Service sends a receipt, the Analytics Pipeline logs a metrics event, and the Fraud Detector scores the transaction.',
    architecturalForces: [
      'The Order Service should publish an event without knowing who listens to it.',
      'Subscribers must be able to register and unregister dynamically at runtime.',
      'Adding a new subscriber (e.g. SMS Service) must require zero code changes to the Order Service.',
    ],
    primaryPatternId: 'observer',
    primaryPatternName: 'Observer',
    confidence: 96,
    primaryRationale: 'Observer defines a one-to-many dependency between objects so that when the subject publishes a state change, all registered observers are notified and updated automatically without tight coupling.',
    runnerUpPatternId: 'mediator',
    runnerUpPatternName: 'Mediator',
    runnerUpConfidence: 78,
    runnerUpRationale: 'Mediator also decouples objects, but Mediator coordinates many-to-many interactions through a centralized hub, whereas Observer is strictly one-to-many broadcast.',
    whenToChooseRunnerUp: 'Choose Mediator instead if subscribers need to communicate back and forth with each other through a coordinator (e.g. complex form dialog field interdependencies).',
    gains: ['Loose coupling between publisher and subscribers', 'Supports open-ended broadcast listeners', 'Honors Open/Closed Principle'],
    taxes: ['Subscribers are notified in arbitrary order; dangling listeners can cause memory leaks if not unsubscribed'],
    antiPatternWarning: 'Always provide unsubscription / cleanup handlers to avoid zombie listener memory leaks.',
  },
  {
    id: 'sc-08',
    scenarioNumber: '08',
    title: 'Collaborative Canvas Vector Scene Graph',
    category: 'UI & Graphics',
    headline: 'Treating primitive geometric shapes and grouped containers uniformly',
    systemContext: 'A Figma-like collaborative design tool renders vector scene graphs composed of primitives (Rectangles, Text, Circles) and nested Groups (which contain other shapes and groups). The rendering engine needs to execute `.draw()`, `.move()`, and `.scale()` without checking object types.',
    architecturalForces: [
      'The UI consists of a tree structure of nested part-whole hierarchies.',
      'Clients must treat individual shapes and groups of shapes uniformly with identical method calls.',
      'Recursive calculations (e.g. bounding boxes) must be executed seamlessly across deep trees.',
    ],
    primaryPatternId: 'composite',
    primaryPatternName: 'Composite',
    confidence: 97,
    primaryRationale: 'Composite composes objects into tree structures to represent part-whole hierarchies, allowing clients to treat individual objects (`Leaf`) and compositions of objects (`Composite`) uniformly.',
    runnerUpPatternId: 'decorator',
    runnerUpPatternName: 'Decorator',
    runnerUpConfidence: 72,
    runnerUpRationale: 'Decorator and Composite share recursive composition, but Decorator adds responsibilities to a single child, whereas Composite manages many children in a tree structure.',
    whenToChooseRunnerUp: 'Choose Decorator instead if you need to wrap a single canvas element with a DropShadow or Border without tree hierarchy.',
    gains: ['Simplifies client code by eliminating type checking', 'Easily accommodates new component types', 'Recursive operations handled naturally'],
    taxes: ['Can make the design overly general; hard to restrict which components can be children of specific composites'],
    antiPatternWarning: 'Do not expose collection mutation methods on Leaf nodes where they are illegal.',
  },
  {
    id: 'sc-09',
    scenarioNumber: '09',
    title: 'LLM Gateway & Database Connection Pool with Caching',
    category: 'Cloud & Infra',
    headline: 'Controlling access, lazy initialization, and response caching',
    systemContext: 'An AI API gateway manages calls to expensive LLM models and high-cost vector databases. The service needs to intercept calls to check authorization, enforce rate limits, cache identical prompt responses in Redis, and instantiate heavy clients lazily on first use.',
    architecturalForces: [
      'Access to the underlying heavy service must be intercepted and controlled.',
      'Caching and lazy initialization must happen transparently without clients knowing.',
      'The surrogate must present the exact same interface as the real service.',
    ],
    primaryPatternId: 'proxy',
    primaryPatternName: 'Proxy',
    confidence: 95,
    primaryRationale: 'Proxy provides a surrogate or placeholder for another object to control access to it, enabling transparent caching, lazy initialization, access control, and telemetry logging.',
    runnerUpPatternId: 'decorator',
    runnerUpPatternName: 'Decorator',
    runnerUpConfidence: 78,
    runnerUpRationale: 'Proxy and Decorator have similar structural wrappers, but Proxy manages the lifecycle and controls access to its subject, while Decorator enhances functionality.',
    whenToChooseRunnerUp: 'Choose Decorator instead if the caller dynamically composes multiple orthogonal features (e.g. Logger + Metrics + Gzip) created externally by the client.',
    gains: ['Controls heavy resource lifecycle without client awareness', 'Transparent security and caching', 'Open/Closed principle compliance'],
    taxes: ['Introduces an extra network or memory indirection layer; response latency if proxy logic is heavy'],
    antiPatternWarning: 'A Proxy should never alter the fundamental contract or semantics of the wrapped service.',
  },
  {
    id: 'sc-10',
    scenarioNumber: '10',
    title: 'Enterprise Payment Gateway Orchestration Facade',
    category: 'Fintech & Billing',
    headline: 'Hiding multi-subsystem orchestration behind a clean unified API',
    systemContext: 'Completing a checkout requires coordinating 6 distinct enterprise subsystems: CustomerVerification, FraudDetection, CurrencyConverter, TaxCalculator, PaymentGateway, and LedgerAudit. Exposing these 6 subsystems to frontend controllers creates massive coupling.',
    architecturalForces: [
      'Clients need a simple, single-method entry point (`checkout(cart, user)`) to execute complex multi-subsystem workflows.',
      'Direct coupling to 6 internal subsystems must be eliminated.',
      'Advanced clients should still be able to access underlying subsystems directly if needed.',
    ],
    primaryPatternId: 'facade',
    primaryPatternName: 'Facade',
    confidence: 95,
    primaryRationale: 'Facade provides a unified, higher-level interface to a set of interfaces in a subsystem, making the subsystem easier to use without hiding or locking out advanced capabilities.',
    runnerUpPatternId: 'adapter',
    runnerUpPatternName: 'Adapter',
    runnerUpConfidence: 74,
    runnerUpRationale: 'Adapter makes two incompatible interfaces work together, whereas Facade creates a brand-new simplified interface over an entire complex subsystem.',
    whenToChooseRunnerUp: 'Choose Adapter instead if you have a single existing class whose interface does not match what your client expects.',
    gains: ['Shields clients from subsystem complexity', 'Promotes weak coupling between subsystems and clients', 'Reduces cognitive load for developers'],
    taxes: ['A Facade can risk becoming a "God Object" if too much orchestration logic is packed into it'],
    antiPatternWarning: 'Do not prevent clients from accessing raw subsystems when they legitimately require low-level control.',
  },
  {
    id: 'sc-11',
    scenarioNumber: '11',
    title: 'Multi-Tenant Microservice Sandbox Workspace Cloning',
    category: 'Cloud & Infra',
    headline: 'Cloning complex pre-configured template workspaces without deep reconstruction',
    systemContext: 'A cloud IDE platform provisions developer workspaces containing pre-installed compilers, environment variables, network bridges, and file trees. Building each workspace from scratch takes 45 seconds; cloning an existing in-memory master template snapshot takes 20 milliseconds.',
    architecturalForces: [
      'Workspace instantiation from scratch is computationally expensive and slow.',
      'Instances must be created by duplicating existing prototypes.',
      'The client code should not depend on concrete workspace configuration classes.',
    ],
    primaryPatternId: 'prototype',
    primaryPatternName: 'Prototype',
    confidence: 94,
    primaryRationale: 'Prototype specifies the kind of objects to create using a prototypical instance, and creates new objects by copying this prototype, bypassing costly re-initialization.',
    runnerUpPatternId: 'factory-method',
    runnerUpPatternName: 'Factory Method',
    runnerUpConfidence: 68,
    runnerUpRationale: 'Factory Method instantiates fresh objects from scratch via subclasses, incurring full setup cost every time.',
    whenToChooseRunnerUp: 'Choose Factory Method if object creation is cheap and objects differ primarily in class type rather than complex runtime configuration.',
    gains: ['Radical performance speedup for expensive objects', 'Simplifies adding/removing products at runtime', 'Reduces subclassing needs'],
    taxes: ['Deep copying complex objects with circular references can be challenging to implement correctly in JavaScript/TypeScript'],
    antiPatternWarning: 'Beware shallow copies that inadvertently share mutable state between cloned instances.',
  },
  {
    id: 'sc-12',
    scenarioNumber: '12',
    title: 'Code Editor Multi-Step Command Buffer & Undo/Redo',
    category: 'Developer Tools',
    headline: 'Encapsulating editor operations as reversible command objects',
    systemContext: 'A Monaco-based code editor requires reversible actions: typing text, deleting blocks, formatting code, and multi-cursor replacements. The system must support an unbounded undo/redo history stack, action replay, and keyboard macro recording.',
    architecturalForces: [
      'Operations must be represented as first-class objects so they can be queued, logged, and undone.',
      'The invoker (keyboard shortcut handler) must be completely decoupled from the receiver (document buffer).',
      'Each operation must know how to execute and reverse (`undo()`) its changes.',
    ],
    primaryPatternId: 'command',
    primaryPatternName: 'Command',
    confidence: 97,
    primaryRationale: 'Command encapsulates a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations with an undo stack.',
    runnerUpPatternId: 'memento',
    runnerUpPatternName: 'Memento',
    runnerUpConfidence: 80,
    runnerUpRationale: 'Memento captures internal state snapshots, but Command stores the reversible operation itself (saving memory compared to full document snapshots).',
    whenToChooseRunnerUp: 'Choose Memento instead if operations are non-deterministic or destructive, making mathematical reversal impossible without restoring raw state.',
    gains: ['Clean separation of invoker and receiver', 'Enables easy undo/redo stacks and macro recording', 'New commands added without touching editor core'],
    taxes: ['Increases number of classes as every user action becomes a dedicated Command class'],
    antiPatternWarning: 'Ensure Commands hold only the minimal delta required to execute and reverse, not entire redundant document clones.',
  },
  {
    id: 'sc-13',
    scenarioNumber: '13',
    title: 'Financial Ledger Transaction Checkpoint & Rollback',
    category: 'Fintech & Billing',
    headline: 'Capturing and restoring balance states without violating encapsulation',
    systemContext: 'A double-entry financial ledger executes multi-stage settlement batches. If any stage fails mid-flight, the account balances and transaction journals must be rolled back to an exact pre-batch snapshot without exposing private balances or internal ledger pointers to external custodians.',
    architecturalForces: [
      'A snapshot of the internal state must be saved to allow restoration after a failure.',
      'The internal state and private fields of the ledger must NOT be exposed to external classes.',
      'The caretaker (transaction manager) should store checkpoints without knowing how to inspect their contents.',
    ],
    primaryPatternId: 'memento',
    primaryPatternName: 'Memento',
    confidence: 96,
    primaryRationale: 'Memento captures and externalizes an object\'s internal state without violating encapsulation, so that the object can be restored to this state later by a caretaker.',
    runnerUpPatternId: 'command',
    runnerUpPatternName: 'Command',
    runnerUpConfidence: 79,
    runnerUpRationale: 'Command can reverse actions if every step has an inverse, but complex financial calculations with external rounding or market rates are safer restored via exact state snapshots.',
    whenToChooseRunnerUp: 'Choose Command instead if state snapshots are huge and operations are purely arithmetic and easily inverted (`undo()`).',
    gains: ['Preserves encapsulation boundaries', 'Simplifies originator by keeping snapshot storage external', 'Guarantees reliable rollbacks'],
    taxes: ['Can consume substantial memory if full snapshots are saved frequently without pruning'],
    antiPatternWarning: 'Implement strict caretaker pruning or diff-based mementos to avoid out-of-memory errors on heavy transaction streams.',
  },
  {
    id: 'sc-14',
    scenarioNumber: '14',
    title: 'Air Traffic Control / Chat Room Orchestrator',
    category: 'Distributed Systems',
    headline: 'Decoupling complex many-to-many communication into a central hub',
    systemContext: 'In a real-time collaborative workspace, 8 widgets (UserList, ChatBox, ScreenShare, AudioMixer, Whiteboard, Permissions, StatusBadge, NetworkMonitor) interact. When a user mutes audio, the badge updates, the mixer toggles, and the network adjusts bitrate. Having widgets call each other directly creates an unmaintainable $O(n^2)$ spaghetti network.',
    architecturalForces: [
      'A set of objects communicate in well-defined but complex ways, resulting in unstructured dependencies.',
      'Reusing individual components is difficult because they are tightly coupled to numerous peers.',
      'Communication protocols between participants should be centralized and customizable in one place.',
    ],
    primaryPatternId: 'mediator',
    primaryPatternName: 'Mediator',
    confidence: 96,
    primaryRationale: 'Mediator defines an object that encapsulates how a set of objects interact, promoting loose coupling by keeping objects from referring to each other explicitly and letting you vary their interaction independently.',
    runnerUpPatternId: 'observer',
    runnerUpPatternName: 'Observer',
    runnerUpConfidence: 78,
    runnerUpRationale: 'Observer broadcasts events blindly from 1 subject to N observers, whereas Mediator contains the coordination and business routing logic between many peers.',
    whenToChooseRunnerUp: 'Choose Observer instead if the publisher doesn\'t care who is listening and no bidirectional coordination logic is required.',
    gains: ['Reduces coupling from O(N^2) to O(N)', 'Centralizes complex interaction protocols in one class', 'Individual widgets become easily reusable'],
    taxes: ['The Mediator class can become monolithic and overly complex if not carefully structured'],
    antiPatternWarning: 'Avoid placing UI rendering code inside the Mediator; keep it strictly focused on event mediation between colleagues.',
  },
  {
    id: 'sc-15',
    scenarioNumber: '15',
    title: 'Cross-Platform 2D/3D Rendering Engine',
    category: 'Systems Architecture',
    headline: 'Decoupling an abstraction hierarchy from an independent implementation hierarchy',
    systemContext: 'A graphics engine provides high-level geometric abstractions (`Circle`, `Polygon`, `Mesh`, `ParticleSystem`) that must render across multiple graphics APIs (`DirectX12`, `Vulkan`, `Metal`, `WebGL`). Creating a subclass for every combination (`VulkanCircle`, `MetalPolygon`) creates an unmanageable Cartesian product explosion.',
    architecturalForces: [
      'Both the abstraction (Geometry Shapes) and implementation (Graphics APIs) must vary independently.',
      'A permanent binding between an abstraction and its implementation must be avoided.',
      'Changes in the implementation of an abstraction should have zero impact on client code.',
    ],
    primaryPatternId: 'bridge',
    primaryPatternName: 'Bridge',
    confidence: 97,
    primaryRationale: 'Bridge decouples an abstraction from its implementation so that the two can vary independently, eliminating Cartesian subclass explosion and allowing runtime implementation switching.',
    runnerUpPatternId: 'adapter',
    runnerUpPatternName: 'Adapter',
    runnerUpConfidence: 72,
    runnerUpRationale: 'Adapter makes unrelated classes work together after they\'re designed, whereas Bridge is designed upfront to let abstractions and implementations evolve separately.',
    whenToChooseRunnerUp: 'Choose Adapter if you have an existing third-party graphics library that was already written and just needs interface harmonization.',
    gains: ['Eliminates combinatorial subclass explosion', 'Allows runtime switching of graphics pipelines', 'Hides implementation details completely from client code'],
    taxes: ['Increases upfront architectural complexity; requires decomposing classes along two orthogonal axes'],
    antiPatternWarning: 'Do not use Bridge unless you genuinely have two independent dimensions of variation.',
  },
  {
    id: 'sc-16',
    scenarioNumber: '16',
    title: 'AST Code Linter & Security Inspection Engine',
    category: 'Developer Tools',
    headline: 'Adding operations to an AST hierarchy without modifying node classes',
    systemContext: 'A TypeScript compiler AST contains 40 distinct node types (`BinaryExpression`, `FunctionDeclaration`, `VariableStatement`, etc.). Multiple tools need to analyze this tree: TypeChecker, Linter, SecurityVulnerabilityScanner, and PrettyPrinter. Modifying 40 AST node classes every time a new lint rule is invented causes code chaos.',
    architecturalForces: [
      'An object structure contains many classes of objects with differing interfaces, and you want to perform operations on these objects that depend on their concrete classes.',
      'Many distinct and unrelated operations need to be performed on node objects without polluting their classes.',
      'The AST node structure classes change rarely, but new operations are added frequently.',
    ],
    primaryPatternId: 'visitor',
    primaryPatternName: 'Visitor',
    confidence: 97,
    primaryRationale: 'Visitor represents an operation to be performed on elements of an object structure, letting you define a new operation without changing the classes of the elements on which it operates.',
    runnerUpPatternId: 'composite',
    runnerUpPatternName: 'Composite',
    runnerUpConfidence: 76,
    runnerUpRationale: 'Composite defines the tree structure of the AST, but Visitor defines the external operations traversed across that tree without modifying node definitions.',
    whenToChooseRunnerUp: 'Choose Composite alone if you only need standard tree operations (`draw()`, `evaluate()`) that rarely change, without external analyzers.',
    gains: ['Makes adding new inspections and operations easy', 'Gathers related operations together into single visitor classes', 'Preserves clean node contracts'],
    taxes: ['Adding a new concrete node class to the AST is difficult because it requires updating the visitor interface across all visitors'],
    antiPatternWarning: 'Do not use Visitor if the node hierarchy changes frequently, as every new node type breaks the Visitor interface.',
  },
];

export const SIBLING_DILEMMAS: SiblingDilemma[] = [
  {
    id: 'strategy-vs-state',
    title: 'Strategy vs. State',
    subtitle: 'Interchangeable Algorithms vs. Autonomous Lifecycle Transitions',
    category: 'Behavioral',
    patternA: {
      id: 'strategy',
      name: 'Strategy Pattern',
      intent: 'Encapsulates interchangeable algorithms behind a contract; the caller decides which algorithm to execute based on context.',
      structure: 'Context has-a Strategy. Strategy classes are completely unaware of each other.',
      coupling: 'Strategies do not know about other strategies or the caller context.',
      swappability: 'Injected externally by the client during construction or via setter.',
      codeSnippet: `// STRATEGY: Algorithm chosen externally by client
interface PaymentStrategy {
  pay(amount: number): Promise<Receipt>;
}

class StripeStrategy implements PaymentStrategy { ... }
class PayPalStrategy implements PaymentStrategy { ... }

// Client decides which strategy to inject:
const checkout = new Checkout(new StripeStrategy());`,
    },
    patternB: {
      id: 'state',
      name: 'State Pattern',
      intent: 'Allows an object to alter its behavior when internal lifecycle changes; states autonomously transition the context to the next state.',
      structure: 'Context has-a State. State classes hold a back-reference to Context and trigger transitions.',
      coupling: 'State classes know about other states to perform state transitions.',
      swappability: 'Transitions occur automatically from within based on internal events.',
      codeSnippet: `// STATE: Autonomous transitions managed internally
interface OrderState {
  next(order: Order): void;
  cancel(order: Order): void;
}

class PendingState implements OrderState {
  next(order: Order) {
    // State transitions Context to the next state!
    order.setState(new PaidState());
  }
}`,
    },
    decisiveRule: 'Choose Strategy if the caller chooses the algorithm externally. Choose State if transitions happen autonomously from within based on lifecycle progression.',
    whenToPickA: [
      'Different business rules apply based on caller parameters (e.g. shipping calculation: Fast vs Cheap).',
      'Algorithms are independent and have zero knowledge of one another.',
      'The client controls when and which strategy is bound.',
    ],
    whenToPickB: [
      'The object acts like a state machine (Pending -> Paid -> Shipped).',
      'The legal actions change drastically depending on the current stage.',
      'State classes actively transition the context object to successor states.',
    ],
  },
  {
    id: 'decorator-vs-proxy',
    title: 'Decorator vs. Proxy',
    subtitle: 'Dynamic Capability Enhancement vs. Transparent Access Control',
    category: 'Structural',
    patternA: {
      id: 'decorator',
      name: 'Decorator Pattern',
      intent: 'Attaches additional responsibilities and capabilities to an object dynamically, providing a flexible alternative to subclassing.',
      structure: 'Wraps an existing object passed from the outside; decorators can be stacked recursively in arbitrary combinations.',
      coupling: 'Client creates the inner object and wraps it with N decorators.',
      swappability: 'Composed externally at runtime by the client.',
      codeSnippet: `// DECORATOR: Enhances behavior (stacked dynamically)
let stream: Stream = new FileStream("data.bin");
stream = new GzipDecorator(stream);
stream = new EncryptionDecorator(stream);
stream.write(buffer); // Writes encrypted + compressed`,
    },
    patternB: {
      id: 'proxy',
      name: 'Proxy Pattern',
      intent: 'Provides a surrogate or placeholder for another object to control access to it, manage its lifecycle, or cache results.',
      structure: 'Controls access to a subject. Often instantiates the real subject itself (lazy initialization) or guards it.',
      coupling: 'Proxy manages the subject lifecycle; client is often unaware a proxy is even involved.',
      swappability: 'Fixed 1-to-1 relationship defined upfront.',
      codeSnippet: `// PROXY: Controls access & manages lifecycle transparently
class DatabaseProxy implements Database {
  private realDb?: RealDatabase;

  query(sql: string) {
    if (!this.checkAuth()) throw new Error("403");
    if (!this.realDb) this.realDb = new RealDatabase(); // Lazy!
    return this.cache.get(sql) ?? this.realDb.query(sql);
  }
}`,
    },
    decisiveRule: 'Choose Decorator when you want to add or combine new capabilities to an object. Choose Proxy when you want to control access, lazy-load, cache, or guard an object without altering what it does.',
    whenToPickA: [
      'Clients want to stack multiple optional capabilities (Logging + Caching + Compression).',
      'Capabilities should be composed dynamically in any order.',
      'The goal is adding functionality without subclass explosion.',
    ],
    whenToPickB: [
      'The goal is security guarding, caching, or lazy initialization of heavy resources.',
      'Clients should not be aware that an intermediary exists.',
      'The wrapped object lifecycle is managed by the surrogate.',
    ],
  },
  {
    id: 'factory-method-vs-abstract-factory',
    title: 'Factory Method vs. Abstract Factory',
    subtitle: 'Single Object Inheritance vs. Matched Family Object Composition',
    category: 'Creational',
    patternA: {
      id: 'factory-method',
      name: 'Factory Method Pattern',
      intent: 'Defines an interface for creating a single object, but lets subclasses decide which concrete class to instantiate.',
      structure: 'Uses inheritance. Creator base class defines an abstract method; concrete creators override it.',
      coupling: 'Tied to a class inheritance hierarchy.',
      swappability: 'Subclasses override the creation hook at compile time.',
      codeSnippet: `// FACTORY METHOD: Subclass overrides creation hook
abstract class Dialog {
  abstract createButton(): Button; // Factory method hook!

  render() {
    const btn = this.createButton();
    btn.onClick();
  }
}
class WindowsDialog extends Dialog { createButton() { return new WindowsButton(); } }`,
    },
    patternB: {
      id: 'abstract-factory',
      name: 'Abstract Factory Pattern',
      intent: 'Provides an interface for creating families of related or dependent objects without specifying their concrete classes.',
      structure: 'Uses object composition. A standalone factory object has multiple creation methods (e.g. createButton(), createCheckbox()).',
      coupling: 'Decoupled from callers via a separate factory contract.',
      swappability: 'The entire factory instance is passed in as a dependency.',
      codeSnippet: `// ABSTRACT FACTORY: Creates an entire matched suite
interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class MacFactory implements GUIFactory { ... }
class WinFactory implements GUIFactory { ... }

// Caller gets matched components from the factory:
function buildUI(factory: GUIFactory) {
  const btn = factory.createButton();
  const chk = factory.createCheckbox();
}`,
    },
    decisiveRule: 'Choose Factory Method when you have a creator class that needs a hook to create a single product. Choose Abstract Factory when you need to guarantee that an entire family of products are compatible with each other.',
    whenToPickA: [
      'You are building a framework where clients subclass your class to supply specific product types.',
      'You only need to produce one object variant.',
      'You want to delegate creation through inheritance.',
    ],
    whenToPickB: [
      'Your system must configure suites of multiple compatible products (e.g. Buttons, Checkboxes, Windows).',
      'You want to prevent mixing products from incompatible families (e.g. MacButton with WinCheckbox).',
      'You prefer composition over subclassing.',
    ],
  },
  {
    id: 'adapter-vs-facade-vs-bridge',
    title: 'Adapter vs. Facade vs. Bridge',
    subtitle: 'Interface Translation vs. Simplified Subsystem vs. Two-Dimensional Variation',
    category: 'Structural',
    patternA: {
      id: 'adapter',
      name: 'Adapter Pattern',
      intent: 'Converts the interface of a class into another interface clients expect; makes incompatible interfaces work together.',
      structure: 'Wraps an existing class to match a specific target contract.',
      coupling: 'One-to-one wrapper around an incompatible legacy or third-party object.',
      swappability: 'Retrofits an existing class after the fact.',
      codeSnippet: `// ADAPTER: Reconciles incompatible existing APIs
class RoundHole {
  fits(peg: RoundPeg): boolean { ... }
}
class SquarePegAdapter extends RoundPeg {
  constructor(private sp: SquarePeg) { super(); }
  getRadius() { return (this.sp.width * Math.SQRT2) / 2; }
}`,
    },
    patternB: {
      id: 'facade',
      name: 'Facade Pattern',
      intent: 'Defines a higher-level unified interface that makes a complex subsystem easier to use.',
      structure: 'A single front door that orchestrates multiple subsystem classes behind one convenient API.',
      coupling: 'Coordinates multiple subsystem classes; does not hide them permanently.',
      swappability: 'Simplifies an existing subsystem.',
      codeSnippet: `// FACADE: Clean unified entry to multi-service system
class VideoConverterFacade {
  convert(file: string, format: string) {
    const audio = new AudioDecoder().extract(file);
    const video = new VideoDecoder().decode(file);
    return new VideoEncoder().merge(video, audio, format);
  }
}`,
    },
    decisiveRule: 'Choose Adapter when you must conform to an existing incompatible interface. Choose Facade when you want to simplify an unwieldy subsystem. Choose Bridge when designing two hierarchies to evolve independently.',
    whenToPickA: [
      'You have an existing third-party or legacy class whose interface does not match your target interface.',
      'The target interface is fixed and non-negotiable.',
      'You are bridging two already-written interfaces.',
    ],
    whenToPickB: [
      'You have a complex subsystem with dozens of classes and want to provide a simple entry point.',
      'You want to decouple clients from internal subsystem choreography.',
      'Clients only need 20% of the subsystem features 80% of the time.',
    ],
  },
  {
    id: 'observer-vs-mediator',
    title: 'Observer vs. Mediator',
    subtitle: 'One-to-Many Dynamic Broadcast vs. Many-to-Many Centralized Coordinator',
    category: 'Behavioral',
    patternA: {
      id: 'observer',
      name: 'Observer Pattern',
      intent: 'Defines a one-to-many dependency so that when one object changes state, all its dependents are notified automatically.',
      structure: 'Subject maintains a dynamic collection of Observers. Communication is strictly unidirectional (Subject -> Observers).',
      coupling: 'Subject knows nothing about concrete observers, only the IObserver interface.',
      swappability: 'Observers attach/detach dynamically at runtime.',
      codeSnippet: `// OBSERVER: 1-to-many broadcast event dispatch
class NewsPublisher {
  private subs: Subscriber[] = [];
  publish(news: string) {
    this.subs.forEach(s => s.update(news));
  }
}`,
    },
    patternB: {
      id: 'mediator',
      name: 'Mediator Pattern',
      intent: 'Encapsulates how a set of objects interact, preventing colleagues from referring to each other explicitly.',
      structure: 'Centralized hub. Colleagues communicate through the Mediator; Mediator contains coordination logic.',
      coupling: 'Colleagues know only the Mediator; Mediator knows all concrete colleagues.',
      swappability: 'Centralizes interaction protocols in one place.',
      codeSnippet: `// MEDIATOR: Centralized many-to-many coordination
class DialogMediator {
  notify(sender: Component, event: string) {
    if (sender === this.checkbox && event === "check") {
      this.usernameInput.enable();
      this.submitBtn.highlight();
    }
  }
}`,
    },
    decisiveRule: 'Choose Observer for one-way broadcast notifications where the subject does not care what listeners do. Choose Mediator when multiple peer objects need complex bidirectional coordination.',
    whenToPickA: [
      'State changes in one object need to notify an unknown, open-ended number of listeners.',
      'The subject has no need to know the identity or behavior of the subscribers.',
      'Communication is strictly one-to-many broadcast.',
    ],
    whenToPickB: [
      'Components form an interconnected mesh where changes in one trigger cascading changes in others.',
      'You want to reuse components without coupling them to their neighbors.',
      'You need a centralized place to inspect and customize interaction logic.',
    ],
  },
  {
    id: 'template-method-vs-strategy',
    title: 'Template Method vs. Strategy',
    subtitle: 'Compile-Time Inheritance Algorithm Skeleton vs. Runtime Object Composition Algorithm',
    category: 'Behavioral',
    patternA: {
      id: 'template-method',
      name: 'Template Method Pattern',
      intent: 'Defines the skeleton of an algorithm in an operation, deferring some steps to subclasses without changing algorithm structure.',
      structure: 'Uses class inheritance. Base class defines the fixed workflow and calls abstract/hook methods overridden by subclasses.',
      coupling: 'Tied at compile time to the inheritance hierarchy.',
      swappability: 'Static compile-time variation per subclass.',
      codeSnippet: `// TEMPLATE METHOD: Fixed skeleton in base class
abstract class DataMiner {
  mine(path: string) {
    this.openFile(path);
    const raw = this.extractRaw(); // Abstract hook
    const parsed = this.parse(raw); // Abstract hook
    this.closeFile();
  }
  abstract extractRaw(): Buffer;
  abstract parse(raw: Buffer): any;
}`,
    },
    patternB: {
      id: 'strategy',
      name: 'Strategy Pattern',
      intent: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.',
      structure: 'Uses object composition. Context delegates the entire algorithm to an interchangeable strategy object.',
      coupling: 'Decoupled through an interface.',
      swappability: 'Dynamic runtime swapping.',
      codeSnippet: `// STRATEGY: Pluggable object composition
class DataMiner {
  constructor(private parser: ParserStrategy) {}

  mine(path: string) {
    this.openFile(path);
    const parsed = this.parser.parse(path); // Delegated!
    this.closeFile();
  }
}`,
    },
    decisiveRule: 'Choose Template Method when the algorithm has invariant fixed steps and only specific sub-steps vary. Choose Strategy when the entire algorithm needs to be swappable at runtime without inheritance.',
    whenToPickA: [
      'The overall sequence of steps is fixed and must never be altered by subclasses.',
      'You only want subclasses to customize specific atomic hooks.',
      'You want to prevent code duplication in the overall workflow.',
    ],
    whenToPickB: [
      'The entire algorithm varies, not just individual sub-steps.',
      'You want to switch algorithms dynamically while the application runs.',
      'You want to avoid subclass explosion and favor composition.',
    ],
  },
  {
    id: 'composite-vs-decorator',
    title: 'Composite vs. Decorator',
    subtitle: 'Tree Hierarchy Aggregation vs. Recursive Behavioral Wrapping',
    category: 'Structural',
    patternA: {
      id: 'composite',
      name: 'Composite Pattern',
      intent: 'Composes objects into tree structures to represent part-whole hierarchies, treating individual objects and groupings uniformly.',
      structure: 'Manages collections of children in a tree. Node has many children (1-to-N).',
      coupling: 'Leaf and Composite share a common component interface.',
      swappability: 'Hierarchical structure aggregation.',
      codeSnippet: `// COMPOSITE: 1-to-many tree container
class Directory implements Entry {
  private children: Entry[] = [];
  add(e: Entry) { this.children.push(e); }
  getSize() {
    return this.children.reduce((acc, c) => acc + c.getSize(), 0);
  }
}`,
    },
    patternB: {
      id: 'decorator',
      name: 'Decorator Pattern',
      intent: 'Attaches additional responsibilities to an object dynamically without modifying its class.',
      structure: 'Wraps exactly one child object (1-to-1) and adds behavior before or after delegating.',
      coupling: 'Decorator delegates to a single wrapped instance.',
      swappability: 'Recursive wrapping to enhance capability.',
      codeSnippet: `// DECORATOR: 1-to-1 capability wrapping
class CompressedEntry implements Entry {
  constructor(private inner: Entry) {}
  getSize() {
    return Math.floor(this.inner.getSize() * 0.4); // Modifies behavior!
  }
}`,
    },
    decisiveRule: 'Choose Composite when you have a tree of parts and wholes (1-to-N). Choose Decorator when you are wrapping a single object to add capabilities (1-to-1).',
    whenToPickA: [
      'You are modeling tree structures like filesystems, UI widgets, or organizational charts.',
      'Clients need to treat containers and leaf items identically.',
      'Operations should recurse automatically through all branches.',
    ],
    whenToPickB: [
      'You want to add capabilities to a single object without changing other instances.',
      'You want capabilities to be composable in arbitrary combinations.',
      'The relationship is 1-to-1 wrapping, not a multi-child tree.',
    ],
  },
];

export interface GoFPatternAspectMeta {
  id: string;
  name: string;
  category: 'Creational' | 'Structural' | 'Behavioral';
  aspectThatVaries: string; // From GoF Chapter 1 Table 1.2
  intent: string;
  antiPatternWarning: string;
  commonCollaborators: string[];
  commonCompetitors: string[];
  referenceCitation?: string;
}

export const GOF_PATTERN_ASPECTS: Record<string, GoFPatternAspectMeta> = {
  'factory-method': {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    aspectThatVaries: 'Subclass of object that is instantiated',
    intent: 'Defines creation interface in a base class, deferring concrete class instantiation to subclasses.',
    antiPatternWarning: 'Subclass Explosion: Subclassing a creator merely to produce a single product type.',
    commonCollaborators: ['template-method', 'abstract-factory', 'prototype'],
    commonCompetitors: ['abstract-factory', 'prototype', 'template-method'],
    referenceCitation: 'GoF Section 3.3 · Kerievsky "Move Creation Knowledge to Factory"',
  },
  'abstract-factory': {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    aspectThatVaries: 'Families of product objects',
    intent: 'Provides an interface for creating families of related or dependent objects without specifying concrete classes.',
    antiPatternWarning: 'Mega-Factory Antipattern: Adding one product type requires updating every factory subclass.',
    commonCollaborators: ['factory-method', 'prototype', 'singleton'],
    commonCompetitors: ['factory-method', 'builder', 'prototype'],
    referenceCitation: 'GoF Section 3.1 · Fowler "Patterns of Enterprise Application Architecture"',
  },
  builder: {
    id: 'builder',
    name: 'Builder',
    category: 'Creational',
    aspectThatVaries: 'How a composite object gets created',
    intent: 'Separates complex object construction from its representation for staged, step-by-step builds.',
    antiPatternWarning: 'Premature Builder: Over-engineering objects with only 2-3 fixed constructor arguments (YAGNI).',
    commonCollaborators: ['composite', 'abstract-factory'],
    commonCompetitors: ['abstract-factory', 'factory-method'],
    referenceCitation: 'GoF Section 3.2 · Joshua Bloch "Effective Java" Item 2',
  },
  prototype: {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    aspectThatVaries: 'Class of object that is instantiated',
    intent: 'Creates new instances by cloning an existing configured prototypical template.',
    antiPatternWarning: 'Deep-Copy Landmine: Shallow-cloned pointers causing cross-instance mutation bugs.',
    commonCollaborators: ['abstract-factory', 'composite', 'decorator'],
    commonCompetitors: ['factory-method', 'abstract-factory'],
    referenceCitation: 'GoF Section 3.4',
  },
  singleton: {
    id: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    aspectThatVaries: 'The sole instance of a class',
    intent: 'Ensures a class has only one instance and provides a global access point.',
    antiPatternWarning: 'Global State Anti-Pattern: Hides true dependencies and breaks isolated unit test parallelism.',
    commonCollaborators: ['facade', 'abstract-factory'],
    commonCompetitors: ['dependency-injection'],
    referenceCitation: 'GoF Section 3.5 · Fowler "Inversion of Control Containers and the Dependency Injection pattern"',
  },
  adapter: {
    id: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    aspectThatVaries: 'Interface to an object',
    intent: 'Converts incompatible interface of an existing class into what clients expect.',
    antiPatternWarning: 'Polluted Adapter: Mixing business transformation logic into an interface translation layer.',
    commonCollaborators: ['bridge', 'facade'],
    commonCompetitors: ['facade', 'bridge', 'proxy', 'decorator'],
    referenceCitation: 'GoF Section 4.1 · Kerievsky "Adapt Interface"',
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    aspectThatVaries: 'Implementation of an object',
    intent: 'Decouples an abstraction from its implementation so both vary independently.',
    antiPatternWarning: 'Premature Dimension Splitting: Building multi-layer abstractions before two orthogonal dimensions exist.',
    commonCollaborators: ['abstract-factory', 'adapter'],
    commonCompetitors: ['adapter', 'strategy'],
    referenceCitation: 'GoF Section 4.2',
  },
  composite: {
    id: 'composite',
    name: 'Composite',
    category: 'Structural',
    aspectThatVaries: 'Structure and composition of an object',
    intent: 'Composes objects into tree structures; treats individual objects and groupings uniformly.',
    antiPatternWarning: 'Type Safety Sacrifice: Throwing UnsupportedOperationException on leaf node add/remove operations.',
    commonCollaborators: ['visitor', 'iterator', 'decorator', 'chain-of-responsibility'],
    commonCompetitors: ['decorator', 'flyweight'],
    referenceCitation: 'GoF Section 4.3 · Kerievsky "Replace One/Many Distinctions with Composite"',
  },
  decorator: {
    id: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    aspectThatVaries: 'Responsibilities of an object without subclassing',
    intent: 'Attaches dynamic responsibilities to an object dynamically via recursive wrapping.',
    antiPatternWarning: 'Wrapper Hell: Excessive recursive wrappers obscuring object identity and debugging stack traces.',
    commonCollaborators: ['composite', 'strategy'],
    commonCompetitors: ['proxy', 'composite', 'adapter', 'strategy'],
    referenceCitation: 'GoF Section 4.4',
  },
  facade: {
    id: 'facade',
    name: 'Facade',
    category: 'Structural',
    aspectThatVaries: 'Interface to a subsystem',
    intent: 'Provides a unified, simplified high-level interface to a complex subsystem.',
    antiPatternWarning: 'God Object Facade: Accumulating all subsystem business logic into the facade itself.',
    commonCollaborators: ['singleton', 'mediator', 'adapter'],
    commonCompetitors: ['adapter', 'mediator'],
    referenceCitation: 'GoF Section 4.5',
  },
  flyweight: {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    aspectThatVaries: 'Storage costs of objects',
    intent: 'Shares fine-grained objects to support vast numbers with low memory overhead.',
    antiPatternWarning: 'Premature Optimization: Separating intrinsic/extrinsic state when memory is not constrained.',
    commonCollaborators: ['composite', 'factory-method'],
    commonCompetitors: ['prototype', 'singleton'],
    referenceCitation: 'GoF Section 4.6',
  },
  proxy: {
    id: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    aspectThatVaries: 'How an object is accessed; its location',
    intent: 'Provides a surrogate or placeholder to control access, lazy load, or cache results.',
    antiPatternWarning: 'Hidden Latency: Proxies triggering unexpected synchronous network/DB I/O behind normal method calls.',
    commonCollaborators: ['adapter', 'decorator'],
    commonCompetitors: ['decorator', 'adapter'],
    referenceCitation: 'GoF Section 4.7',
  },
  'chain-of-responsibility': {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    aspectThatVaries: 'Object that can fulfill a request',
    intent: 'Passes a request along a sequence of potential handlers until one fulfills it.',
    antiPatternWarning: 'Black Hole Pipeline: Requests falling off the tail of the chain unhandled with no error log.',
    commonCollaborators: ['command', 'composite'],
    commonCompetitors: ['command', 'mediator', 'observer'],
    referenceCitation: 'GoF Section 5.1 · Kerievsky "Move Accumulation to Collecting Parameter"',
  },
  command: {
    id: 'command',
    name: 'Command',
    category: 'Behavioral',
    aspectThatVaries: 'When and how a request is fulfilled',
    intent: 'Encapsulates a request as an object, enabling parameterization, queuing, and undo.',
    antiPatternWarning: 'Anemic Command: Creating boilerplate command classes for trivial synchronous function calls.',
    commonCollaborators: ['memento', 'composite', 'chain-of-responsibility'],
    commonCompetitors: ['strategy', 'chain-of-responsibility'],
    referenceCitation: 'GoF Section 5.2 · Fowler "CQRS and Event Sourcing"',
  },
  interpreter: {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioral',
    aspectThatVaries: 'Grammar and interpretation of a language',
    intent: 'Given a language, defines a grammar representation and interpreter for sentences.',
    antiPatternWarning: 'Combinatorial Grammar Bloat: Writing manual interpreter classes for complex grammars (use a Parser generator).',
    commonCollaborators: ['composite', 'visitor', 'iterator'],
    commonCompetitors: ['visitor'],
    referenceCitation: 'GoF Section 5.3',
  },
  iterator: {
    id: 'iterator',
    name: 'Iterator',
    category: 'Behavioral',
    aspectThatVaries: 'How an aggregate elements are accessed, traversed',
    intent: 'Accesses elements of an aggregate sequentially without exposing its representation.',
    antiPatternWarning: 'Concurrent Modification: Mutating underlying collection while external iterator is active.',
    commonCollaborators: ['composite', 'factory-method'],
    commonCompetitors: ['visitor'],
    referenceCitation: 'GoF Section 5.4',
  },
  mediator: {
    id: 'mediator',
    name: 'Mediator',
    category: 'Behavioral',
    aspectThatVaries: 'How and which objects interact with each other',
    intent: 'Encapsulates how a set of objects interact to avoid direct peer-to-peer references.',
    antiPatternWarning: 'God Mediator: Mediator becomes an unmaintainable monolithic controller.',
    commonCollaborators: ['observer', 'command', 'facade'],
    commonCompetitors: ['observer', 'facade'],
    referenceCitation: 'GoF Section 5.5',
  },
  memento: {
    id: 'memento',
    name: 'Memento',
    category: 'Behavioral',
    aspectThatVaries: 'What private information is stored outside an object, and when',
    intent: 'Captures and externalizes internal state without violating encapsulation for rollback.',
    antiPatternWarning: 'Memory Ballooning: Storing full monolithic snapshots instead of delta increments.',
    commonCollaborators: ['command', 'iterator'],
    commonCompetitors: ['state', 'prototype'],
    referenceCitation: 'GoF Section 5.6',
  },
  observer: {
    id: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    aspectThatVaries: 'Number of objects that depend on another; how they stay updated',
    intent: 'Defines 1-to-many broadcast dependency where state change notifies all subscribers.',
    antiPatternWarning: 'Lapsed Listener Memory Leak: Listeners remaining subscribed to long-lived subjects.',
    commonCollaborators: ['mediator', 'command'],
    commonCompetitors: ['mediator', 'chain-of-responsibility'],
    referenceCitation: 'GoF Section 5.7',
  },
  state: {
    id: 'state',
    name: 'State',
    category: 'Behavioral',
    aspectThatVaries: 'States of an object',
    intent: 'Allows an object to alter behavior when internal lifecycle changes; transitions autonomously.',
    antiPatternWarning: 'State Explosion: Creating separate state classes when only a couple simple boolean flags exist.',
    commonCollaborators: ['flyweight', 'singleton'],
    commonCompetitors: ['strategy', 'template-method'],
    referenceCitation: 'GoF Section 5.8 · Kerievsky "Replace State-Altering Conditionals with State"',
  },
  strategy: {
    id: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    aspectThatVaries: 'An algorithm',
    intent: 'Defines family of interchangeable algorithms, encapsulates each, swappable at runtime.',
    antiPatternWarning: 'Premature Strategy: Introducing polymorphism for an algorithm that never has a second variation.',
    commonCollaborators: ['factory-method', 'decorator'],
    commonCompetitors: ['state', 'template-method', 'bridge'],
    referenceCitation: 'GoF Section 5.9 · Kerievsky "Replace Conditional Logic with Strategy"',
  },
  'template-method': {
    id: 'template-method',
    name: 'Template Method',
    category: 'Behavioral',
    aspectThatVaries: 'Steps of an algorithm',
    intent: 'Defines skeleton of algorithm in base class, deferring specific steps to subclasses.',
    antiPatternWarning: 'Fragile Base Class: Changes to base class workflow break subclass step invariants.',
    commonCollaborators: ['factory-method', 'strategy'],
    commonCompetitors: ['strategy', 'factory-method'],
    referenceCitation: 'GoF Section 5.10 · Kerievsky "Form Template Method"',
  },
  visitor: {
    id: 'visitor',
    name: 'Visitor',
    category: 'Behavioral',
    aspectThatVaries: 'Operations that can be applied to object(s) without changing class(es)',
    intent: 'Represents an operation to be performed on elements of an object structure.',
    antiPatternWarning: 'Fragile Node Hierarchy: Adding a new element class requires updating the Visitor interface across all visitors.',
    commonCollaborators: ['composite', 'interpreter'],
    commonCompetitors: ['iterator'],
    referenceCitation: 'GoF Section 5.11 · Kerievsky "Move Embellishment to Decorator or Visitor"',
  },
};

export type GoFRelationshipType = 'competitor' | 'collaborator' | 'orthogonal' | 'identical';

export interface GoFRelationshipAnalysis {
  type: GoFRelationshipType;
  badgeText: string;
  badgeTone: 'red' | 'green' | 'neutral';
  headline: string;
  summary: string;
  decisiveRule?: string;
  collaborationWorkflow?: string[];
  whyNotDirectCompetitors?: string;
  literatureReference: {
    citation: string;
    detail: string;
  };
}

export function classifyGoFRelationship(idA: string, idB: string): GoFRelationshipAnalysis {
  if (idA === idB) {
    const meta = GOF_PATTERN_ASPECTS[idA];
    return {
      type: 'identical',
      badgeText: 'SAME PATTERN SELECTED',
      badgeTone: 'neutral',
      headline: 'Identical Pattern Selection',
      summary: `You have selected ${meta?.name ?? idA} on both sides. Select two different patterns to compare their architectural relationship.`,
      literatureReference: {
        citation: 'Gang of Four (1994)',
        detail: 'Catalog of 23 Creational, Structural, and Behavioral patterns.',
      },
    };
  }

  // 1. Check if this is an explicit Sibling Dilemma
  const dilemma = SIBLING_DILEMMAS.find(
    (d) =>
      (d.patternA.id === idA && d.patternB.id === idB) ||
      (d.patternA.id === idB && d.patternB.id === idA)
  );

  if (dilemma) {
    return {
      type: 'competitor',
      badgeText: '🔴 DIRECT SIBLING COMPETITORS (STRUCTURAL ISOMORPHISM)',
      badgeTone: 'red',
      headline: `${dilemma.title} · Direct Architectural Rivals`,
      summary: `These patterns share isomorphic class diagrams and solve competing forces on the same axis. Disambiguation requires identifying who controls the transition or configuration.`,
      decisiveRule: dilemma.decisiveRule,
      literatureReference: {
        citation: 'GoF Figure 1.1 · Design Pattern Relationships',
        detail: 'Identifies patterns with similar structure but distinct architectural intents.',
      },
    };
  }

  // 2. Check other known Competitor pairings
  const metaA = GOF_PATTERN_ASPECTS[idA];
  const metaB = GOF_PATTERN_ASPECTS[idB];

  const isKnownCompetitor =
    metaA?.commonCompetitors.includes(idB) || metaB?.commonCompetitors.includes(idA);

  if (isKnownCompetitor) {
    return {
      type: 'competitor',
      badgeText: '🔴 SIBLING COMPETITORS (SIMILAR FORCES)',
      badgeTone: 'red',
      headline: `${metaA?.name ?? idA} vs. ${metaB?.name ?? idB} · Competing Architectural Alternatives`,
      summary: `Both patterns operate in the ${metaA?.category ?? ''} problem space and compete to address variation. Choose based on whether variation is static compile-time inheritance or dynamic runtime composition.`,
      decisiveRule: `Choose ${metaA?.name} if varying "${metaA?.aspectThatVaries}". Choose ${metaB?.name} if varying "${metaB?.aspectThatVaries}".`,
      literatureReference: {
        citation: 'Joshua Kerievsky "Refactoring to Patterns"',
        detail: 'Warns against premature pattern binding; refactor to the simpler pattern until third variation emerges.',
      },
    };
  }

  // 3. Check Synergistic Collaborators
  const isKnownCollaborator =
    metaA?.commonCollaborators.includes(idB) || metaB?.commonCollaborators.includes(idA);

  // Specific collaboration workflows
  const pairKey = [idA, idB].sort().join('+');
  let workflow: string[] | undefined;

  if (pairKey === 'composite+visitor') {
    workflow = [
      'Composite constructs the recursive part-whole tree structure (e.g., AST, DOM, or UI Hierarchy).',
      'Visitor traverses the Composite tree, executing diverse operations (e.g., Typechecking, Rendering, Code Generation) without altering node classes.',
      'Result: Adding a new operation requires only a new Visitor class, leaving the Composite hierarchy untouched.',
    ];
  } else if (pairKey === 'composite+iterator') {
    workflow = [
      'Composite provides the hierarchical tree storage for leaves and branch nodes.',
      'Iterator encapsulates tree traversal algorithms (Depth-First, Breadth-First, Post-Order) outside the node classes.',
    ];
  } else if (pairKey === 'command+memento') {
    workflow = [
      'Command encapsulates operations into standalone objects with execute() and undo() hooks.',
      'Memento captures private snapshot checkpoints of the receiver state before Command runs, allowing flawless undo.',
    ];
  } else if (pairKey === 'mediator+observer') {
    workflow = [
      'Colleague components act as Subjects broadcasting change events to subscribers.',
      'The Mediator subscribes to colleagues as an Observer, centrally orchestrating cross-component side effects.',
    ];
  } else if (pairKey === 'abstract-factory+prototype') {
    workflow = [
      'Abstract Factory defines the suite of products needed by a client system.',
      'Prototype provides clonable instance templates stored inside the factory, eliminating the need for factory subclassing.',
    ];
  } else if (pairKey === 'strategy+factory-method') {
    workflow = [
      'Factory Method inspects system environment or tenant configuration to instantiate the correct Strategy.',
      'The caller uses the returned Strategy polymorphically throughout request processing.',
    ];
  }

  if (isKnownCollaborator || workflow) {
    return {
      type: 'collaborator',
      badgeText: '🟢 SYNERGISTIC COLLABORATORS (PIPELINE PARTNERS)',
      badgeTone: 'green',
      headline: `${metaA?.name ?? idA} & ${metaB?.name ?? idB} · Complementary System Allies`,
      summary: `These patterns DO NOT compete! In production enterprise architecture, they are designed to work together as collaborative layers in a pipeline.`,
      collaborationWorkflow: workflow ?? [
        `${metaA?.name} establishes the structural or behavioral foundation for the subsystem.`,
        `${metaB?.name} layers upon that foundation to execute dynamic operations or client interactions.`,
        `They solve complementary forces rather than competing for the same responsibility.`,
      ],
      literatureReference: {
        citation: 'GoF Figure 1.1 "Design Pattern Relationships"',
        detail: 'Demonstrates how GoF patterns compose into complete, decoupled software subsystems.',
      },
    };
  }

  // 4. Orthogonal Concerns (Default)
  return {
    type: 'orthogonal',
    badgeText: '⚪ ORTHOGONAL CONCERNS (INDEPENDENT PROBLEM SPACES)',
    badgeTone: 'neutral',
    headline: `${metaA?.name ?? idA} vs. ${metaB?.name ?? idB} · False Dilemma`,
    summary: `These patterns operate on completely independent axes of change. Comparing them as rivals is an architectural false dilemma. Systems routinely use both, one, or neither depending on distinct subsystem requirements.`,
    whyNotDirectCompetitors: `${metaA?.name} (${metaA?.category}) varies "${metaA?.aspectThatVaries}". In contrast, ${metaB?.name} (${metaB?.category}) varies "${metaB?.aspectThatVaries}". They address orthogonal design dimensions.`,
    literatureReference: {
      citation: 'Joshua Kerievsky ("Patternitis") & Martin Fowler',
      detail: 'Avoid forcing patterns into artificial competitions. Evaluate each pattern against its specific axis of change.',
    },
  };
}

