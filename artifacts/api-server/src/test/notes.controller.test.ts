import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NotesController } from '../controllers/notes.controller';
import { notesService } from '../services/notes.service';

function createMockResponse() {
  const res: {
    statusCode: number;
    body: unknown;
    status: (code: number) => typeof res;
    json: (payload: unknown) => typeof res;
    send: () => typeof res;
  } = {
    statusCode: 200,
    body: null,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    send() {
      return res;
    },
  };
  return res;
}

describe('Backend API: NotesController Unit Tests', () => {
  const controller = new NotesController();
  const mockUser = { id: 'usr_test_123', email: 'architect@example.com' };

  it('getNote: returns 200 with note data when note exists', async () => {
    const originalGetNote = notesService.getNote;
    notesService.getNote = async (userId: string, patternId: string) => {
      assert.equal(userId, 'usr_test_123');
      assert.equal(patternId, 'strategy');
      return {
        patternId,
        blocks: [{ type: 'paragraph', content: 'Strategy decouples algorithms.' }],
        version: 1,
        lastModified: new Date().toISOString(),
      };
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'strategy' },
      } as any;
      const res = createMockResponse();
      let nextCalled = false;

      await controller.getNote(req, res as any, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 200);
      assert.equal((res.body as any).patternId, 'strategy');
      assert.equal((res.body as any).version, 1);
    } finally {
      notesService.getNote = originalGetNote;
    }
  });

  it('getNote: returns 404 with NOTE_NOT_FOUND when note does not exist', async () => {
    const originalGetNote = notesService.getNote;
    notesService.getNote = async () => null;

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'unknown-pattern' },
      } as any;
      const res = createMockResponse();

      await controller.getNote(req, res as any, () => {});

      assert.equal(res.statusCode, 404);
      assert.equal((res.body as any).code, 'NOTE_NOT_FOUND');
      assert.match((res.body as any).message, /unknown-pattern/);
    } finally {
      notesService.getNote = originalGetNote;
    }
  });

  it('upsertNote: rejects invalid payloads missing blocks with 400 Bad Request', async () => {
    const req = {
      user: mockUser,
      params: { patternId: 'observer' },
      body: { invalidField: 'missing blocks property' },
    } as any;
    const res = createMockResponse();

    await controller.upsertNote(req, res as any, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal((res.body as any).code, 'INVALID_NOTE');
    assert.equal((res.body as any).message, 'Invalid note document payload');
    assert.ok((res.body as any).details);
  });

  it('upsertNote: accepts valid note blocks and returns 200 with saved record', async () => {
    const originalSaveNote = notesService.saveNote;
    const validBlocks = [{ type: 'heading', content: 'Observer Pattern' }];

    notesService.saveNote = async (userId: string, patternId: string, blocks: unknown[]) => {
      assert.equal(userId, 'usr_test_123');
      assert.equal(patternId, 'observer');
      return {
        patternId,
        blocks,
        version: 1,
        lastModified: new Date().toISOString(),
      };
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'observer' },
        body: { blocks: validBlocks },
      } as any;
      const res = createMockResponse();

      await controller.upsertNote(req, res as any, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal((res.body as any).version, 1);
      assert.equal((res.body as any).patternId, 'observer');
    } finally {
      notesService.saveNote = originalSaveNote;
    }
  });

  it('deleteNote: deletes note and returns 204 No Content', async () => {
    const originalDeleteNote = notesService.deleteNote;
    let deletedPattern = '';

    notesService.deleteNote = async (_userId: string, patternId: string) => {
      deletedPattern = patternId;
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'singleton' },
      } as any;
      const res = createMockResponse();

      await controller.deleteNote(req, res as any, () => {});

      assert.equal(deletedPattern, 'singleton');
      assert.equal(res.statusCode, 204);
    } finally {
      notesService.deleteNote = originalDeleteNote;
    }
  });

  it('error handling: forwards unexpected errors to next() in getNote', async () => {
    const originalGetNote = notesService.getNote;
    const simulatedError = new Error('Database connection failed');
    notesService.getNote = async () => {
      throw simulatedError;
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'strategy' },
      } as any;
      const res = createMockResponse();
      let capturedError: unknown = null;

      await controller.getNote(req, res as any, (err: unknown) => {
        capturedError = err;
      });

      assert.equal(capturedError, simulatedError);
    } finally {
      notesService.getNote = originalGetNote;
    }
  });

  it('getPatternId: handles array patternId and undefined patternId gracefully', async () => {
    const originalGetNote = notesService.getNote;
    let receivedPattern = '';
    notesService.getNote = async (_userId, patternId) => {
      receivedPattern = patternId;
      return null;
    };

    try {
      // 1. Array parameter
      const req1 = {
        user: mockUser,
        params: { patternId: ['adapter', 'extra'] },
      } as any;
      await controller.getNote(req1, createMockResponse() as any, () => {});
      assert.equal(receivedPattern, 'adapter');

      // 2. Empty array parameter
      const req2 = {
        user: mockUser,
        params: { patternId: [] },
      } as any;
      await controller.getNote(req2, createMockResponse() as any, () => {});
      assert.equal(receivedPattern, '');

      // 3. Undefined parameter
      const req3 = {
        user: mockUser,
        params: {},
      } as any;
      await controller.getNote(req3, createMockResponse() as any, () => {});
      assert.equal(receivedPattern, '');
    } finally {
      notesService.getNote = originalGetNote;
    }
  });

  it('upsertNote: forwards unexpected service errors to next()', async () => {
    const originalSaveNote = notesService.saveNote;
    const simulatedError = new Error('Persistence failure');
    notesService.saveNote = async () => {
      throw simulatedError;
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'proxy' },
        body: { blocks: [{ type: 'p' }] },
      } as any;
      let capturedError: unknown = null;

      await controller.upsertNote(req, createMockResponse() as any, (err: unknown) => {
        capturedError = err;
      });

      assert.equal(capturedError, simulatedError);
    } finally {
      notesService.saveNote = originalSaveNote;
    }
  });

  it('deleteNote: forwards unexpected service errors to next()', async () => {
    const originalDeleteNote = notesService.deleteNote;
    const simulatedError = new Error('Delete constraint failed');
    notesService.deleteNote = async () => {
      throw simulatedError;
    };

    try {
      const req = {
        user: mockUser,
        params: { patternId: 'facade' },
      } as any;
      let capturedError: unknown = null;

      await controller.deleteNote(req, createMockResponse() as any, (err: unknown) => {
        capturedError = err;
      });

      assert.equal(capturedError, simulatedError);
    } finally {
      notesService.deleteNote = originalDeleteNote;
    }
  });

  it('listNotes: returns 200 with all user notes', async () => {
    const originalListNotes = notesService.listNotes;
    notesService.listNotes = async (userId: string) => {
      assert.equal(userId, 'usr_test_123');
      return {
        notes: [
          { patternId: 'command', blocks: [], version: 1, lastModified: '2026-01-01' },
        ],
        total: 1,
      };
    };

    try {
      const req = { user: mockUser } as any;
      const res = createMockResponse();

      await controller.listNotes(req, res as any, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal((res.body as any).total, 1);
      assert.equal((res.body as any).notes[0].patternId, 'command');
    } finally {
      notesService.listNotes = originalListNotes;
    }
  });

  it('listNotes: forwards unexpected service errors to next()', async () => {
    const originalListNotes = notesService.listNotes;
    const simulatedError = new Error('Query error');
    notesService.listNotes = async () => {
      throw simulatedError;
    };

    try {
      const req = { user: mockUser } as any;
      let capturedError: unknown = null;

      await controller.listNotes(req, createMockResponse() as any, (err: unknown) => {
        capturedError = err;
      });

      assert.equal(capturedError, simulatedError);
    } finally {
      notesService.listNotes = originalListNotes;
    }
  });
});
