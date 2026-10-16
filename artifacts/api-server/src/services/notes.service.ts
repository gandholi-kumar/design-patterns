import { notesRepository } from "../repositories/notes.repository";

export interface NoteDto {
  patternId: string;
  blocks: unknown;
  version: number;
  lastModified: string;
}

export class NotesService {
  async getNote(userId: string, patternId: string): Promise<NoteDto | null> {
    const note = await notesRepository.findByPatternId(userId, patternId);
    if (!note) return null;

    return {
      patternId: note.patternId,
      blocks: note.blocks,
      version: note.version,
      lastModified: note.updatedAt.toISOString(),
    };
  }

  async saveNote(userId: string, patternId: string, blocks: unknown[]): Promise<NoteDto> {
    const saved = await notesRepository.upsertNote({
      userId,
      patternId,
      blocks,
    });

    return {
      patternId: saved.patternId,
      blocks: saved.blocks,
      version: saved.version,
      lastModified: saved.updatedAt.toISOString(),
    };
  }

  async deleteNote(userId: string, patternId: string): Promise<void> {
    await notesRepository.deleteByPatternId(userId, patternId);
  }

  async listNotes(userId: string): Promise<{ notes: NoteDto[]; total: number }> {
    const notes = await notesRepository.findAllByUserId(userId);
    const formatted: NoteDto[] = notes.map((n) => ({
      patternId: n.patternId,
      blocks: n.blocks,
      version: n.version,
      lastModified: n.updatedAt.toISOString(),
    }));

    return {
      notes: formatted,
      total: formatted.length,
    };
  }
}

export const notesService = new NotesService();
