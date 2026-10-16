import { db, eq } from "@workspace/db";
import { mediaAssetsTable } from "@workspace/db/schema";

export interface CreateMediaAssetParams {
  id: string;
  userId: string;
  patternId: string;
  s3Key: string;
  mimeType: string;
  fileSizeBytes: number;
  publicUrl: string;
}

export class MediaRepository {
  async createAsset(params: CreateMediaAssetParams) {
    const [record] = await db
      .insert(mediaAssetsTable)
      .values({
        id: params.id,
        userId: params.userId,
        patternId: params.patternId,
        s3Key: params.s3Key,
        mimeType: params.mimeType,
        fileSizeBytes: params.fileSizeBytes,
        publicUrl: params.publicUrl,
      })
      .returning();

    return record;
  }

  async findById(assetId: string) {
    const [record] = await db
      .select()
      .from(mediaAssetsTable)
      .where(eq(mediaAssetsTable.id, assetId))
      .limit(1);

    return record || null;
  }

  async deleteById(assetId: string) {
    await db.delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, assetId));
  }
}

export const mediaRepository = new MediaRepository();
