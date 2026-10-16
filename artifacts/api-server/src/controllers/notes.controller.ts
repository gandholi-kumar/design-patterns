import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { notesService } from "../services/notes.service";

const UpsertNoteSchema = z.object({
  blocks: z.array(z.record(z.unknown())),
});

function getPatternId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
}

export class NotesController {
  async getNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const patternId = getPatternId(req.params.patternId);

      const note = await notesService.getNote(user.id, patternId);
      if (!note) {
        return res.status(404).json({
          code: "NOTE_NOT_FOUND",
          message: `Note for pattern '${patternId}' does not exist`,
        });
      }

      return res.status(200).json(note);
    } catch (err) {
      return next(err);
    }
  }

  async upsertNote(req: Request, res: Response, next: NextFunction) {
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

      const saved = await notesService.saveNote(user.id, patternId, blocks);
      return res.status(200).json(saved);
    } catch (err) {
      return next(err);
    }
  }

  async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const patternId = getPatternId(req.params.patternId);

      await notesService.deleteNote(user.id, patternId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  async listNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req as AuthenticatedRequest;
      const result = await notesService.listNotes(user.id);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

export const notesController = new NotesController();
