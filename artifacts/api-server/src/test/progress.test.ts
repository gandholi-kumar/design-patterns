import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { progressController, ProgressController } from '../controllers/progress.controller';
import { progressService, ProgressService } from '../services/progress.service';
import { progressRepository } from '../repositories/progress.repository';

describe('Backend Progress System: Controller & Service Unit Tests', () => {
  const mockUser = { id: 'usr_progress_99', email: 'dev@patterns.edu' };

  function createMockResponse() {
    const res: {
      statusCode: number;
      body: unknown;
      status: (code: number) => typeof res;
      json: (payload: unknown) => typeof res;
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
    };
    return res;
  }

  describe('ProgressController', () => {
    it('getProgress: returns 200 with progress map', async () => {
      const originalGetProgress = progressService.getProgress;
      const mockData = {
        strategy: { attempts: 3, correct: 2, box: 2, note: 'Reviewed', bookmarked: true },
      };

      progressService.getProgress = async (uid) => {
        assert.equal(uid, mockUser.id);
        return mockData as any;
      };

      try {
        const req = { user: mockUser } as any;
        const res = createMockResponse();

        await progressController.getProgress(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.deepEqual((res.body as any).progress, mockData);
      } finally {
        progressService.getProgress = originalGetProgress;
      }
    });

    it('getProgress: forwards service error to next()', async () => {
      const originalGetProgress = progressService.getProgress;
      const simError = new Error('Failed to query progress');
      progressService.getProgress = async () => {
        throw simError;
      };

      try {
        const req = { user: mockUser } as any;
        let capturedError: unknown = null;

        await progressController.getProgress(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        progressService.getProgress = originalGetProgress;
      }
    });

    it('upsertProgress: returns 400 for invalid payload missing patternId', async () => {
      const req = {
        user: mockUser,
        body: { attempts: 1 }, // Missing patternId
      } as any;
      const res = createMockResponse();

      await progressController.upsertProgress(req, res as any, () => {});

      assert.equal(res.statusCode, 400);
      assert.equal((res.body as any).error.code, 'INVALID_INPUT');
    });

    it('upsertProgress: accepts valid payload, applies defaults, and returns 200', async () => {
      const originalSave = progressService.saveProgress;
      const inputPayload = {
        patternId: 'composite',
        attempts: 2,
        correct: 2,
        box: 3,
        note: 'Tree traversal understood',
      };

      progressService.saveProgress = async (params) => {
        assert.equal(params.userId, mockUser.id);
        assert.equal(params.patternId, 'composite');
        assert.equal(params.box, 3);
        return { id: 'prog-1', ...params } as any;
      };

      try {
        const req = { user: mockUser, body: inputPayload } as any;
        const res = createMockResponse();

        await progressController.upsertProgress(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.equal((res.body as any).patternId, 'composite');
      } finally {
        progressService.saveProgress = originalSave;
      }
    });

    it('upsertProgress: forwards unexpected errors to next()', async () => {
      const originalSave = progressService.saveProgress;
      const simError = new Error('Write conflict');
      progressService.saveProgress = async () => {
        throw simError;
      };

      try {
        const req = {
          user: mockUser,
          body: { patternId: 'factory-method' },
        } as any;
        let capturedError: unknown = null;

        await progressController.upsertProgress(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        progressService.saveProgress = originalSave;
      }
    });

    it('getBookmarks: returns 200 with bookmarks array', async () => {
      const originalGetBookmarks = progressService.getBookmarks;
      progressService.getBookmarks = async (uid) => {
        assert.equal(uid, mockUser.id);
        return ['strategy', 'observer'];
      };

      try {
        const req = { user: mockUser } as any;
        const res = createMockResponse();

        await progressController.getBookmarks(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, ['strategy', 'observer']);
      } finally {
        progressService.getBookmarks = originalGetBookmarks;
      }
    });

    it('getBookmarks: forwards unexpected errors to next()', async () => {
      const originalGetBookmarks = progressService.getBookmarks;
      const simError = new Error('Bookmark read timeout');
      progressService.getBookmarks = async () => {
        throw simError;
      };

      try {
        const req = { user: mockUser } as any;
        let capturedError: unknown = null;

        await progressController.getBookmarks(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        progressService.getBookmarks = originalGetBookmarks;
      }
    });

    it('toggleBookmark: returns 400 when patternId is missing or empty', async () => {
      const req = { user: mockUser, body: { patternId: '' } } as any;
      const res = createMockResponse();

      await progressController.toggleBookmark(req, res as any, () => {});

      assert.equal(res.statusCode, 400);
      assert.equal((res.body as any).error.code, 'INVALID_INPUT');
    });

    it('toggleBookmark: toggles bookmark state and returns 200', async () => {
      const originalToggle = progressService.toggleBookmark;
      progressService.toggleBookmark = async (uid, pid) => {
        assert.equal(uid, mockUser.id);
        assert.equal(pid, 'adapter');
        return { patternId: pid, bookmarked: true };
      };

      try {
        const req = { user: mockUser, body: { patternId: 'adapter' } } as any;
        const res = createMockResponse();

        await progressController.toggleBookmark(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, { patternId: 'adapter', bookmarked: true });
      } finally {
        progressService.toggleBookmark = originalToggle;
      }
    });

    it('toggleBookmark: forwards unexpected errors to next()', async () => {
      const originalToggle = progressService.toggleBookmark;
      const simError = new Error('Toggle error');
      progressService.toggleBookmark = async () => {
        throw simError;
      };

      try {
        const req = { user: mockUser, body: { patternId: 'adapter' } } as any;
        let capturedError: unknown = null;

        await progressController.toggleBookmark(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        progressService.toggleBookmark = originalToggle;
      }
    });
  });

  describe('ProgressService', () => {
    const service = new ProgressService();

    it('getProgress: delegates to repository.getProgressByUserId', async () => {
      const original = progressRepository.getProgressByUserId;
      progressRepository.getProgressByUserId = async (uid) => {
        assert.equal(uid, mockUser.id);
        return { singleton: { attempts: 1, correct: 1, box: 2, note: '', bookmarked: false } };
      };

      try {
        const res = await service.getProgress(mockUser.id);
        assert.ok(res.singleton);
      } finally {
        progressRepository.getProgressByUserId = original;
      }
    });

    it('saveProgress: delegates to repository.upsertProgress', async () => {
      const original = progressRepository.upsertProgress;
      const params = {
        userId: mockUser.id,
        patternId: 'proxy',
        attempts: 4,
        correct: 4,
        box: 4,
        note: 'Proxy verified',
      };

      progressRepository.upsertProgress = async (p) => {
        assert.deepEqual(p, params);
        return { ...p, id: 'prog-saved' } as any;
      };

      try {
        const res = await service.saveProgress(params);
        assert.equal(res.id, 'prog-saved');
      } finally {
        progressRepository.upsertProgress = original;
      }
    });

    it('getBookmarks: delegates to repository.getBookmarksByUserId', async () => {
      const original = progressRepository.getBookmarksByUserId;
      progressRepository.getBookmarksByUserId = async (uid) => {
        assert.equal(uid, mockUser.id);
        return ['memento'];
      };

      try {
        const res = await service.getBookmarks(mockUser.id);
        assert.deepEqual(res, ['memento']);
      } finally {
        progressRepository.getBookmarksByUserId = original;
      }
    });

    it('toggleBookmark: delegates to repository.toggleBookmark', async () => {
      const original = progressRepository.toggleBookmark;
      progressRepository.toggleBookmark = async (uid, pid) => {
        assert.equal(uid, mockUser.id);
        assert.equal(pid, 'memento');
        return { patternId: pid, bookmarked: false };
      };

      try {
        const res = await service.toggleBookmark(mockUser.id, 'memento');
        assert.equal(res.bookmarked, false);
      } finally {
        progressRepository.toggleBookmark = original;
      }
    });
  });
});
