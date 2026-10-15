import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { db, decisionLedgerTable, desc, eq } from "@workspace/db";

const router: IRouter = Router();

const ConsultSchema = z.object({
  problemStatement: z.string().min(15, "Problem statement must be at least 15 characters"),
  turns: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional().default([]),
});

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

const SYSTEM_PROMPT = `You are a Principal Software Architect and authoritative expert on the Gang of Four (GoF) Design Patterns.
Your sole responsibility is analyzing software architectural problems and recommending the optimal GoF design pattern.

CRITICAL DIRECTIVES:
1. Output MUST BE strictly valid JSON matching this exact structure without markdown backticks or commentary:
{
  "primaryPattern": {
    "id": "canonical-kebab-id",
    "name": "Full Pattern Name",
    "category": "Creational" | "Structural" | "Behavioral",
    "confidence": 92,
    "architecturalRationale": "Concise architectural explanation of why this pattern solves the primary axis of change.",
    "structuralApplicability": "How classes and interfaces collaborate to resolve the problem."
  },
  "runnerUpPattern": {
    "id": "canonical-kebab-id",
    "name": "Runner Up Pattern Name",
    "category": "Creational" | "Structural" | "Behavioral",
    "confidence": 76,
    "whyConsidered": "What overlapping structural traits made this candidate relevant.",
    "whenToChooseRunnerUpOverPrimary": "The decisive pivot condition when a developer should choose the runner-up instead."
  },
  "tradeOffDilemma": {
    "primaryGains": ["Gain 1", "Gain 2", "Gain 3"],
    "primaryTaxes": ["Drawback / Cost 1", "Drawback / Cost 2"],
    "decisiveDifferentiator": "The razor-sharp rule separating Primary from Runner-Up."
  },
  "codeSmellWarning": "Specific anti-pattern or code smell to avoid."
}`;

/**
 * Dynamic Model Discovery & Deprecation Shield
 * Prevents hardcoded model obsolescence when Google sunsets or renames model versions.
 */
let cachedGeminiModel: string | null = null;
let lastModelCheckTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // Cache active model for 6 hours

async function resolveActiveGeminiModel(apiKey: string): Promise<string> {
  // 1. Allow explicit DevOps override via environment variables
  const configuredModel = process.env.AI_MODEL || process.env.GEMINI_MODEL;
  if (configuredModel) return configuredModel;

  const now = Date.now();
  if (cachedGeminiModel && now - lastModelCheckTime < CACHE_TTL_MS) {
    return cachedGeminiModel;
  }

  // 2. Query upstream provider model catalog dynamically
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = (await res.json()) as {
        models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
      };
      const flashModels = (data.models || [])
        .filter(
          (m) =>
            m.name &&
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("flash") &&
            !/image|audio|embed|robotics/i.test(m.name)
        )
        .map((m) => m.name!.replace(/^models\//, ""));

      if (flashModels.length > 0) {
        flashModels.sort((a, b) => b.localeCompare(a));
        cachedGeminiModel = flashModels[0];
        lastModelCheckTime = now;
        return cachedGeminiModel;
      }
    }
  } catch {
    // Non-blocking fallback if model catalog cannot be reached
  }

  return "gemini-2.5-flash";
}

/**
 * Server-Side Built-in Pro AI Architect Endpoint
 * No user API key required — authenticated via Better Auth session cookie.
 */
