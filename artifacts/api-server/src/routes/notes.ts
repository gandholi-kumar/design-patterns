import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { notesController } from "../controllers/notes.controller";

const router: IRouter = Router();

// 1. Get note for a specific pattern
router.get("/patterns/:patternId/notes", requireAuth, (req, res, next) =>
  notesController.getNote(req, res, next)
);

// 2. Upsert note for a specific pattern
router.put("/patterns/:patternId/notes", requireAuth, (req, res, next) =>
  notesController.upsertNote(req, res, next)
);

// 3. Delete note for a specific pattern
router.delete("/patterns/:patternId/notes", requireAuth, (req, res, next) =>
  notesController.deleteNote(req, res, next)
);

// 4. List all notes for current user
router.get("/notes", requireAuth, (req, res, next) =>
  notesController.listNotes(req, res, next)
);

export default router;
