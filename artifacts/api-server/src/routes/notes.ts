import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { db, patternNotesTable, eq, and } from "@workspace/db";

const router: IRouter = Router();

const UpsertNoteSchema = z.object({
  blocks: z.array(z.record(z.unknown())),
});

function getPatternId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
}

// 1. Get note for a specific pattern
router.get("/patterns/:patternId/notes", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const patternId = getPatternId(req.params.patternId);

    const [note] = await db
      .select()
      .from(patternNotesTable)
      .where(and(eq(patternNotesTable.userId, user.id), eq(patternNotesTable.patternId, patternId)));

    if (!note) {
      return res.status(404).json({
        code: "NOTE_NOT_FOUND",
        message: `Note for pattern '${patternId}' does not exist`,
      });
    }

    return res.status(200).json({
      patternId: note.patternId,
      blocks: note.blocks,
      version: note.version,
      lastModified: note.updatedAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

// 2. Upsert note for a specific pattern
router.put("/patterns/:patternId/notes", requireAuth, async (req, res, next) => {
  try {
    const parsed = UpsertNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        code: "INVALID_NOTE",
        message: "Invalid note document payload",
        details: parsed.error.format(),
      });
    }

    const { user } = req as AuthenticatedRequest;
    const patternId = getPatternId(req.params.patternId);
    const { blocks } = parsed.data;

    const [saved] = await db
      .insert(patternNotesTable)
      .values({
        userId: user.id,
        patternId,
        blocks,
        version: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [patternNotesTable.userId, patternNotesTable.patternId],
        set: {
          blocks,
          updatedAt: new Date(),
        },
      })
      .returning();

    return res.status(200).json({
      patternId: saved.patternId,
      blocks: saved.blocks,
      version: saved.version,
      lastModified: saved.updatedAt.toISOString(),
    });
  } catch (err) {
    return next(err);
  }
});

// 3. Delete note for a specific pattern
router.delete("/patterns/:patternId/notes", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const patternId = getPatternId(req.params.patternId);

    await db
      .delete(patternNotesTable)
      .where(and(eq(patternNotesTable.userId, user.id), eq(patternNotesTable.patternId, patternId)));

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

// 4. List all notes for current user
router.get("/notes", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;

    const notes = await db
      .select()
      .from(patternNotesTable)
      .where(eq(patternNotesTable.userId, user.id));

    const formatted = notes.map((n) => ({
      patternId: n.patternId,
      blocks: n.blocks,
      version: n.version,
      lastModified: n.updatedAt.toISOString(),
    }));

    return res.status(200).json({
      notes: formatted,
      total: formatted.length,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
