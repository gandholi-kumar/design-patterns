import { CANONICAL_DATA } from './data/canonical-data';
import { ENTERPRISE_DATA } from './data/enterprise-data';
import { TRADEOFFS_DATA } from './data/tradeoffs-data';
import type {
  Category,
  Perspective,
  Pattern,
  DomainVariant,
  SolidAssessment,
  PatternRelation,
  CodeImplementation,
  Question,
  QuizOption,
} from './pattern-types';

export type {
  Category,
  Perspective,
  Pattern,
  DomainVariant,
  SolidAssessment,
  PatternRelation,
  CodeImplementation,
  Question,
  QuizOption,
};

type PatternMeta = {
  id: string;
  name: string;
  category: Category;
  tagline: string;
  intent: string;
  memoryHook: string;
};

const PATTERN_METAS: PatternMeta[] = [
  {
    id: 'factory-method',
    name: 'Factory Method',
    category: 'Creational',
    tagline: 'Delegate object instantiation to subclasses through an overridable method call.',
    intent: 'Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.',
    memoryHook: 'Subclasses decide who gets instantiated.',
  },
  {
    id: 'abstract-factory',
    name: 'Abstract Factory',
    category: 'Creational',
    tagline: 'Produce compatible families of distinct products through a shared factory interface.',
    intent: 'Provide an interface for creating families of related or dependent objects without specifying their concrete classes.',
    memoryHook: 'Families of matched products without concrete classes.',
  },
  {
    id: 'builder',
    name: 'Builder',
    category: 'Creational',
    tagline: 'Construct complex objects step by step with staged configurations.',
    intent: 'Separate the construction of a complex object from its representation so that the same construction process can create different representations.',
    memoryHook: 'Step-by-step construction of complex representations.',
  },
  {
    id: 'prototype',
    name: 'Prototype',
    category: 'Creational',
    tagline: 'Create objects by cloning a configured prototype rather than rebuilding from scratch.',
    intent: 'Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.',
    memoryHook: 'Clone a configured starting point.',
  },
  {
    id: 'singleton',
    name: 'Singleton',
    category: 'Creational',
    tagline: 'Share one controlled instance of a resource across an application boundary.',
    intent: 'Ensure a class only has one instance, and provide a global point of access to it.',
    memoryHook: 'One instance, one global point of access.',
  },
  {
    id: 'adapter',
    name: 'Adapter',
    category: 'Structural',
    tagline: 'Translate an incompatible interface into the contract an existing client expects.',
    intent: 'Convert the interface of a class into another interface clients expect. Adapter lets classes work together that couldn’t otherwise because of incompatible interfaces.',
    memoryHook: 'Translate one contract into another.',
  },
  {
    id: 'bridge',
    name: 'Bridge',
    category: 'Structural',
    tagline: 'Separate a high-level abstraction from its platform-specific implementation.',
    intent: 'Decouple an abstraction from its implementation so that the two can vary independently.',
    memoryHook: 'Two orthogonal dimensions vary independently.',
  },
  {
    id: 'composite',
    name: 'Composite',
    category: 'Structural',
    tagline: 'Give individual leaves and composite groups the same interface in a recursive tree.',
    intent: 'Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.',
    memoryHook: 'Treat a branch like a leaf.',
  },
  {
    id: 'decorator',
    name: 'Decorator',
    category: 'Structural',
    tagline: 'Layer optional responsibilities around an object dynamically while preserving its interface.',
    intent: 'Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.',
    memoryHook: 'Wrap an object to add responsibilities dynamically.',
  },
  {
    id: 'facade',
    name: 'Facade',
    category: 'Structural',
    tagline: 'Offer one simplified, high-level entry point to a complex subsystem.',
    intent: 'Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.',
    memoryHook: 'One front door to a complex subsystem.',
  },
  {
    id: 'flyweight',
    name: 'Flyweight',
    category: 'Structural',
    tagline: 'Share intrinsic immutable state while keeping contextual extrinsic state external.',
    intent: 'Use sharing to support large numbers of fine-grained objects efficiently.',
    memoryHook: 'Share immutable intrinsic state to save RAM.',
  },
  {
    id: 'proxy',
    name: 'Proxy',
    category: 'Structural',
    tagline: 'Stand in for a service object to control access, caching, or lazy initialization.',
    intent: 'Provide a surrogate or placeholder for another object to control access to it.',
    memoryHook: 'A controlled stand-in managing access and lifecycle.',
  },
  {
    id: 'chain-of-responsibility',
    name: 'Chain of Responsibility',
    category: 'Behavioral',
    tagline: 'Pass requests along a chain of handlers until one handles it or the pipeline completes.',
    intent: 'Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain.',
    memoryHook: 'Pass the request down the pipeline until handled.',
  },
  {
    id: 'command',
    name: 'Command',
    category: 'Behavioral',
    tagline: 'Transform an action into a standalone object containing its parameters and undo logic.',
    intent: 'Encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.',
    memoryHook: 'Actions packaged as executable, undoable objects.',
  },
  {
    id: 'iterator',
    name: 'Iterator',
    category: 'Behavioral',
    tagline: 'Traverse elements of a collection without exposing its underlying representation.',
    intent: 'Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.',
    memoryHook: 'Next, next, next — without exposing internals.',
  },
  {
    id: 'mediator',
    name: 'Mediator',
    category: 'Behavioral',
    tagline: 'Route interactions through a central coordinator instead of direct component mesh.',
    intent: 'Define an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly.',
    memoryHook: 'Air traffic control for chatty peer components.',
  },
  {
    id: 'memento',
    name: 'Memento',
    category: 'Behavioral',
    tagline: 'Capture private snapshots that can be restored later without violating encapsulation.',
    intent: 'Without violating encapsulation, capture and externalize an object’s internal state so that the object can be restored to this state later.',
    memoryHook: 'Opaque savegame checkpoint without breaking encapsulation.',
  },
  {
    id: 'observer',
    name: 'Observer',
    category: 'Behavioral',
    tagline: 'Publish state change notifications to multiple dynamic subscribers automatically.',
    intent: 'Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.',
    memoryHook: 'Don’t call us, we’ll notify you when state changes.',
  },
  {
    id: 'state',
    name: 'State',
    category: 'Behavioral',
    tagline: 'Encapsulate state-specific behavior and transitions into discrete state classes.',
    intent: 'Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.',
    memoryHook: 'Behavior changes dynamically as internal state flips.',
  },
  {
    id: 'strategy',
    name: 'Strategy',
    category: 'Behavioral',
    tagline: 'Define a family of interchangeable algorithms and swap them inside a context at runtime.',
    intent: 'Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.',
    memoryHook: 'Interchangeable algorithms behind one interface.',
  },
  {
    id: 'template-method',
    name: 'Template Method',
    category: 'Behavioral',
    tagline: 'Fix the algorithm workflow in a superclass while deferring specific steps to subclasses.',
    intent: 'Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps without changing the algorithm’s structure.',
    memoryHook: 'Algorithm skeleton in a superclass, step hooks in subclasses.',
  },
  {
    id: 'visitor',
    name: 'Visitor',
    category: 'Behavioral',
    tagline: 'Add new operations to a stable object hierarchy without modifying element classes.',
    intent: 'Represent an operation to be performed on the elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements on which it operates.',
    memoryHook: 'Double dispatch for external operations on heterogeneous trees.',
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    category: 'Behavioral',
    tagline: 'Evaluate sentences in a domain language using a compositional grammar syntax tree.',
    intent: 'Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.',
    memoryHook: 'Grammar trees evaluate sentences in a domain language.',
  },
];

