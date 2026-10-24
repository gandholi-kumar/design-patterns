import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { decisionService, type GoFDecisionVerdict } from "../services/decision.service";
import { decisionController } from "../controllers/decision.controller";

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

const aiConsultLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  message: "AI consultation rate limit reached. Please wait a minute before submitting further inquiries.",
});

/**
 * Server-Side Built-in Pro AI Architect Endpoint
 * No user API key required — authenticated via Better Auth session cookie.
 */
router.post("/ai/architect-consult", aiConsultLimiter, requireAuth, async (req, res, next) => {
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
      verdict = decisionService.generateDeterministicVerdict(problemStatement);
    }

    const { user } = req as AuthenticatedRequest;

    // Persist consultation to user's decision ledger in PostgreSQL via decisionService
    if (user?.id) {
      try {
        await decisionService.recordDecision({
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
router.get("/ai/decision-ledger", requireAuth, (req, res, next) =>
  decisionController.getLedger(req, res, next)
);

export default router;
