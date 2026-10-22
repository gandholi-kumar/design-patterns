import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { notesService } from '../services/notes.service';
import { notesRepository } from '../repositories/notes.repository';

describe('Backend Domain Service: NotesService Unit Tests', () => {
  const userId = 'usr_service_test_1';
  const patternId = 'strategy';

  it('getNote: returns formatted NoteDto when repository finds note', async () => {
    const originalFind = notesRepository.findByPatternId;
    const mockUpdatedAt = new Date('2026-02-01T12:00:00.000Z');

    notesRepository.findByPatternId = async (uid, pid) => {
      assert.equal(uid, userId);
      assert.equal(pid, patternId);
      return {
        id: 'note-1',
        userId: uid,
        patternId: pid,
        blocks: [{ type: 'paragraph', content: 'Strategy definition' }],
        version: 1,
        createdAt: mockUpdatedAt,
        updatedAt: mockUpdatedAt,
      } as any;
    };

    try {
      const result = await notesService.getNote(userId, patternId);
      assert.ok(result);
      assert.equal(result.patternId, patternId);
      assert.equal(result.version, 1);
      assert.equal(result.lastModified, mockUpdatedAt.toISOString());
      assert.deepEqual(result.blocks, [{ type: 'paragraph', content: 'Strategy definition' }]);
    } finally {
      notesRepository.findByPatternId = originalFind;
    }
  });

  it('getNote: returns null when repository returns null or undefined', async () => {
    const originalFind = notesRepository.findByPatternId;
    notesRepository.findByPatternId = (async () => null) as any;

    try {
      const result = await notesService.getNote(userId, 'non-existent');
      assert.equal(result, null);
    } finally {
      notesRepository.findByPatternId = originalFind;
    }
  });

  it('saveNote: calls repository.upsertNote and formats response', async () => {
    const originalUpsert = notesRepository.upsertNote;
    const mockUpdatedAt = new Date('2026-03-01T15:30:00.000Z');
    const inputBlocks = [{ type: 'heading', level: 2, text: 'Implementation' }];

    notesRepository.upsertNote = async (params) => {
      assert.equal(params.userId, userId);
      assert.equal(params.patternId, 'observer');
      assert.deepEqual(params.blocks, inputBlocks);
      return {
        id: 'note-2',
        userId: params.userId,
        patternId: params.patternId,
        blocks: params.blocks,
        version: 1,
        createdAt: mockUpdatedAt,
        updatedAt: mockUpdatedAt,
      } as any;
    };

    try {
      const saved = await notesService.saveNote(userId, 'observer', inputBlocks);
      assert.equal(saved.patternId, 'observer');
      assert.equal(saved.version, 1);
      assert.equal(saved.lastModified, mockUpdatedAt.toISOString());
      assert.deepEqual(saved.blocks, inputBlocks);
    } finally {
      notesRepository.upsertNote = originalUpsert;
    }
  });

  it('deleteNote: delegates to repository.deleteByPatternId', async () => {
    const originalDelete = notesRepository.deleteByPatternId;
    let deletedPid = '';

    notesRepository.deleteByPatternId = async (uid, pid) => {
      assert.equal(uid, userId);
      deletedPid = pid;
    };

    try {
      await notesService.deleteNote(userId, 'composite');
      assert.equal(deletedPid, 'composite');
    } finally {
      notesRepository.deleteByPatternId = originalDelete;
    }
  });

  it('listNotes: returns mapped note array and accurate total count', async () => {
    const originalFindAll = notesRepository.findAllByUserId;
    const date1 = new Date('2026-01-10T10:00:00.000Z');
    const date2 = new Date('2026-01-11T11:00:00.000Z');

    notesRepository.findAllByUserId = async (uid) => {
      assert.equal(uid, userId);
      return [
        {
          id: 'n1',
          userId: uid,
          patternId: 'strategy',
          blocks: [],
          version: 1,
          createdAt: date1,
          updatedAt: date1,
        },
        {
          id: 'n2',
          userId: uid,
          patternId: 'command',
          blocks: [{ text: 'Undo' }],
          version: 2,
          createdAt: date2,
          updatedAt: date2,
        },
      ] as any;
    };

    try {
      const result = await notesService.listNotes(userId);
      assert.equal(result.total, 2);
      assert.equal(result.notes.length, 2);
      assert.equal(result.notes[0].patternId, 'strategy');
      assert.equal(result.notes[0].lastModified, date1.toISOString());
      assert.equal(result.notes[1].patternId, 'command');
      assert.equal(result.notes[1].lastModified, date2.toISOString());
    } finally {
      notesRepository.findAllByUserId = originalFindAll;
    }
  });
});
