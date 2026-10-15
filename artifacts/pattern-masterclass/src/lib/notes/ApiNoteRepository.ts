import type { NoteRepository } from "./NoteRepository";
import {
  type PatternNote,
  type NotesExportPayload,
  type NotesImportResult,
  PatternNoteSchema,
  NotesExportPayloadSchema,
} from "./notes-schema";

/**
 * Cloud-Integrated NoteRepository communicating with the Express backend,
 * PostgreSQL JSONB tables, and S3 Presigned Object Storage (Cloudflare R2 / Backblaze B2).
 */
export class ApiNoteRepository implements NoteRepository {
  private mediaUrlCache: Map<string, string> = new Map();

  async get(patternId: string): Promise<PatternNote | null> {
    try {
      const res = await fetch(`/api/patterns/${encodeURIComponent(patternId)}/notes`, {
        credentials: "include",
      });

      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch note for pattern ${patternId} (${res.status})`);
      }

      const data = await res.json();
      const validated = PatternNoteSchema.safeParse(data);
      if (!validated.success) {
        return null;
      }

      return validated.data;
    } catch {
      return null;
    }
  }

  async upsert(note: PatternNote): Promise<void> {
    const validated = PatternNoteSchema.parse(note);
    const res = await fetch(`/api/patterns/${encodeURIComponent(validated.patternId)}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ blocks: validated.blocks }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to save note (${res.status})`);
    }
  }

  async getAll(): Promise<PatternNote[]> {
    try {
      const res = await fetch("/api/notes", {
        credentials: "include",
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!Array.isArray(data.notes)) {
        return [];
      }

      const result: PatternNote[] = [];
      for (const item of data.notes) {
        const parsed = PatternNoteSchema.safeParse(item);
        if (parsed.success) {
          result.push(parsed.data);
        }
      }

      return result;
    } catch {
      return [];
    }
  }

  async delete(patternId: string): Promise<void> {
    const res = await fetch(`/api/patterns/${encodeURIComponent(patternId)}/notes`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete note (${res.status})`);
    }
  }

  async saveMedia(patternId: string, file: File | Blob): Promise<{ id: string; url?: string }> {
    const filename = file instanceof File ? file.name : `diagram-${Date.now()}.png`;
    const mimeType = file.type || "image/png";

    // 1. Request presigned upload URL from server
    const presignRes = await fetch("/api/media/presign-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ patternId, filename, mimeType }),
    });

    if (!presignRes.ok) {
      throw new Error(`Presign request failed (${presignRes.status})`);
    }

    const { assetId, uploadUrl, publicUrl, s3Key } = await presignRes.json();

    // 2. Upload raw binary directly to S3/R2/B2 (bypasses server memory)
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Direct S3 upload failed (${uploadRes.status})`);
    }

    // 3. Confirm upload in PostgreSQL database
    await fetch("/api/media/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        assetId,
        patternId,
        s3Key,
        mimeType,
        fileSizeBytes: file.size,
        publicUrl,
      }),
    });

    this.mediaUrlCache.set(assetId, publicUrl);
    return { id: assetId, url: publicUrl };
  }

  async getMediaUrl(assetId: string): Promise<string | null> {
    if (this.mediaUrlCache.has(assetId)) {
      return this.mediaUrlCache.get(assetId)!;
    }
    return `/api/media/${encodeURIComponent(assetId)}`;
  }

  async deleteMedia(assetId: string): Promise<void> {
    this.mediaUrlCache.delete(assetId);
    await fetch(`/api/media/${encodeURIComponent(assetId)}`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async exportAll(patternIds?: string[]): Promise<NotesExportPayload> {
    const allNotes = await this.getAll();
    const filtered = patternIds
      ? allNotes.filter((n) => patternIds.includes(n.patternId))
      : allNotes;

    const payload: NotesExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes: filtered,
      media: {},
    };

    return NotesExportPayloadSchema.parse(payload);
  }

  async importBundle(
    payload: NotesExportPayload,
    strategy: "append" | "overwrite" | "skip" = "append"
  ): Promise<NotesImportResult> {
    const validated = NotesExportPayloadSchema.parse(payload);
    let importedNotes = 0;
    let skippedNotes = 0;

    for (const note of validated.notes) {
      const existing = await this.get(note.patternId);
      if (existing) {
        if (strategy === "skip") {
          skippedNotes++;
          continue;
        }
        if (strategy === "append") {
          const merged: PatternNote = {
            ...note,
            blocks: [...existing.blocks, ...note.blocks],
            lastModified: new Date().toISOString(),
          };
          await this.upsert(merged);
          importedNotes++;
          continue;
        }
      }

      await this.upsert(note);
      importedNotes++;
    }

    return {
      status: skippedNotes > 0 ? "partial" : "success",
      importedCount: importedNotes,
      mediaCount: 0,
    };
  }
}
