import { z } from "zod";

/**
 * Zod validation schema for an individual BlockNote AST block.
 * BlockNote blocks represent elements such as paragraphs, headings, bullet lists,
 * code blocks, and resizable images.
 */
export const NoteBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.unknown()).optional().default({}),
  content: z.union([z.array(z.unknown()), z.record(z.unknown()), z.string()]).optional().default([]),
  children: z.array(z.unknown()).optional().default([]),
});

export type NoteBlock = z.infer<typeof NoteBlockSchema>;

/**
 * Zod validation schema for a complete per-pattern note document.
 */
export const PatternNoteSchema = z.object({
  patternId: z.string().min(1, "Pattern ID is required"),
  blocks: z.array(NoteBlockSchema),
  lastModified: z.string().datetime(),
  version: z.literal(1).default(1),
});

export type PatternNote = z.infer<typeof PatternNoteSchema>;

/**
 * Media asset descriptor for images stored in IndexedDB or cloud storage.
 */
export const NoteMediaAssetSchema = z.object({
  id: z.string(),
  patternId: z.string(),
  mimeType: z.string(),
  fileName: z.string().optional(),
  sizeBytes: z.number().int().positive(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  // For cloud storage (e.g. Backblaze B2)
  url: z.string().url().optional(),
});

export type NoteMediaAsset = z.infer<typeof NoteMediaAssetSchema>;

/**
 * Bundle schema for batch export and import of all pattern notes.
 * Used for portable JSON backup and cross-device transfer.
 */
export const NotesExportPayloadSchema = z.object({
  version: z.literal(1).default(1),
  exportedAt: z.string().datetime(),
  notes: z.array(PatternNoteSchema),
  // Inlined base64 media dictionary: key = asset ID, value = data URL
  media: z.record(z.string()).default({}),
});

export type NotesExportPayload = z.infer<typeof NotesExportPayloadSchema>;

export const NotesImportResultSchema = z.object({
  importedCount: z.number().int().nonnegative(),
  mediaCount: z.number().int().nonnegative(),
  status: z.enum(["success", "partial", "failed"]),
  errors: z.array(z.string()).optional(),
});

export type NotesImportResult = z.infer<typeof NotesImportResultSchema>;