router.post("/api/ai/architect-consult", requireAuth, async (req, res, next) => {
  try {
    const parseResult = ConsultSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.flatten() });
      return;
    }

    const { problemStatement, turns } = parseResult.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let verdict: GoFDecisionVerdict;
    let engineLabel = "Built-in Architectural Pro (Dev Mode)";

    if (apiKey) {
      const contents = [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n<user_problem>${problemStatement}</user_problem>` }],
        },
        ...turns.map((t) => ({
          role: t.role === "assistant" ? "model" : "user",
          parts: [{ text: t.content }],
        })),
      ];

      // Dynamic resolution: prevents hardcoded model deprecation breakages
      let activeModel = await resolveActiveGeminiModel(apiKey);
      let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

      let response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      // Self-healing: If model was sunset (404), flush cache and fall back
      if (response.status === 404) {
        cachedGeminiModel = null;
        lastModelCheckTime = 0;
        activeModel = "gemini-1.5-flash";
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        });
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Upstream AI provider error (${response.status}): ${errorBody}`);
      }

      const json = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty response received from server AI model.");
      }
      verdict = JSON.parse(rawText) as GoFDecisionVerdict;
      engineLabel = `Google Cloud (${activeModel})`;
    } else {
      // High-Fidelity Architectural Mock when server environment key is not configured
      verdict = generateDeterministicVerdict(problemStatement);
    }

    const { user } = req as AuthenticatedRequest;

    // Persist consultation to user's decision ledger in PostgreSQL
    if (user?.id) {
      try {
        await db.insert(decisionLedgerTable).values({
          userId: user.id,
          problemStatement,
          primaryPattern: verdict.primaryPattern.name,
          runnerUpPattern: verdict.runnerUpPattern.name,
          confidence: verdict.primaryPattern.confidence,
          tradeOffs: [
            ...verdict.tradeOffDilemma.primaryGains,
            `Cost: ${verdict.tradeOffDilemma.primaryTaxes.join("; ")}`,
          ],
        });
      } catch (ledgerError) {
        req.log.warn({ err: ledgerError }, "Failed to write decision verdict to ledger");
      }
    }

    res.json({
      verdict,
      mode: "managed-pro",
      engine: engineLabel,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get user's cloud-synchronized decision history
 */
router.get("/api/ai/decision-ledger", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const entries = await db
      .select()
      .from(decisionLedgerTable)
      .where(eq(decisionLedgerTable.userId, user.id))
      .orderBy(desc(decisionLedgerTable.createdAt))
      .limit(50);

    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

function generateDeterministicVerdict(problem: string): GoFDecisionVerdict {
  const lower = problem.toLowerCase();

  if (lower.includes("pricing") || lower.includes("discount") || lower.includes("algorithm") || lower.includes("policy")) {
    return {
      primaryPattern: {
        id: "strategy",
        name: "Strategy",
        category: "Behavioral",
        confidence: 94,
        architecturalRationale: "Encapsulates distinct interchangeable calculation algorithms behind a uniform interface, eliminating complex conditional branching.",
        structuralApplicability: "Define a Strategy interface with concrete algorithmic variations injected at runtime into the Context.",
      },
      runnerUpPattern: {
        id: "state",
        name: "State",
        category: "Behavioral",
        confidence: 72,
        whyConsidered: "Both patterns utilize composition to delegate behavior to polymorphic classes.",
        whenToChooseRunnerUpOverPrimary: "Choose State if behavior transitions automatically based on internal lifecycle state mutations rather than caller selection.",
      },
      tradeOffDilemma: {
        primaryGains: ["Eliminates multi-branch conditionals", "Open/Closed for new calculation rules", "Isolated unit testing"],
        primaryTaxes: ["Increases object count", "Callers must understand algorithmic differences"],
        decisiveDifferentiator: "Strategy switches algorithms externally; State transitions behavior intrinsically.",
      },
      codeSmellWarning: "Avoid passing giant data blobs down to strategies; pass only the explicit parameters required.",
    };
  }

  if (lower.includes("undo") || lower.includes("redo") || lower.includes("command") || lower.includes("queue") || lower.includes("transaction")) {
    return {
      primaryPattern: {
        id: "command",
        name: "Command",
        category: "Behavioral",
        confidence: 92,
        architecturalRationale: "Encapsulates an operation as an object, enabling parameterization of clients, queuing, logging, and reversible operations.",
        structuralApplicability: "Declare Command interface with execute() and undo(). Invoker stores execution history stacks.",
      },
      runnerUpPattern: {
        id: "memento",
        name: "Memento",
        category: "Behavioral",
        confidence: 70,
        whyConsidered: "Both support undo/rollback capabilities.",
        whenToChooseRunnerUpOverPrimary: "Choose Memento when undoing requires restoring complete internal snapshots rather than reversing discrete operational verbs.",
      },
      tradeOffDilemma: {
        primaryGains: ["Decouples invoker from executor", "Trivial undo/redo command stack", "Macro command composition"],
        primaryTaxes: ["Proliferation of small discrete command classes"],
        decisiveDifferentiator: "Command encapsulates the action verb; Memento captures the state snapshot.",
      },
      codeSmellWarning: "Do not let Commands leak business logic outside domain boundaries.",
    };
  }

  // Fallback to Factory Method / Abstract Factory
  return {
    primaryPattern: {
      id: "factory-method",
      name: "Factory Method",
      category: "Creational",
      confidence: 88,
      architecturalRationale: "Decouples object creation from consumption, allowing subclasses and configuration to dictate concrete product instantiation.",
      structuralApplicability: "Creator defines an abstract factoryMethod() that returns an abstract Product interface.",
    },
    runnerUpPattern: {
      id: "abstract-factory",
      name: "Abstract Factory",
      category: "Creational",
      confidence: 78,
      whyConsidered: "Both abstract object creation behind interfaces.",
      whenToChooseRunnerUpOverPrimary: "Choose Abstract Factory when you must instantiate coordinated families of related products rather than a single product hierarchy.",
    },
    tradeOffDilemma: {
      primaryGains: ["Eliminates tight coupling to concrete classes", "Single Responsibility for creation", "Open/Closed Principle"],
      primaryTaxes: ["Requires additional creator subclass hierarchies"],
      decisiveDifferentiator: "Factory Method creates one product; Abstract Factory creates families of related products.",
    },
    codeSmellWarning: "Avoid using Factory Method when a simple parameterized constructor satisfies the requirements.",
  };
}

export default router;
