import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mediaController, MediaController } from '../controllers/media.controller';
import { storageService } from '../services/storage.service';
import { mediaRepository } from '../repositories/media.repository';

describe('Backend Media System: MediaController Unit Tests', () => {
  const mockUser = { id: 'usr_media_1', email: 'media@domain.com', role: 'member' };
  const mockAdmin = { id: 'usr_admin_1', email: 'admin@domain.com', role: 'admin' };

  function createMockResponse() {
    const res: {
      statusCode: number;
      body: unknown;
      headers: Record<string, string | number>;
      status: (code: number) => typeof res;
      json: (payload: unknown) => typeof res;
      setHeader: (name: string, val: string | number) => typeof res;
      send: (data: unknown) => typeof res;
    } = {
      statusCode: 200,
      body: null,
      headers: {},
      status(code: number) {
        res.statusCode = code;
        return res;
      },
      json(payload: unknown) {
        res.body = payload;
        return res;
      },
      setHeader(name: string, val: string | number) {
        res.headers[name] = val;
        return res;
      },
      send(data: unknown) {
        res.body = data;
        return res;
      },
    };
    return res;
  }

  describe('uploadMedia', () => {
    it('returns 400 when binary buffer is empty or null', async () => {
      const req = {
        user: mockUser,
        query: {},
        headers: {},
        body: Buffer.alloc(0),
      } as any;
      const res = createMockResponse();

      await mediaController.uploadMedia(req, res as any, () => {});

      assert.equal(res.statusCode, 400);
      assert.equal((res.body as any).error.code, 'EMPTY_PAYLOAD');
    });

    it('successfully uploads binary to S3 and registers in media repository with 201', async () => {
      const originalPut = storageService.putObject;
      const originalCreate = mediaRepository.createAsset;

      let s3StoredKey = '';
      let repoAssetParams: any = null;

      storageService.putObject = async (key) => {
        s3StoredKey = key;
      };

      mediaRepository.createAsset = (async (params: any) => {
        repoAssetParams = params;
        return {} as any;
      }) as any;

      try {
        const fakeBuffer = Buffer.from('fake-png-image-content');
        const req = {
          user: mockUser,
          query: { patternId: 'strategy', filename: 'diagram.png' },
          headers: { 'content-type': 'image/png' },
          body: fakeBuffer,
        } as any;
        const res = createMockResponse();

        await mediaController.uploadMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 201);
        assert.ok((res.body as any).id);
        assert.ok((res.body as any).publicUrl);
        assert.ok(s3StoredKey.includes('media/usr_media_1/strategy/'));
        assert.equal(repoAssetParams.fileSizeBytes, fakeBuffer.length);
        assert.equal(repoAssetParams.patternId, 'strategy');
      } finally {
        storageService.putObject = originalPut;
        mediaRepository.createAsset = originalCreate;
      }
    });

    it('forwards upload failures to next()', async () => {
      const originalPut = storageService.putObject;
      const simError = new Error('S3 connection timeout');
      storageService.putObject = async () => {
        throw simError;
      };

      try {
        const req = {
          user: mockUser,
          query: {},
          headers: {},
          body: Buffer.from('test'),
        } as any;
        let capturedError: unknown = null;

        await mediaController.uploadMedia(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        storageService.putObject = originalPut;
      }
    });
  });

  describe('serveMedia', () => {
    it('returns 404 when asset does not exist in repository', async () => {
      const originalFind = mediaRepository.findById;
      mediaRepository.findById = (async () => null) as any;

      try {
        const req = { params: { assetId: 'missing-asset-id' } } as any;
        const res = createMockResponse();

        await mediaController.serveMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 404);
        assert.equal((res.body as any).error.code, 'NOT_FOUND');
      } finally {
        mediaRepository.findById = originalFind;
      }
    });

    it('returns 404 when asset exists in repository but binary missing from S3', async () => {
      const originalFind = mediaRepository.findById;
      const originalGet = storageService.getObject;

      mediaRepository.findById = async () => ({
        id: 'asset-1',
        s3Key: 'media/asset-1.png',
        mimeType: 'image/png',
      } as any);

      storageService.getObject = async () => null;

      try {
        const req = { params: { assetId: ['asset-1'] } } as any; // Test array assetId
        const res = createMockResponse();

        await mediaController.serveMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 404);
        assert.equal((res.body as any).error.code, 'OBJECT_NOT_FOUND');
      } finally {
        mediaRepository.findById = originalFind;
        storageService.getObject = originalGet;
      }
    });

    it('returns 200 with content-type and cache headers when asset exists in S3', async () => {
      const originalFind = mediaRepository.findById;
      const originalGet = storageService.getObject;
      const mockBuffer = Buffer.from('image-binary-stream');

      mediaRepository.findById = async () => ({
        id: 'asset-2',
        s3Key: 'media/asset-2.png',
        mimeType: 'image/png',
      } as any);

      storageService.getObject = async () => ({
        data: mockBuffer,
        contentType: 'image/png',
      });

      try {
        const req = { params: { assetId: 'asset-2' } } as any;
        const res = createMockResponse();

        await mediaController.serveMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.equal(res.headers['Content-Type'], 'image/png');
        assert.equal(res.headers['Content-Length'], mockBuffer.length);
        assert.deepEqual(res.body, mockBuffer);
      } finally {
        mediaRepository.findById = originalFind;
        storageService.getObject = originalGet;
      }
    });

    it('forwards serveMedia error to next()', async () => {
      const originalFind = mediaRepository.findById;
      const simError = new Error('Database down');
      mediaRepository.findById = async () => {
        throw simError;
      };

      try {
        const req = { params: { assetId: 'asset-err' } } as any;
        let capturedError: unknown = null;

        await mediaController.serveMedia(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        mediaRepository.findById = originalFind;
      }
    });
  });

  describe('deleteMedia', () => {
    it('returns 404 when asset does not exist', async () => {
      const originalFind = mediaRepository.findById;
      mediaRepository.findById = (async () => null) as any;

      try {
        const req = { user: mockUser, params: { assetId: 'no-such-id' } } as any;
        const res = createMockResponse();

        await mediaController.deleteMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 404);
      } finally {
        mediaRepository.findById = originalFind;
      }
    });

    it('returns 403 when user is not the asset owner and not an admin', async () => {
      const originalFind = mediaRepository.findById;
      mediaRepository.findById = async () => ({
        id: 'asset-other',
        userId: 'other_user_id',
        s3Key: 'media/other.png',
      } as any);

      try {
        const req = { user: mockUser, params: { assetId: 'asset-other' } } as any;
        const res = createMockResponse();

        await mediaController.deleteMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 403);
        assert.equal((res.body as any).error.code, 'FORBIDDEN');
      } finally {
        mediaRepository.findById = originalFind;
      }
    });

    it('allows asset owner to delete and returns 200', async () => {
      const originalFind = mediaRepository.findById;
      const originalDeleteFile = storageService.deleteFile;
      const originalDeleteDb = mediaRepository.deleteById;

      let deletedS3Key = '';
      let deletedDbId = '';

      mediaRepository.findById = async () => ({
        id: 'asset-owner',
        userId: mockUser.id,
        s3Key: 'media/usr_media_1/asset-owner.png',
      } as any);

      storageService.deleteFile = async (key) => {
        deletedS3Key = key;
      };

      mediaRepository.deleteById = async (id) => {
        deletedDbId = id;
      };

      try {
        const req = { user: mockUser, params: { assetId: 'asset-owner' } } as any;
        const res = createMockResponse();

        await mediaController.deleteMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.equal((res.body as any).success, true);
        assert.equal(deletedS3Key, 'media/usr_media_1/asset-owner.png');
        assert.equal(deletedDbId, 'asset-owner');
      } finally {
        mediaRepository.findById = originalFind;
        storageService.deleteFile = originalDeleteFile;
        mediaRepository.deleteById = originalDeleteDb;
      }
    });

    it('allows admin to delete asset owned by other users and returns 200', async () => {
      const originalFind = mediaRepository.findById;
      const originalDeleteFile = storageService.deleteFile;
      const originalDeleteDb = mediaRepository.deleteById;

      mediaRepository.findById = async () => ({
        id: 'asset-foreign',
        userId: 'stranger_id',
        s3Key: 'media/stranger/asset-foreign.png',
      } as any);

      storageService.deleteFile = async () => {};
      mediaRepository.deleteById = async () => {};

      try {
        const req = { user: mockAdmin, params: { assetId: 'asset-foreign' } } as any;
        const res = createMockResponse();

        await mediaController.deleteMedia(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.equal((res.body as any).success, true);
      } finally {
        mediaRepository.findById = originalFind;
        storageService.deleteFile = originalDeleteFile;
        mediaRepository.deleteById = originalDeleteDb;
      }
    });

    it('forwards deleteMedia error to next()', async () => {
      const originalFind = mediaRepository.findById;
      const simError = new Error('Delete failed');
      mediaRepository.findById = async () => {
        throw simError;
      };

      try {
        const req = { user: mockUser, params: { assetId: 'asset-err' } } as any;
        let capturedError: unknown = null;

        await mediaController.deleteMedia(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simError);
      } finally {
        mediaRepository.findById = originalFind;
      }
    });
  });
});
