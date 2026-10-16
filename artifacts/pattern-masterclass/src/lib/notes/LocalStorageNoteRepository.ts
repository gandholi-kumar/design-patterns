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

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    this.activeObjectUrls.set(assetId, dataUrl);
    return { id: assetId, url: dataUrl };
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

  async exportAll(patternIds?: string[]): Promise<NotesExportPayload> {
    const allNotes = await this.getAll();
    const notes =
      patternIds && patternIds.length > 0
        ? allNotes.filter((n) => patternIds.includes(n.patternId))
        : allNotes;

    // Collect media IDs referenced in blocks for selective export
    const neededMediaIds = new Set<string>();
    for (const note of notes) {
      for (const block of note.blocks) {
        const url =
          block.type === "image" &&
          typeof block.props === "object" &&
          block.props !== null &&
          "url" in block.props &&
          typeof (block.props as { url: unknown }).url === "string"
            ? (block.props as { url: string }).url
            : null;
        if (url) {
          const match = url.match(/asset-[a-zA-Z0-9_-]+/);
          if (match) neededMediaIds.add(match[0]);
        }
      }
    }

    const allMedia = await mediaStorage.getAllImagesAsBase64();
    const media: Record<string, string> = {};
    for (const [id, base64] of Object.entries(allMedia)) {
      if (!patternIds || patternIds.length === 0 || neededMediaIds.has(id)) {
        media[id] = base64;
      }
    }

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes,
      media,
    };
  }

  async importBundle(
    payload: NotesExportPayload,
    strategy: "append" | "overwrite" | "skip" = "append"
  ): Promise<NotesImportResult> {
    const validated = NotesExportPayloadSchema.parse(payload);
    const mediaCount = await mediaStorage.importImagesFromBase64(validated.media);

    const all = this.loadAllFromStorage();
    let importedCount = 0;

    for (const incoming of validated.notes) {
      const existing = all[incoming.patternId];

      if (!existing) {
        all[incoming.patternId] = incoming;
        importedCount++;
      } else if (strategy === "overwrite") {
        all[incoming.patternId] = incoming;
        importedCount++;
      } else if (strategy === "append") {
        const dividerBlock = {
          id: `div-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: "paragraph",
          props: { textColor: "default", backgroundColor: "default" },
          content: [
            {
              type: "text",
              text: `--- Appended Imported Notes (${new Date().toLocaleDateString()}) ---`,
              styles: { italic: true },
            },
          ],
          children: [],
        };
        all[incoming.patternId] = {
          ...existing,
          lastModified: new Date().toISOString(),
          blocks: [...existing.blocks, dividerBlock, ...incoming.blocks],
        };
        importedCount++;
      }
      // If 'skip', do nothing for existing note
    }

    this.saveAllToStorage(all);

    return {
      importedCount,
      mediaCount,
      status: "success",
    };
  }
}
