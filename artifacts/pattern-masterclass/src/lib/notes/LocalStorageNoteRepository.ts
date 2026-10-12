import type { NoteRepository } from "./NoteRepository";
import {
  type PatternNote,
  type NotesExportPayload,
  type NotesImportResult,
  PatternNoteSchema,
  NotesExportPayloadSchema,
} from "./notes-schema";
import { mediaStorage } from "./IndexedDbMediaStorage";

const STORAGE_KEY = "gof-pattern-notes:v1";

export class LocalStorageNoteRepository implements NoteRepository {
  private activeObjectUrls: Map<string, string> = new Map();

  private loadAllFromStorage(): Record<string, PatternNote> {
    if (typeof window === "undefined" || !window.localStorage) {
      return {};
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return {};

      const validNotes: Record<string, PatternNote> = {};
      for (const [patternId, noteData] of Object.entries(parsed)) {
        const validation = PatternNoteSchema.safeParse(noteData);
        if (validation.success) {
          validNotes[patternId] = validation.data;
        }
      }
      return validNotes;
    } catch (err) {
      console.error("Failed to parse pattern notes from localStorage:", err);
      return {};
    }
  }

  private saveAllToStorage(notes: Record<string, PatternNote>): void {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  async get(patternId: string): Promise<PatternNote | null> {
    const all = this.loadAllFromStorage();
    return all[patternId] ?? null;
  }

  async upsert(note: PatternNote): Promise<void> {
    const validated = PatternNoteSchema.parse(note);
    const all = this.loadAllFromStorage();
    all[validated.patternId] = validated;
    this.saveAllToStorage(all);
  }

  async getAll(): Promise<PatternNote[]> {
    const all = this.loadAllFromStorage();
    return Object.values(all);
  }

  async delete(patternId: string): Promise<void> {
    const all = this.loadAllFromStorage();
    if (all[patternId]) {
      delete all[patternId];
      this.saveAllToStorage(all);
    }
  }

  async saveMedia(
    patternId: string,
    file: File | Blob
  ): Promise<{ id: string; url?: string }> {
    const assetId = `img_${crypto.randomUUID()}`;
    await mediaStorage.storeImage(assetId, file);

    const objectUrl = URL.createObjectURL(file);
    this.activeObjectUrls.set(assetId, objectUrl);

    return { id: assetId, url: objectUrl };
  }

  async getMediaUrl(assetId: string): Promise<string | null> {
    if (this.activeObjectUrls.has(assetId)) {
      return this.activeObjectUrls.get(assetId)!;
    }

    const blob = await mediaStorage.getImage(assetId);
    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    this.activeObjectUrls.set(assetId, objectUrl);
    return objectUrl;
  }

  async deleteMedia(assetId: string): Promise<void> {
    if (this.activeObjectUrls.has(assetId)) {
      URL.revokeObjectURL(this.activeObjectUrls.get(assetId)!);
      this.activeObjectUrls.delete(assetId);
    }
    await mediaStorage.deleteImage(assetId);
  }

  async exportAll(): Promise<NotesExportPayload> {
    const notes = await this.getAll();
    const media = await mediaStorage.getAllImagesAsBase64();

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes,
      media,
    };
  }

  async importBundle(payload: NotesExportPayload): Promise<NotesImportResult> {
    const validated = NotesExportPayloadSchema.parse(payload);
    const mediaCount = await mediaStorage.importImagesFromBase64(validated.media);

    const all = this.loadAllFromStorage();
    let importedCount = 0;

    for (const note of validated.notes) {
      all[note.patternId] = note;
      importedCount++;
    }

    this.saveAllToStorage(all);

    return {
      importedCount,
      mediaCount,
      status: "success",
    };
  }
}
