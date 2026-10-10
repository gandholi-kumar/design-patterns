import type { SolidAssessment, PatternRelation } from '../pattern-types';

export interface PatternTradeoffData {
  solidPrinciples: SolidAssessment[];
  confusedWith: PatternRelation[];
  interviewTraps: string[];
}

export const TRADEOFFS_DATA: Record<string, PatternTradeoffData> = {
  'factory-method': {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Moves product creation logic into one dedicated place in the program, keeping business operations separate from instantiation.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new types of products and creator subclasses without breaking existing client code.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Abstract Factory',
        keyDifference: 'Factory Method uses inheritance to create one product via method overriding; Abstract Factory uses object composition to produce families of distinct products.',
        decisionRule: 'Single product kind with subclass creation = Factory Method; Family of related products without concrete classes = Abstract Factory.',
      },
      {
        targetPattern: 'Template Method',
        keyDifference: 'Factory Method is often a specialized step inside a larger Template Method workflow.',
        decisionRule: 'Step focused strictly on creating an object = Factory Method; Invariant multi-step algorithm with step hooks = Template Method.',
      },
      {
        targetPattern: 'Prototype',
        keyDifference: 'Factory Method creates products via class inheritance and constructors; Prototype creates products by cloning an initialized instance.',
        decisionRule: 'Object creation via constructor subclassing = Factory Method; Object creation via deep cloning configured instances = Prototype.',
      },
    ],
    interviewTraps: [
      'Do not confuse a simple static helper method (Parameterized Factory) with the Gang of Four Factory Method pattern, which requires inheritance and an overridable method in a creator class.',
      'Watch out for subclass explosion: introducing a new concrete product requires creating an entirely new creator subclass if parameters are not used.',
    ],
  },

  'abstract-factory': {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Isolates product creation code for entire product suites from consumer business logic.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'trades-off',
        explanation: 'Adheres when adding new factory variants (e.g. Mac/Win), but TRADES OFF when adding new product types (e.g. adding Checkbox forces editing all factory interfaces).',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Factory Method',
        keyDifference: 'Abstract Factory classes are often composed of a set of Factory Methods, each producing one member of a related product family.',
        decisionRule: 'Creating one product type = Factory Method; Creating a matched family of products (e.g. Button + Checkbox) = Abstract Factory.',
      },
      {
        targetPattern: 'Builder',
        keyDifference: 'Abstract Factory focuses on creating families of related objects immediately; Builder focuses on constructing a single complex object step-by-step.',
        decisionRule: 'Immediate creation of compatible product suites = Abstract Factory; Staged step-by-step assembly of one complex product = Builder.',
      },
    ],
    interviewTraps: [
      'The "Product Type Trap": Adding a new product category requires altering the abstract factory interface and every existing concrete factory class in the codebase.',
      'Overengineering when you only have a single product family that will never need a second variant.',
    ],
  },

  builder: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Isolates complex object construction, step sequencing, and validation away from the product representation.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new builder variations (e.g. JSON Builder, XML Builder) without modifying existing caller or director code.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Abstract Factory',
        keyDifference: 'Abstract Factory produces families of simple or complex objects in a single call; Builder constructs a single complex object through a sequence of steps.',
        decisionRule: 'Immediate family instantiation = Abstract Factory; Staged step-by-step object assembly = Builder.',
      },
      {
        targetPattern: 'Composite',
        keyDifference: 'Builder is often used to construct complex recursive Composite trees step by step.',
        decisionRule: 'Assembling a complex structure = Builder; Representing part-whole tree hierarchies = Composite.',
      },
    ],
    interviewTraps: [
      'Using Builder for flat objects with only 2 or 3 mandatory fields creates unnecessary ceremony and verbosity.',
      'Failing to make the product immutable or failing to validate incomplete configurations before returning the built instance.',
    ],
  },

  prototype: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Delegates the responsibility of duplicating an object to the object itself, eliminating external constructor coupling.',
      },
      {
        principle: 'Dependency Inversion Principle',
        impact: 'adheres',
        explanation: 'Clients clone objects via a generic Prototype interface without depending on concrete implementation classes.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Factory Method',
        keyDifference: 'Factory Method creates new objects using class inheritance and constructors; Prototype copies configured existing instances.',
        decisionRule: 'Need fresh instances from classes = Factory Method; Need replicas of expensive runtime configurations = Prototype.',
      },
      {
        targetPattern: 'Memento',
        keyDifference: 'Prototype produces independent, editable clones; Memento produces opaque state snapshots specifically for rollback and undo.',
        decisionRule: 'Copying an object to use and modify = Prototype; Saving state snapshot for rollback without inspection = Memento.',
      },
    ],
    interviewTraps: [
      'The "Shallow vs Deep Copy Trap": Shallow cloning duplicates object references, causing changes in the clone to inadvertently mutate the original object.',
      'Circular references in complex object graphs can cause infinite loops during deep clone serialization unless a visited cache is maintained.',
    ],
  },

  singleton: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'trades-off',
        explanation: 'VIOLATES Single Responsibility Principle: The class controls its own instance lifecycle AND performs core business functionality.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'trades-off',
        explanation: 'Hard to extend or substitute because static access points bypass polymorphic interfaces and dependency injection.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Facade',
        keyDifference: 'A Facade provides a simplified interface to a subsystem and can often be implemented as a Singleton, but its primary intent is simplification, not instance control.',
        decisionRule: 'Guaranteeing exactly one instance = Singleton; Providing one front door to multiple subsystems = Facade.',
      },
      {
        targetPattern: 'Flyweight',
        keyDifference: 'Flyweight shares immutable objects across many references; Singleton maintains one mutable or immutable instance globally.',
        decisionRule: 'Many shared instances with distinct extrinsic state = Flyweight; Exactly one shared access point = Singleton.',
      },
    ],
    interviewTraps: [
      'Claiming Singleton adheres to SOLID: Refactoring Guru and GoF explicitly highlight that Singleton violates the Single Responsibility Principle.',
      'Concurrency race conditions in multithreaded environments: Failing to use double-checked locking with volatile fields or language-level static holders.',
      'Unit testing nightmare: Singletons introduce global mutable state, making tests interdependent and impossible to isolate or mock without reflection.',
    ],
  },

  adapter: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Separates interface translation and data format conversion code from the primary business logic of the application.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new adapters to support different third-party SDKs without breaking existing client code.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Bridge',
        keyDifference: 'Bridge is designed up-front to decouple an abstraction from its implementation; Adapter is retrofitted after the fact to make incompatible existing classes work together.',
        decisionRule: 'Up-front two-dimensional variation = Bridge; Retrofitting incompatible interfaces = Adapter.',
      },
      {
        targetPattern: 'Decorator',
        keyDifference: 'Adapter changes the interface of an existing object; Decorator enhances or adds behavior while preserving the exact same interface.',
        decisionRule: 'Incompatible contract translation = Adapter; Transparent behavior addition = Decorator.',
      },
      {
        targetPattern: 'Proxy',
        keyDifference: 'Proxy implements the exact same interface as the target to control access; Adapter changes the interface to make it compatible.',
        decisionRule: 'Same interface, controlling access = Proxy; Different interface, bridging contract = Adapter.',
      },
    ],
    interviewTraps: [
      'Turning an adapter into a business layer: Adapters should only translate types, methods, and parameters, never contain domain business logic.',
      'Class Adapter (multiple inheritance) vs Object Adapter (composition): In most languages, Object Adapter is favored because it adapts any subclass of the adaptee.',
    ],
  },

  bridge: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Decouples high-level platform-independent abstractions from low-level platform-specific implementors.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new abstractions and new implementors completely independently of each other.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Adapter',
        keyDifference: 'Bridge is designed up-front before components exist; Adapter makes existing incompatible classes work together.',
        decisionRule: 'Pre-planned separation of orthogonal hierarchies = Bridge; Post-hoc integration of incompatible APIs = Adapter.',
      },
      {
        targetPattern: 'Strategy',
        keyDifference: 'Bridge is a structural pattern separating an abstraction hierarchy from its implementation hierarchy; Strategy is a behavioral pattern swapping interchangeable algorithms inside a context.',
        decisionRule: 'Two independent class hierarchies = Bridge; Interchangeable behavior in one class = Strategy.',
      },
    ],
    interviewTraps: [
      'Using Bridge when only one dimension of variation exists: If you only have one implementation or abstraction, the extra indirection adds pointless complexity.',
    ],
  },

  composite: {
    solidPrinciples: [
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new leaf and container element types into the tree structure without breaking client code.',
      },
      {
        principle: 'Interface Segregation Principle',
        impact: 'trades-off',
        explanation: 'TRADES OFF Interface Segregation Principle: The common component interface must either declare container methods (add/remove) that make no sense on leaves, or sacrifice uniform transparency.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Decorator',
        keyDifference: 'Decorator has only one child component and layers responsibilities around it; Composite has multiple children and aggregates their collective results.',
        decisionRule: 'Adding responsibilities to a single object = Decorator; Part-whole tree aggregation = Composite.',
      },
      {
        targetPattern: 'Iterator',
        keyDifference: 'Composite structures the nested tree data; Iterator traverses the tree structure sequentially.',
        decisionRule: 'Representing tree hierarchy = Composite; Walking the tree elements = Iterator.',
      },
    ],
    interviewTraps: [
      'The "Transparency vs Safety" dilemma: Providing `add()` and `remove()` on the common interface makes leaves unsafe (they must throw or no-op); omitting them from the base interface forces ugly type casting.',
    ],
  },

  decorator: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Divides monolithic classes into small, focused wrapper classes that each handle a single concern (e.g. caching, encryption, compression).',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can compose new combinations of behaviors dynamically at runtime without modifying the underlying component.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Adapter',
        keyDifference: 'Decorator preserves or enhances the interface; Adapter translates one interface into a completely different one.',
        decisionRule: 'Same contract, enhanced behavior = Decorator; Incompatible contract translation = Adapter.',
      },
      {
        targetPattern: 'Proxy',
        keyDifference: 'Proxy manages the lifecycle of the service object internally and controls access; Decorator composition is controlled dynamically by the client.',
        decisionRule: 'Client dynamically stacks wrappers = Decorator; Stand-in controls access to target = Proxy.',
      },
      {
        targetPattern: 'Strategy',
        keyDifference: 'Decorator changes the skin of an object from the outside; Strategy changes the guts from the inside.',
        decisionRule: 'Wrapping behavior around an object = Decorator; Swapping internal algorithm = Strategy.',
      },
    ],
    interviewTraps: [
      'Wrapper order dependency: If decorator B assumes decorator A has already transformed the data, subtle bugs occur when clients stack them in the wrong sequence.',
      'Hard to remove a specific wrapper from the middle of a deeply nested decorator stack.',
    ],
  },

  facade: {
    solidPrinciples: [
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'Shields clients from changes to subsystem classes by funneling interaction through a stable high-level contract.',
      },
      {
        principle: 'Single Responsibility Principle',
        impact: 'trades-off',
        explanation: 'RISKS VIOLATING Single Responsibility Principle: A facade easily degenerates into a monolithic "God Object" coupled to all subsystem classes.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Adapter',
        keyDifference: 'Facade defines a brand-new simplified interface for an entire subsystem; Adapter wraps a single object to make an existing incompatible interface usable.',
        decisionRule: 'Simplifying an entire subsystem = Facade; Adapting one incompatible interface = Adapter.',
      },
      {
        targetPattern: 'Mediator',
        keyDifference: 'Facade provides unidirectional communication from client to subsystem; Mediator centralizes bidirectional communication between peer components.',
        decisionRule: 'Unidirectional front-door access = Facade; Bidirectional peer coordination = Mediator.',
      },
    ],
    interviewTraps: [
      'Turning the facade into a God Object that absorbs all business logic instead of just routing calls to subsystem specialists.',
    ],
  },

  flyweight: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Separates immutable shared intrinsic state from mutable contextual extrinsic state.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'trades-off',
        explanation: 'TRADES OFF Open/Closed Principle: Introducing new intrinsic state properties requires modifying the core Flyweight class and all pooled factories.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Singleton',
        keyDifference: 'Singleton allows exactly one instance across the whole app; Flyweight allows multiple instances with different intrinsic states, shared across contexts.',
        decisionRule: 'One instance globally = Singleton; Many shared immutable instances = Flyweight.',
      },
      {
        targetPattern: 'Composite',
        keyDifference: 'Flyweight is often used to implement the shared leaf nodes of a massive Composite tree to conserve memory.',
        decisionRule: 'Memory deduplication = Flyweight; Hierarchical part-whole structure = Composite.',
      },
    ],
    interviewTraps: [
      'The "CPU vs RAM" trade-off: Flyweight saves significant memory, but increases CPU overhead because extrinsic state must be calculated or passed on every method call.',
      'Accidentally mutating intrinsic state: If intrinsic state is modified, all objects referencing the flyweight are corrupted simultaneously.',
    ],
  },

  proxy: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Separates secondary concerns (lazy initialization, caching, authorization, logging) from core service business logic.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new proxies (e.g. logging proxy, caching proxy) without modifying the service or its clients.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Decorator',
        keyDifference: 'Proxy manages the lifecycle of the service object internally; Decorator composition is always directed and stacked by the client.',
        decisionRule: 'Controlled access / managed lifecycle = Proxy; Client-assembled behavior layering = Decorator.',
      },
      {
        targetPattern: 'Adapter',
        keyDifference: 'Proxy implements the exact same interface as the target; Adapter translates the target to an incompatible interface.',
        decisionRule: 'Same interface = Proxy; Different interface = Adapter.',
      },
    ],
    interviewTraps: [
      'Hiding network and latency boundaries: Making a remote proxy look identical to a local object can lead clients to make chatty, unoptimized remote calls.',
    ],
  },

  'chain-of-responsibility': {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Decouples classes that invoke operations from classes that handle and perform them.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can insert, reorder, or remove handlers in the chain dynamically without breaking client code.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Command',
        keyDifference: 'Chain of Responsibility passes a request along a sequence of handlers until one handles it; Command packages a request into a standalone object.',
        decisionRule: 'Sequential pipeline of potential handlers = CoR; Standalone executable action = Command.',
      },
      {
        targetPattern: 'Decorator',
        keyDifference: 'CoR handlers can execute arbitrary actions and STOP the pipeline at any point; Decorators must pass execution through all layers without breaking flow.',
        decisionRule: 'Can short-circuit or drop request = CoR; Must execute all layers = Decorator.',
      },
    ],
    interviewTraps: [
      'The "Unhandled Request Trap": If no handler in the chain processes the request, it can silently fall off the end unless an explicit fallback handler exists.',
    ],
  },

  command: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Decouples classes that invoke operations from classes that know how to execute them.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new commands without breaking existing invoker or receiver classes.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Strategy',
        keyDifference: 'Command parameterizes an object with an action, supporting queuing, scheduling, and undo; Strategy defines interchangeable ways of performing the same algorithm.',
        decisionRule: 'Package an action as an undoable object = Command; Interchangeable algorithm behind context = Strategy.',
      },
      {
        targetPattern: 'Memento',
        keyDifference: 'Command changes state and can execute compensation logic; Memento stores opaque state checkpoints for rollback.',
        decisionRule: 'Executable action object = Command; Saved state snapshot token = Memento.',
      },
    ],
    interviewTraps: [
      'Complexity explosion: Creating a distinct class for every microscopic operation can bloat a codebase with dozens of trivial classes.',
      'State drift in undo: If external state changes between command execution and undo, compensation logic can leave the system in an inconsistent state.',
    ],
  },

  iterator: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Separates traversal algorithms and cursor state from the collection aggregate data structure.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can implement new traversal algorithms (e.g. Breadth-First, Depth-First) without modifying collections.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Composite',
        keyDifference: 'Composite structures the nested tree nodes; Iterator walks through those nodes sequentially.',
        decisionRule: 'Tree object hierarchy = Composite; Traversal cursor = Iterator.',
      },
      {
        targetPattern: 'Visitor',
        keyDifference: 'Iterator traverses collection elements; Visitor performs operations on heterogeneous elements of an object structure.',
        decisionRule: 'Sequential access cursor = Iterator; Double-dispatch operations = Visitor.',
      },
    ],
    interviewTraps: [
      'Concurrent modification: Mutating an underlying collection while an iterator is actively traversing it can invalidate indices or cause infinite loops.',
    ],
  },

  mediator: {
    solidPrinciples: [
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new mediators or modify interactions without modifying individual component classes.',
      },
      {
        principle: 'Single Responsibility Principle',
        impact: 'trades-off',
        explanation: 'Extracts communication between components into one place, but RISKS VIOLATING SRP by degenerating into a monolithic God Object.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Facade',
        keyDifference: 'Facade simplifies access to a subsystem from external clients (unidirectional); Mediator coordinates communication between internal peers (bidirectional).',
        decisionRule: 'Subsystem entry point = Facade; Peer component coordinator = Mediator.',
      },
      {
        targetPattern: 'Observer',
        keyDifference: 'Observer creates one-to-many broadcast subscriptions; Mediator centralizes complex many-to-many coordination logic.',
        decisionRule: 'One-to-many event notification = Observer; Complex multi-component negotiation = Mediator.',
      },
    ],
    interviewTraps: [
      'The God Object trap: The mediator accumulates every interaction rule and becomes tightly coupled to all components, making it hard to test and maintain.',
    ],
  },

  memento: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Originator delegates state snapshot storage and history maintenance to a Caretaker without exposing private fields.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new Caretaker retention strategies and serialization formats without altering Originator state logic.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Command',
        keyDifference: 'Command represents an executable action that can undo itself via compensation; Memento captures the full state snapshot before the action occurs.',
        decisionRule: 'Undo via reversing operations = Command; Undo via restoring state snapshots = Memento.',
      },
      {
        targetPattern: 'Prototype',
        keyDifference: 'Prototype creates clones for further editing; Memento creates opaque tokens purely for restoration.',
        decisionRule: 'Cloning for independent modification = Prototype; Opaque token for checkpoint restoration = Memento.',
      },
    ],
    interviewTraps: [
      'RAM consumption: Storing frequent deep snapshots of large objects can rapidly exhaust memory unless the Caretaker enforces retention limits.',
    ],
  },

  observer: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Decouples state-holding publisher objects from dependent action-taking subscribers.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new subscriber listeners without modifying the publisher subject code.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Mediator',
        keyDifference: 'Observer establishes dynamic one-to-many event streams; Mediator routes multidirectional conversations between components.',
        decisionRule: 'Event broadcasting = Observer; Multi-party coordination = Mediator.',
      },
      {
        targetPattern: 'Chain of Responsibility',
        keyDifference: 'CoR passes a request sequentially until one handler processes it; Observer notifies all subscribers simultaneously.',
        decisionRule: 'One handler takes responsibility = CoR; All listeners receive notification = Observer.',
      },
    ],
    interviewTraps: [
      'The "Lapsed Listener" memory leak: Forgetting to unsubscribe listeners prevents garbage collection of the subscriber objects.',
      'Nondeterministic notification order: Subscribers must never depend on the execution sequence in which notifications arrive.',
    ],
  },

  state: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Organizes state-specific behaviors and transition rules into separate, dedicated classes.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new states and transitions without altering existing state classes or context conditionals.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Strategy',
        keyDifference: 'Strategy strategies are independent and chosen once by the client; State objects know about each other and trigger dynamic transitions inside the context.',
        decisionRule: 'Client selects algorithm = Strategy; Internal lifecycle flips behavior dynamically = State.',
      },
      {
        targetPattern: 'Bridge',
        keyDifference: 'Bridge shares a similar class structure but separates abstraction from implementation up-front; State encapsulates changing lifecycle phases.',
        decisionRule: 'Architectural separation = Bridge; Dynamic lifecycle transitions = State.',
      },
    ],
    interviewTraps: [
      'Coupling between concrete state classes: If concrete states instantiate their successor states directly, they become tightly coupled to each other.',
      'Overkill for trivial state machines: If an object only has 2 or 3 states that rarely change, a simple enum and switch is cleaner.',
    ],
  },

  strategy: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Isolates the implementation details of each distinct algorithm from the consuming business logic.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new strategies without having to modify the context class or existing strategy implementations.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'State',
        keyDifference: 'Strategy algorithms do not know about one another; State objects can transition the context to alternative states.',
        decisionRule: 'Interchangeable algorithms chosen by caller = Strategy; Autonomous state machine transitions = State.',
      },
      {
        targetPattern: 'Command',
        keyDifference: 'Strategy describes different ways of doing the same task; Command converts an arbitrary request into a standalone object.',
        decisionRule: 'How to do an action = Strategy; What action to do = Command.',
      },
      {
        targetPattern: 'Template Method',
        keyDifference: 'Template Method is based on inheritance (compile-time, static); Strategy is based on composition (runtime, dynamic).',
        decisionRule: 'Subclassing algorithm steps = Template Method; Composing interchangeable algorithms = Strategy.',
      },
    ],
    interviewTraps: [
      'Client awareness requirement: Clients must understand the differences between concrete strategies in order to select the appropriate one.',
      'Overcomplicating simple logic: In modern TypeScript/Java, anonymous functions or lambdas are often cleaner than full-blown strategy classes.',
    ],
  },

  'template-method': {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Pulls duplicate workflow skeleton code into a superclass, leaving subclasses focused solely on step variations.',
      },
      {
        principle: 'Liskov Substitution Principle',
        impact: 'trades-off',
        explanation: 'RISKS VIOLATING Liskov Substitution Principle: A subclass can suppress or no-op a default step, breaking invariant expectations of the base template method.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Strategy',
        keyDifference: 'Template Method relies on inheritance and fixes algorithm order at compile-time; Strategy relies on composition and swaps algorithms at runtime.',
        decisionRule: 'Fixed sequence with overridable steps = Template Method; Swappable algorithm object = Strategy.',
      },
      {
        targetPattern: 'Factory Method',
        keyDifference: 'Factory Method is often invoked as a specific creation step within a broader Template Method workflow.',
        decisionRule: 'Creation-only hook = Factory Method; Invariant multi-step process = Template Method.',
      },
    ],
    interviewTraps: [
      'Rigid inheritance coupling: Workflows that diverge beyond the predefined step sequence force unnatural workarounds in subclasses.',
      'Maintenance difficulty: As the number of template method steps grows, maintaining hook constraints across subclasses becomes fragile.',
    ],
  },

  visitor: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Extracts related operations across heterogeneous classes into a single visitor class, cleaning element classes.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'trades-off',
        explanation: 'ADHERES when adding new visitor operations, but VIOLATES OCP when adding new element classes (every visitor must be updated).',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Command',
        keyDifference: 'Command packages an action on one receiver; Visitor uses double dispatch to execute operations across heterogeneous element hierarchies.',
        decisionRule: 'Single receiver action = Command; Operations across polymorphic tree = Visitor.',
      },
      {
        targetPattern: 'Iterator',
        keyDifference: 'Iterator handles collection navigation; Visitor performs type-specific operations on visited elements.',
        decisionRule: 'Collection traversal = Iterator; Polymorphic double dispatch = Visitor.',
      },
    ],
    interviewTraps: [
      'The "Element Addition Trap": If the element hierarchy changes frequently, Visitor is a severe anti-pattern because adding one element class breaks every visitor.',
      'Encapsulation violation: Visitors often need access to private fields of element classes, forcing elements to expose public getters.',
    ],
  },

  interpreter: {
    solidPrinciples: [
      {
        principle: 'Single Responsibility Principle',
        impact: 'adheres',
        explanation: 'Each grammar rule is encapsulated in a dedicated expression class with its own interpretation logic.',
      },
      {
        principle: 'Open/Closed Principle',
        impact: 'adheres',
        explanation: 'You can introduce new grammar rule expression classes without modifying existing expressions.',
      },
    ],
    confusedWith: [
      {
        targetPattern: 'Composite',
        keyDifference: 'An abstract syntax tree evaluated by Interpreter is structurally a Composite tree, but Interpreter adds grammar evaluation semantics.',
        decisionRule: 'Evaluating a formal language = Interpreter; Part-whole hierarchy = Composite.',
      },
      {
        targetPattern: 'Visitor',
        keyDifference: 'Visitor can be applied to an Interpreter syntax tree to separate interpretation operations from expression nodes.',
        decisionRule: 'Grammar tree representation = Interpreter; External operations on nodes = Visitor.',
      },
    ],
    interviewTraps: [
      'Grammar class explosion: Complex grammars require hundreds of small classes; for anything beyond simple DSLs, parser generators (ANTLR, Lex/Yacc) are far superior.',
    ],
  },
};