export const PATTERNS: Pattern[] = PATTERN_METAS.map((meta) => {
  const canonical = CANONICAL_DATA[meta.id];
  const enterprise = ENTERPRISE_DATA[meta.id];
  const tradeoffs = TRADEOFFS_DATA[meta.id];

  if (!canonical || !enterprise || !tradeoffs) {
    throw new Error(`Incomplete pattern dataset configuration for: ${meta.id}`);
  }

  return {
    id: meta.id,
    name: meta.name,
    category: meta.category,
    tagline: meta.tagline,
    intent: meta.intent,
    memoryHook: meta.memoryHook,
    canonical,
    enterprise,
    solidPrinciples: tradeoffs.solidPrinciples,
    confusedWith: tradeoffs.confusedWith,
    interviewTraps: tradeoffs.interviewTraps,

    // Backward-compatible fallback accessors
    problem: canonical.problem,
    solution: canonical.solution,
    whenToUse: canonical.whenToUse,
    whenNotToUse: canonical.whenNotToUse,
    realWorldEnterpriseScenario: enterprise.scenario,
    asciiShape: canonical.asciiShape,
    typeScriptImplementation: canonical.typeScript,
    javaImplementation: canonical.java,
    runnableCode: canonical.typeScript.code,
  };
});

export const QUIZ: Question[] = [
  {
    id: 'q1',
    scenarioNumber: 1,
    category: 'Behavioral',
    difficulty: 'Senior',
    title: 'Multi-Vendor Payment Processing Engine',
    systemScenario:
      'You are designing the checkout module for an enterprise e-commerce platform. The system must support credit card payments via Stripe, deferred financing via Klarna, and crypto settlements. The core checkout workflow must remain identical regardless of the payment method, and new payment providers must be pluggable via configuration without touching checkout logic.',
    architecturalConstraints: [
      'Zero modifications to checkout order processing classes when adding vendors.',
      'Payment provider selected dynamically based on user checkout choices.',
      'Algorithms vary in communication and verification protocols.',
    ],
    options: [
      {
        id: 'opt1',
        patternName: 'Template Method',
        isCorrect: false,
        distractorRationale: 'Template Method relies on inheritance for a fixed sequence and is a poor fit for interchangeable payment rules.',
      },
      { id: 'opt2', patternName: 'Strategy', isCorrect: true, distractorRationale: '' },
      {
        id: 'opt3',
        patternName: 'Observer',
        isCorrect: false,
        distractorRationale: 'Observer broadcasts change notifications; it does not encapsulate an interchangeable payment algorithm.',
      },
      {
        id: 'opt4',
        patternName: 'Abstract Factory',
        isCorrect: false,
        distractorRationale: 'Abstract Factory creates compatible families of products, not one swappable payment algorithm.',
      },
    ],
    correctPattern: 'Strategy',
    deepExplanation:
      'Payment providers are alternative algorithms selected per checkout. A common strategy interface keeps the workflow stable while allowing Stripe, Klarna, and crypto implementations to vary independently.',
    memoryRule: 'Interchangeable algorithm chosen by the client = Strategy.',
  },
  {
    id: 'q2',
    scenarioNumber: 2,
    category: 'Structural',
    difficulty: 'Senior',
    title: 'Third-Party Metric Exporter Incompatibility',
    systemScenario:
      'A platform telemetry service expects recordMetric(name, value), but a third-party vendor SDK exposes sendCounter(metricKey, amount). The SDK cannot be changed. Several exporters may be integrated over time, and product code should continue speaking its own telemetry interface.',
    architecturalConstraints: [
      'Keep the platform-owned interface stable.',
      'Translate the vendor SDK shape at the boundary.',
      'Do not add vendor-specific branches to the telemetry service.',
    ],
    options: [
      {
        id: 'opt1',
        patternName: 'Proxy',
        isCorrect: false,
        distractorRationale: 'A proxy controls access to an object with the same interface; this mismatch needs translation.',
      },
      {
        id: 'opt2',
        patternName: 'Facade',
        isCorrect: false,
        distractorRationale: 'A facade simplifies a subsystem; here the key pressure is incompatible interfaces.',
      },
      { id: 'opt3', patternName: 'Adapter', isCorrect: true, distractorRationale: '' },
      {
        id: 'opt4',
        patternName: 'Decorator',
        isCorrect: false,
        distractorRationale: 'A decorator adds behavior while retaining an interface; it does not translate this contract.',
      },
    ],
    correctPattern: 'Adapter',
    deepExplanation:
      'The vendor cannot change its API and the application contract must remain stable. An adapter implements the platform target, then translates each call to the vendor SDK.',
    memoryRule: 'Same purpose, incompatible interface = Adapter.',
  },
  {
    id: 'q3',
    scenarioNumber: 3,
    category: 'Creational',
    difficulty: 'Senior',
    title: 'Complex Query Specification Construction',
    systemScenario:
      'An analytics API builds query specifications from a required data source plus optional projections, filters, grouping, sort order, pagination, and timeout settings. Callers currently pass long positional argument lists, and invalid partial queries reach the database.',
    architecturalConstraints: [
      'Make optional configuration readable at the call site.',
      'Validate required settings once before execution.',
      'The final query object should be immutable.',
    ],
    options: [
      {
        id: 'opt1',
        patternName: 'Factory Method',
        isCorrect: false,
        distractorRationale: 'Factory Method selects a concrete product implementation; the issue here is staged configuration.',
      },
      {
        id: 'opt2',
        patternName: 'Abstract Factory',
        isCorrect: false,
        distractorRationale: 'There are no compatible product families to create.',
      },
      { id: 'opt3', patternName: 'Builder', isCorrect: true, distractorRationale: '' },
      {
        id: 'opt4',
        patternName: 'Prototype',
        isCorrect: false,
        distractorRationale: 'Cloning an existing query does not address clear optional configuration and validation.',
      },
    ],
    correctPattern: 'Builder',
    deepExplanation:
      'Many optional query parameters make telescoping constructors error-prone. A builder provides a readable, staged API and validates required fields at build time before producing an immutable specification.',
    memoryRule: 'Many optional construction steps = Builder.',
  },
];
