import crypto from "node:crypto";

export interface PresignedUploadResult {
  uploadUrl: string;
  assetId: string;
  s3Key: string;
  publicUrl: string;
}

export class S3StorageService {
  private bucket: string;
  private endpoint: string;
  private accessKey: string;
  private secretKey: string;
  private region: string;
  private publicCdnUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "gof-notes-media";
    this.endpoint = (process.env.S3_ENDPOINT || "http://localhost:9100").replace(/\/+$/, "");
    this.accessKey = process.env.S3_ACCESS_KEY_ID || "minioadmin";
    this.secretKey = process.env.S3_SECRET_ACCESS_KEY || "minioadminpassword";
    this.region = process.env.S3_REGION || "us-east-1";
    this.publicCdnUrl = (process.env.S3_PUBLIC_CDN_URL || "").replace(/\/+$/, "");
  }

  private getSignatureKey(dateStamp: string, serviceName: string = "s3") {
    const kDate = crypto.createHmac("sha256", "AWS4" + this.secretKey).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(this.region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
    return crypto.createHmac("sha256", kService).update("aws4_request").digest();
  }

  /**
   * Upload binary buffer directly to MinIO/S3 using AWS SigV4
   */
  async putObject(s3Key: string, body: Buffer | Uint8Array, mimeType: string): Promise<void> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update(body).digest("hex");
    const canonicalUri = "/" + this.bucket + "/" + encodeURI(s3Key);

    const urlObj = new URL(this.endpoint);
    const host = urlObj.host;

    const canonicalHeaders =
      "host:" + host + "\n" +
      "x-amz-content-sha256:" + payloadHash + "\n" +
      "x-amz-date:" + amzDate + "\n";
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest =
      "PUT\n" + canonicalUri + "\n\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + payloadHash;
    const stringToSign =
      "AWS4-HMAC-SHA256\n" + amzDate + "\n" + dateStamp + "/" + this.region + "/s3/aws4_request\n" +
      crypto.createHash("sha256").update(canonicalRequest).digest("hex");

    const signingKey = this.getSignatureKey(dateStamp, "s3");
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authHeader =
      "AWS4-HMAC-SHA256 Credential=" + this.accessKey + "/" + dateStamp + "/" + this.region + "/s3/aws4_request, SignedHeaders=" + signedHeaders + ", Signature=" + signature;

    const fullUrl = this.endpoint + canonicalUri;
    const res = await fetch(fullUrl, {
      method: "PUT",
      headers: {
        Host: host,
        "Content-Type": mimeType,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        Authorization: authHeader,
      },
      body: body as any,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`S3 storage upload failed (${res.status} ${res.statusText}): ${errText}`);
    }
  }

  /**
   * Fetch binary buffer from MinIO/S3 using AWS SigV4
   */
  async getObject(s3Key: string): Promise<{ data: Buffer; contentType: string } | null> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update("").digest("hex");
    const canonicalUri = "/" + this.bucket + "/" + encodeURI(s3Key);

    const urlObj = new URL(this.endpoint);
    const host = urlObj.host;

    const canonicalHeaders =
      "host:" + host + "\n" +
      "x-amz-content-sha256:" + payloadHash + "\n" +
      "x-amz-date:" + amzDate + "\n";
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest =
      "GET\n" + canonicalUri + "\n\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + payloadHash;
    const stringToSign =
      "AWS4-HMAC-SHA256\n" + amzDate + "\n" + dateStamp + "/" + this.region + "/s3/aws4_request\n" +
      crypto.createHash("sha256").update(canonicalRequest).digest("hex");

    const signingKey = this.getSignatureKey(dateStamp, "s3");
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authHeader =
      "AWS4-HMAC-SHA256 Credential=" + this.accessKey + "/" + dateStamp + "/" + this.region + "/s3/aws4_request, SignedHeaders=" + signedHeaders + ", Signature=" + signature;

    const fullUrl = this.endpoint + canonicalUri;
    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Host: host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        Authorization: authHeader,
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`S3 storage getObject failed (${res.status} ${res.statusText})`);
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();
    return { data: Buffer.from(arrayBuffer), contentType };
  }

  /**
   * Delete object from MinIO/S3 using AWS SigV4
   */
  async deleteFile(s3Key: string): Promise<void> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);

    const payloadHash = crypto.createHash("sha256").update("").digest("hex");
    const canonicalUri = "/" + this.bucket + "/" + encodeURI(s3Key);

    const urlObj = new URL(this.endpoint);
    const host = urlObj.host;

    const canonicalHeaders =
      "host:" + host + "\n" +
      "x-amz-content-sha256:" + payloadHash + "\n" +
      "x-amz-date:" + amzDate + "\n";
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest =
      "DELETE\n" + canonicalUri + "\n\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + payloadHash;
    const stringToSign =
      "AWS4-HMAC-SHA256\n" + amzDate + "\n" + dateStamp + "/" + this.region + "/s3/aws4_request\n" +
      crypto.createHash("sha256").update(canonicalRequest).digest("hex");

    const signingKey = this.getSignatureKey(dateStamp, "s3");
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authHeader =
      "AWS4-HMAC-SHA256 Credential=" + this.accessKey + "/" + dateStamp + "/" + this.region + "/s3/aws4_request, SignedHeaders=" + signedHeaders + ", Signature=" + signature;

    const fullUrl = this.endpoint + canonicalUri;
    await fetch(fullUrl, {
      method: "DELETE",
      headers: {
        Host: host,
        "x-amz-content-sha256": payloadHash,
        "x-amz-date": amzDate,
        Authorization: authHeader,
      },
    }).catch(() => {});
  }
}

export const storageService = new S3StorageService();
