export interface PresignedUploadResult {
  uploadUrl: string;
  assetId: string;
  s3Key: string;
  publicUrl: string;
}

export class S3StorageService {
  private client: unknown | null = null;
  private bucket: string;
  private publicCdnUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "gof-notes-media";
    this.publicCdnUrl = (process.env.S3_PUBLIC_CDN_URL || "").replace(/\/+$/, "");
  }

  private async getClient(): Promise<any> {
    if (this.client) return this.client;

    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing S3 configuration: S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY must be configured in environment variables"
      );
    }

    try {
      const { S3Client } = await import("@aws-sdk/client-s3");
      this.client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
      return this.client;
    } catch {
      throw new Error("@aws-sdk/client-s3 package not available for S3 storage");
    }
  }

  /**
   * Generates a presigned S3 PUT URL for direct client-to-bucket upload.
   * Works identically across Cloudflare R2 and Backblaze B2 S3 APIs.
   */
  async generatePresignedUploadUrl(
    userId: string,
    patternId: string,
    filename: string,
    mimeType: string
  ): Promise<PresignedUploadResult> {
    const s3 = await this.getClient();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const ext = filename.includes(".") ? filename.split(".").pop() : "png";
    const assetId = `asset-${crypto.randomUUID()}`;
    const s3Key = `media/${userId}/${patternId}/${assetId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: mimeType,
    });

    // 15-minute expiration window for direct binary stream upload
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    const publicUrl = this.publicCdnUrl
      ? `${this.publicCdnUrl}/${s3Key}`
      : `${process.env.S3_ENDPOINT}/${this.bucket}/${s3Key}`;

    return { uploadUrl, assetId, s3Key, publicUrl };
  }

  /**
   * Deletes a binary object from object storage.
   */
  async deleteFile(s3Key: string): Promise<void> {
    const s3 = await this.getClient();
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      })
    );
  }
}

export const storageService = new S3StorageService();
