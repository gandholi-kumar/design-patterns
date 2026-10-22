import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { storageService, S3StorageService } from '../services/storage.service';

describe('Backend S3 Storage Service Unit Tests', () => {
  const service = new S3StorageService();
  const originalFetch = globalThis.fetch;

  it('putObject: successfully sends SigV4 authenticated PUT request', async () => {
    let capturedUrl = '';
    let capturedHeaders: Record<string, string> = {};

    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = url.toString();
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
      } as any;
    }) as any;

    try {
      const buffer = Buffer.from('test-image-binary');
      await service.putObject('media/usr_1/strategy/test.png', buffer, 'image/png');

      assert.ok(capturedUrl.includes('/gof-notes-media/media/usr_1/strategy/test.png'));
      assert.ok(capturedHeaders['Authorization'].startsWith('AWS4-HMAC-SHA256'));
      assert.equal(capturedHeaders['Content-Type'], 'image/png');
      assert.ok(capturedHeaders['x-amz-content-sha256']);
      assert.ok(capturedHeaders['x-amz-date']);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('putObject: throws descriptive error on non-ok HTTP response', async () => {
    globalThis.fetch = (async () => {
      return {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Access Denied S3 Bucket Policy',
      } as any;
    }) as any;

    try {
      await assert.rejects(
        async () => {
          await service.putObject('test.png', Buffer.from('abc'), 'image/png');
        },
        /S3 storage upload failed/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('getObject: returns buffer and contentType when object exists', async () => {
    const fakeData = Buffer.from('downloaded-image-data');
    const exactArrayBuffer = fakeData.buffer.slice(fakeData.byteOffset, fakeData.byteOffset + fakeData.byteLength);
    globalThis.fetch = (async () => {
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        arrayBuffer: async () => exactArrayBuffer,
      } as any;
    }) as any;

    try {
      const res = await service.getObject('media/test.jpg');
      assert.ok(res);
      assert.equal(res.contentType, 'image/jpeg');
      assert.deepEqual(res.data, fakeData);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('getObject: returns null when HTTP status is 404', async () => {
    globalThis.fetch = (async () => {
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any;
    }) as any;

    try {
      const res = await service.getObject('missing.png');
      assert.equal(res, null);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('getObject: throws error on unexpected HTTP failure', async () => {
    globalThis.fetch = (async () => {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Error',
      } as any;
    }) as any;

    try {
      await assert.rejects(
        async () => {
          await service.getObject('error.png');
        },
        /S3 storage getObject failed/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deleteFile: sends SigV4 DELETE request and absorbs transport errors', async () => {
    let methodCalled = '';
    globalThis.fetch = (async (_url: any, init?: RequestInit) => {
      methodCalled = init?.method || '';
      return { ok: true, status: 204 } as any;
    }) as any;

    try {
      await service.deleteFile('media/asset-to-delete.png');
      assert.equal(methodCalled, 'DELETE');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
