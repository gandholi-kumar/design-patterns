import { db, decisionLedgerTable, desc, eq } from "@workspace/db";

export interface CreateDecisionParams {
  userId: string;
  problemStatement: string;
  primaryPattern: string;
  runnerUpPattern: string;
  confidence: number;
  tradeOffs: string[];
}

export class DecisionRepository {
  async recordDecision(params: CreateDecisionParams) {
    const [record] = await db
      .insert(decisionLedgerTable)
      .values({
        userId: params.userId,
        problemStatement: params.problemStatement,
        primaryPattern: params.primaryPattern,
        runnerUpPattern: params.runnerUpPattern,
        confidence: params.confidence,
        tradeOffs: params.tradeOffs,
      })
      .returning();

    return record;
  }

  async getLedgerByUserId(userId: string, limit = 50) {
    const entries = await db
      .select()
      .from(decisionLedgerTable)
      .where(eq(decisionLedgerTable.userId, userId))
      .orderBy(desc(decisionLedgerTable.createdAt))
      .limit(limit);

    return entries;
  }
}

export const decisionRepository = new DecisionRepository();
