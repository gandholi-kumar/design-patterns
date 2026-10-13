import type {
  PatternNote,
  NotesExportPayload,
  NotesImportResult,
} from "./notes-schema";

/**
 * Universal Repository interface for pattern notes persistence.
 *
 * Implementations:
 * - LocalStorageNoteRepository: Browser-native offline storage (LocalStorage + IndexedDB).
 * - ApiNoteRepository: Full-stack cloud storage communicating with Express backend,
 *   PostgreSQL JSONB, and Backblaze B2 object storage.
 *
 * All UI components interact solely through this contract.
 */
export interface NoteRepository {
  /**
   * Retrieves a note for a specific pattern ID.
   * Returns null if no note exists.
   */
  get(patternId: string): Promise<PatternNote | null>;

  /**
   * Saves or updates a pattern note.
   */
  upsert(note: PatternNote): Promise<void>;

  /**
   * Retrieves all notes created across all patterns.
   */
  getAll(): Promise<PatternNote[]>;

  /**
   * Deletes a note for a specific pattern ID.
   */
  delete(patternId: string): Promise<void>;

  /**
   * Stores a binary image asset and returns a persistent asset identifier.
   */
  saveMedia(patternId: string, file: File | Blob): Promise<{ id: string; url?: string }>;

  /**
   * Resolves a media asset by ID into a renderable URL (object URL or remote CDN URL).
   */
  getMediaUrl(assetId: string): Promise<string | null>;

  /**
   * Deletes a media asset by ID.
   */
  deleteMedia(assetId: string): Promise<void>;

  /**
   * Exports notes and inlines media into a self-contained portable bundle.
   * If patternIds is provided, exports only the selected notes and their associated media.
   */
  exportAll(patternIds?: string[]): Promise<NotesExportPayload>;

  /**
   * Imports a notes bundle, validating schemas and extracting media.
   * Handles existing note collisions using strategy: 'append' (default), 'overwrite', or 'skip'.
   */
  importBundle(
    payload: NotesExportPayload,
    strategy?: "append" | "overwrite" | "skip"
  ): Promise<NotesImportResult>;
}
