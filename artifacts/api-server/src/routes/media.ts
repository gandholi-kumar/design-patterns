import express, { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { storageService } from "../services/storage.service";
import { db, eq } from "@workspace/db";
import { mediaAssetsTable } from "@workspace/db/schema";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// 1. Direct binary upload endpoint for notes screenshots and diagrams
router.post(
  "/upload",
  requireAuth,
  express.raw({ type: "*/*", limit: "50mb" }),
  async (req, res, next) => {
    try {
      const { user } = req as AuthenticatedRequest;
      const patternId = (req.query.patternId as string) || "general";
      const filename = (req.query.filename as string) || `screenshot-${Date.now()}.png`;
      const mimeType = (req.headers["content-type"] as string) || "image/png";

      const fileBuffer = req.body as Buffer;
      if (!fileBuffer || fileBuffer.length === 0) {
        return res.status(400).json({
          error: { code: "EMPTY_PAYLOAD", message: "No binary payload received" },
        });
      }

      const ext = filename.includes(".") ? filename.split(".").pop() : "png";
      const assetId = `asset-${crypto.randomUUID()}`;
      const s3Key = `media/${user.id}/${patternId}/${assetId}.${ext}`;
      const publicUrl = `/api/media/${assetId}`;

      // 1. Upload directly to MinIO bucket
      await storageService.putObject(s3Key, fileBuffer, mimeType);

      // 2. Record media asset in PostgreSQL
      const [record] = await db
        .insert(mediaAssetsTable)
        .values({
          id: assetId,
          userId: user.id,
          patternId,
          s3Key,
          mimeType,
          fileSizeBytes: fileBuffer.length,
          publicUrl,
        })
        .returning();

      logger.info({ assetId, s3Key, size: fileBuffer.length }, "Media asset stored in MinIO and DB");

      return res.status(201).json({
        id: assetId,
        url: publicUrl,
        s3Key,
        publicUrl,
      });
    } catch (err) {
      logger.error({ err }, "Direct media upload failed");
      return next(err);
    }
  }
);

// 2. Serve media asset directly from MinIO
router.get("/:assetId", async (req, res, next) => {
  try {
    const assetId = Array.isArray(req.params.assetId) ? req.params.assetId[0] : (req.params.assetId || "");

    const [record] = await db
      .select()
      .from(mediaAssetsTable)
      .where(eq(mediaAssetsTable.id, assetId))
      .limit(1);

    if (!record) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Media asset not found" },
      });
    }

    const obj = await storageService.getObject(record.s3Key);
    if (!obj) {
      return res.status(404).json({
        error: { code: "OBJECT_NOT_FOUND", message: "Media binary not found in storage" },
      });
    }

    res.setHeader("Content-Type", record.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", obj.data.length);
    return res.status(200).send(obj.data);
  } catch (err) {
    return next(err);
  }
});

// 3. Delete media asset
router.delete("/:assetId", requireAuth, async (req, res, next) => {
  try {
    const assetId = Array.isArray(req.params.assetId) ? req.params.assetId[0] : (req.params.assetId || "");
    const { user } = req as AuthenticatedRequest;

    const [record] = await db
      .select()
      .from(mediaAssetsTable)
      .where(eq(mediaAssetsTable.id, assetId))
      .limit(1);

    if (!record) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Asset not found" } });
    }

    if (record.userId !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not permitted to delete this asset" } });
    }

    await storageService.deleteFile(record.s3Key);
    await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, assetId));

    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
