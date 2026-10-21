import { decisionRepository } from "../repositories/decision.repository";

export interface GoFDecisionVerdict {
  primaryPattern: {
    id: string;
    name: string;
    category: "Creational" | "Structural" | "Behavioral";
    confidence: number;
    architecturalRationale: string;
    structuralApplicability: string;
  };
  runnerUpPattern: {
    id: string;
    name: string;
    category: "Creational" | "Structural" | "Behavioral";
    confidence: number;
    whyConsidered: string;
    whenToChooseRunnerUpOverPrimary: string;
  };
  tradeOffDilemma: {
    primaryGains: string[];
    primaryTaxes: string[];
    decisiveDifferentiator: string;
  };
  codeSmellWarning: string;
}

export class DecisionService {
  generateDeterministicVerdict(problem: string): GoFDecisionVerdict {
    const lower = problem.toLowerCase();

    if (
      lower.includes("pricing") ||
      lower.includes("discount") ||
      lower.includes("algorithm") ||
      lower.includes("policy")
    ) {
      return {
        primaryPattern: {
          id: "strategy",
          name: "Strategy",
          category: "Behavioral",
          confidence: 94,
          architecturalRationale:
            "Encapsulates distinct interchangeable calculation algorithms behind a uniform interface, eliminating complex conditional branching.",
          structuralApplicability:
            "Define a Strategy interface with concrete algorithmic variations injected at runtime into the Context.",
        },
        runnerUpPattern: {
          id: "state",
          name: "State",
          category: "Behavioral",
          confidence: 72,
          whyConsidered: "Both patterns utilize composition to delegate behavior to polymorphic classes.",
          whenToChooseRunnerUpOverPrimary:
            "Choose State if behavior transitions automatically based on internal lifecycle state mutations rather than caller selection.",
        },
        tradeOffDilemma: {
          primaryGains: [
            "Eliminates multi-branch conditionals",
            "Open/Closed for new calculation rules",
            "Isolated unit testing",
          ],
          primaryTaxes: [
            "Increases object count",
            "Callers must understand algorithmic differences",
          ],
          decisiveDifferentiator:
            "Strategy switches algorithms externally; State transitions behavior intrinsically.",
        },
        codeSmellWarning:
          "Avoid passing giant data blobs down to strategies; pass only the explicit parameters required.",
      };
    }

    if (
      lower.includes("undo") ||
      lower.includes("redo") ||
      lower.includes("command") ||
      lower.includes("queue") ||
      lower.includes("transaction")
    ) {
      return {
        primaryPattern: {
          id: "command",
          name: "Command",
          category: "Behavioral",
          confidence: 92,
          architecturalRationale:
            "Encapsulates an operation as an object, enabling parameterization of clients, queuing, logging, and reversible operations.",
          structuralApplicability:
            "Declare Command interface with execute() and undo(). Invoker stores execution history stacks.",
        },
        runnerUpPattern: {
          id: "memento",
          name: "Memento",
          category: "Behavioral",
          confidence: 70,
          whyConsidered: "Both support undo/rollback capabilities.",
          whenToChooseRunnerUpOverPrimary:
            "Choose Memento when undoing requires restoring complete internal snapshots rather than reversing discrete operational verbs.",
        },
        tradeOffDilemma: {
          primaryGains: [
            "Decouples invoker from executor",
            "Trivial undo/redo command stack",
            "Macro command composition",
          ],
          primaryTaxes: ["Proliferation of small discrete command classes"],
          decisiveDifferentiator:
            "Command encapsulates the action verb; Memento captures the state snapshot.",
        },
        codeSmellWarning: "Do not let Commands leak business logic outside domain boundaries.",
      };
    }

    // Default Fallback
    return {
      primaryPattern: {
        id: "factory-method",
        name: "Factory Method",
        category: "Creational",
        confidence: 88,
        architecturalRationale:
          "Decouples object creation from consumption, allowing subclasses and configuration to dictate concrete product instantiation.",
        structuralApplicability:
          "Creator defines an abstract factoryMethod() that returns an abstract Product interface.",
      },
      runnerUpPattern: {
        id: "abstract-factory",
        name: "Abstract Factory",
        category: "Creational",
        confidence: 78,
        whyConsidered: "Both abstract object creation behind interfaces.",
        whenToChooseRunnerUpOverPrimary:
          "Choose Abstract Factory when you must instantiate coordinated families of related products rather than a single product hierarchy.",
      },
      tradeOffDilemma: {
        primaryGains: [
          "Eliminates tight coupling to concrete classes",
          "Single Responsibility for creation",
          "Open/Closed Principle",
        ],
        primaryTaxes: ["Requires additional creator subclass hierarchies"],
        decisiveDifferentiator:
          "Factory Method creates one product; Abstract Factory creates families of related products.",
      },
      codeSmellWarning:
        "Avoid using Factory Method when a simple parameterized constructor satisfies the requirements.",
    };
  }

  async recordDecision(params: {
    userId: string;
    problemStatement: string;
    primaryPattern: string;
    runnerUpPattern: string;
    confidence: number;
    tradeOffs: string[];
  }) {
    return decisionRepository.recordDecision(params);
  }

  async getDecisionLedger(userId: string) {
    return decisionRepository.getLedgerByUserId(userId);
  }
}

export const decisionService = new DecisionService();
