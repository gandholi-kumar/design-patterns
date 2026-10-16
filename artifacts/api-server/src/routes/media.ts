import express, { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { mediaController } from "../controllers/media.controller";

const router: IRouter = Router();

// 1. Direct binary upload endpoint for notes screenshots and diagrams
router.post(
  "/upload",
  requireAuth,
  express.raw({ type: "*/*", limit: "50mb" }),
  (req, res, next) => mediaController.uploadMedia(req, res, next)
);

// 2. Serve media asset directly from MinIO
router.get("/:assetId", (req, res, next) =>
  mediaController.serveMedia(req, res, next)
);

// 3. Delete media asset
router.delete("/:assetId", requireAuth, (req, res, next) =>
  mediaController.deleteMedia(req, res, next)
);

export default router;
