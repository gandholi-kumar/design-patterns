import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { progressController } from "../controllers/progress.controller";

const router: IRouter = Router();

// 1. Get all learning progress for authenticated user
router.get("/progress", requireAuth, (req, res, next) =>
  progressController.getProgress(req, res, next)
);

// 2. Upsert progress for a pattern
router.put("/progress", requireAuth, (req, res, next) =>
  progressController.upsertProgress(req, res, next)
);

// 3. Get all bookmarks for authenticated user
router.get("/bookmarks", requireAuth, (req, res, next) =>
  progressController.getBookmarks(req, res, next)
);

// 4. Toggle bookmark for a pattern
router.post("/bookmarks", requireAuth, (req, res, next) =>
  progressController.toggleBookmark(req, res, next)
);

export default router;
