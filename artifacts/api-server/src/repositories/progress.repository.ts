import { db, userProgressTable, userBookmarksTable, eq, and } from "@workspace/db";

export interface ProgressData {
  attempts: number;
  correct: number;
  box: number;
  note: string;
}

export class ProgressRepository {
  async getProgressByUserId(userId: string): Promise<Record<string, ProgressData>> {
    const rows = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.userId, userId));

    const progressMap: Record<string, ProgressData> = {};
    for (const row of rows) {
      progressMap[row.patternId] = {
        attempts: row.attempts,
        correct: row.correct,
        box: row.box,
        note: row.note || "",
      };
    }
    return progressMap;
  }

  async upsertProgress(params: {
    userId: string;
    patternId: string;
    attempts: number;
    correct: number;
    box: number;
    note: string;
  }) {
    const [record] = await db
      .insert(userProgressTable)
      .values({
        userId: params.userId,
        patternId: params.patternId,
        attempts: params.attempts,
        correct: params.correct,
        box: params.box,
        note: params.note,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgressTable.userId, userProgressTable.patternId],
        set: {
          attempts: params.attempts,
          correct: params.correct,
          box: params.box,
          note: params.note,
          updatedAt: new Date(),
        },
      })
      .returning();

    return record;
  }

  async getBookmarksByUserId(userId: string): Promise<string[]> {
    const rows = await db
      .select({ patternId: userBookmarksTable.patternId })
      .from(userBookmarksTable)
      .where(eq(userBookmarksTable.userId, userId));

    return rows.map((r) => r.patternId);
  }

  async toggleBookmark(userId: string, patternId: string): Promise<{ bookmarked: boolean; patternId: string }> {
    const [existing] = await db
      .select()
      .from(userBookmarksTable)
      .where(and(eq(userBookmarksTable.userId, userId), eq(userBookmarksTable.patternId, patternId)));

    if (existing) {
      await db
        .delete(userBookmarksTable)
        .where(and(eq(userBookmarksTable.userId, userId), eq(userBookmarksTable.patternId, patternId)));
      return { bookmarked: false, patternId };
    } else {
      await db.insert(userBookmarksTable).values({
        userId,
        patternId,
      });
      return { bookmarked: true, patternId };
    }
  }
}

export const progressRepository = new ProgressRepository();
