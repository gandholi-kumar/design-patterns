import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { db, userProgressTable, userBookmarksTable, eq, and } from "@workspace/db";


const router: IRouter = Router();

const UpsertProgressSchema = z.object({
  patternId: z.string().min(1),
  attempts: z.number().int().default(0),
  correct: z.number().int().default(0),
  box: z.number().int().min(1).max(5).default(1),
  note: z.string().default(""),
});

const ToggleBookmarkSchema = z.object({
  patternId: z.string().min(1),
});

// 1. Get all learning progress for authenticated user
router.get("/progress", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const progressRows = await db
      .select()
      .from(userProgressTable)
      .where(eq(userProgressTable.userId, user.id));

    const progressMap: Record<string, { attempts: number; correct: number; box: number; note: string }> = {};
    for (const row of progressRows) {
      progressMap[row.patternId] = {
        attempts: row.attempts,
        correct: row.correct,
        box: row.box,
        note: row.note || "",
      };
    }

    return res.status(200).json({ progress: progressMap });
  } catch (err) {
    return next(err);
  }
});

// 2. Upsert progress for a pattern
router.put("/progress", requireAuth, async (req, res, next) => {
  try {
    const parsed = UpsertProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Invalid progress payload", details: parsed.error.format() },
      });
    }

    const { user } = req as AuthenticatedRequest;
    const { patternId, attempts, correct, box, note } = parsed.data;

    const [record] = await db
      .insert(userProgressTable)
      .values({
        userId: user.id,
        patternId,
        attempts,
        correct,
        box,
        note,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgressTable.userId, userProgressTable.patternId],
        set: {
          attempts,
          correct,
          box,
          note,
          updatedAt: new Date(),
        },
      })
      .returning();

    return res.status(200).json(record);
  } catch (err) {
    return next(err);
  }
});

// 3. Get all bookmarks for authenticated user
router.get("/bookmarks", requireAuth, async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const bookmarkRows = await db
      .select({ patternId: userBookmarksTable.patternId })
      .from(userBookmarksTable)
      .where(eq(userBookmarksTable.userId, user.id));

    return res.status(200).json(bookmarkRows.map((r) => r.patternId));
  } catch (err) {
    return next(err);
  }
});

// 4. Toggle bookmark for a pattern
router.post("/bookmarks", requireAuth, async (req, res, next) => {
  try {
    const parsed = ToggleBookmarkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Invalid bookmark payload", details: parsed.error.format() },
      });
    }

    const { user } = req as AuthenticatedRequest;
    const { patternId } = parsed.data;

    const [existing] = await db
      .select()
      .from(userBookmarksTable)
      .where(and(eq(userBookmarksTable.userId, user.id), eq(userBookmarksTable.patternId, patternId)));

    if (existing) {
      await db
        .delete(userBookmarksTable)
        .where(and(eq(userBookmarksTable.userId, user.id), eq(userBookmarksTable.patternId, patternId)));
      return res.status(200).json({ bookmarked: false, patternId });
    } else {
      await db.insert(userBookmarksTable).values({
        userId: user.id,
        patternId,
      });
      return res.status(200).json({ bookmarked: true, patternId });
    }
  } catch (err) {
    return next(err);
  }
});

export default router;
