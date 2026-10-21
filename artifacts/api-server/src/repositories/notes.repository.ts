import { db, patternNotesTable, eq, and } from "@workspace/db";

export class NotesRepository {
  async findByPatternId(userId: string, patternId: string) {
    const [note] = await db
      .select()
      .from(patternNotesTable)
      .where(and(eq(patternNotesTable.userId, userId), eq(patternNotesTable.patternId, patternId)));

    return note || null;
  }

  async upsertNote(params: {
    userId: string;
    patternId: string;
    blocks: unknown[];
  }) {
    const [saved] = await db
      .insert(patternNotesTable)
      .values({
        userId: params.userId,
        patternId: params.patternId,
        blocks: params.blocks,
        version: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [patternNotesTable.userId, patternNotesTable.patternId],
        set: {
          blocks: params.blocks,
          updatedAt: new Date(),
        },
      })
      .returning();

    return saved;
  }

  async deleteByPatternId(userId: string, patternId: string) {
    await db
      .delete(patternNotesTable)
      .where(and(eq(patternNotesTable.userId, userId), eq(patternNotesTable.patternId, patternId)));
  }

  async findAllByUserId(userId: string) {
    const notes = await db
      .select()
      .from(patternNotesTable)
      .where(eq(patternNotesTable.userId, userId));

    return notes;
  }
}

export const notesRepository = new NotesRepository();
