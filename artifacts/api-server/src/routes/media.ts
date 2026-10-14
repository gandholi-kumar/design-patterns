import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { storageService } from "../services/storage.service";
import { db } from "@workspace/db";
import { mediaAssetsTable } from "@workspace/db/schema";

const router: IRouter = Router();

const PresignUploadSchema = z.object({
  patternId: z.string().min(1),
  filename: z.string().default("diagram.png"),
  mimeType: z.string().default("image/png"),
});

const ConfirmUploadSchema = z.object({
  assetId: z.string(),
  patternId: z.string(),
  s3Key: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number().int().positive(),
  publicUrl: z.string().url(),
});

// 1. Request a presigned PUT URL for direct S3 upload
router.post("/presign-upload", requireAuth, async (req, res, next) => {
  try {
    const parsed = PresignUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Invalid payload", details: parsed.error.format() },
      });
    }

    const { user } = req as AuthenticatedRequest;
    const { patternId, filename, mimeType } = parsed.data;

    const result = await storageService.generatePresignedUploadUrl(
      user.id,
      patternId,
      filename,
      mimeType
    );

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

// 2. Confirm and record media asset metadata in PostgreSQL
router.post("/confirm", requireAuth, async (req, res, next) => {
  try {
    const parsed = ConfirmUploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Invalid payload", details: parsed.error.format() },
      });
    }

    const { user } = req as AuthenticatedRequest;
    const { assetId, patternId, s3Key, mimeType, fileSizeBytes, publicUrl } = parsed.data;

    const [record] = await db
      .insert(mediaAssetsTable)
      .values({
        id: assetId,
        userId: user.id,
        patternId,
        s3Key,
        mimeType,
        fileSizeBytes,
        publicUrl,
      })
      .returning();

    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

export default router;
