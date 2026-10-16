import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { progressService } from "../services/progress.service";

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

export class ProgressController {
  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const progress = await progressService.getProgress(user.id);
      return res.status(200).json({ progress });
    } catch (err) {
      return next(err);
    }
  }

  async upsertProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = UpsertProgressSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "INVALID_INPUT",
            message: "Invalid progress payload",
            details: parsed.error.format(),
          },
        });
      }

      const { user } = req as AuthenticatedRequest;
      const { patternId, attempts, correct, box, note } = parsed.data;

      const record = await progressService.saveProgress({
        userId: user.id,
        patternId,
        attempts,
        correct,
        box,
        note,
      });

      return res.status(200).json(record);
    } catch (err) {
      return next(err);
    }
  }

  async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const bookmarks = await progressService.getBookmarks(user.id);
      return res.status(200).json(bookmarks);
    } catch (err) {
      return next(err);
    }
  }

  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = ToggleBookmarkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            code: "INVALID_INPUT",
            message: "Invalid bookmark payload",
            details: parsed.error.format(),
          },
        });
      }

      const { user } = req as AuthenticatedRequest;
      const { patternId } = parsed.data;

      const result = await progressService.toggleBookmark(user.id, patternId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

export const progressController = new ProgressController();
