import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageNoteRepository } from '../lib/notes/LocalStorageNoteRepository';
import { mediaStorage } from '../lib/notes/IndexedDbMediaStorage';

describe('Frontend Note Storage: LocalStorageNoteRepository Unit Tests', () => {
  let repository: LocalStorageNoteRepository;
  let mockStorageStore: Record<string, string> = {};

  beforeEach(() => {
    mockStorageStore = {};
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorageStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStorageStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorageStore[key];
      },
      clear: () => {
        mockStorageStore = {};
      },
    };
    repository = new LocalStorageNoteRepository();
  });

  it('returns null when retrieving non-existent note', async () => {
    const note = await repository.get('non-existent');
    assert.equal(note, null);
  });

  it('upserts and retrieves a valid pattern note document', async () => {
    const testNote = {
      patternId: 'strategy',
      version: 1 as const,
      lastModified: new Date().toISOString(),
      blocks: [
        {
          id: 'b-1',
          type: 'paragraph',
          props: {},
          content: 'Decouples dynamic algorithms.',
          children: [],
        },
      ],
    };

    await repository.upsert(testNote);
    const retrieved = await repository.get('strategy');
    assert.ok(retrieved);
    assert.equal(retrieved.patternId, 'strategy');
    assert.equal(retrieved.blocks.length, 1);
  });

  it('getAll: returns array of all stored notes', async () => {
    await repository.upsert({
      patternId: 'strategy',
      version: 1 as const,
      lastModified: new Date().toISOString(),
      blocks: [],
    });
    await repository.upsert({
      patternId: 'observer',
      version: 1 as const,
      lastModified: new Date().toISOString(),
      blocks: [],
    });

    const all = await repository.getAll();
    assert.equal(all.length, 2);
    const ids = all.map((n) => n.patternId);
    assert.ok(ids.includes('strategy'));
    assert.ok(ids.includes('observer'));
  });

  it('delete: removes note from storage', async () => {
    await repository.upsert({
      patternId: 'singleton',
      version: 1 as const,
      lastModified: new Date().toISOString(),
      blocks: [],
    });

    assert.ok(await repository.get('singleton'));
    await repository.delete('singleton');
    assert.equal(await repository.get('singleton'), null);
  });

  it('importBundle: handles append, overwrite, and skip strategies', async () => {
    const origImportMedia = mediaStorage.importImagesFromBase64;
    mediaStorage.importImagesFromBase64 = async () => 0;

    try {
      // 1. Initial note in storage
      await repository.upsert({
        patternId: 'decorator',
        version: 1 as const,
        lastModified: '2026-01-01T00:00:00.000Z',
        blocks: [{ id: 'b-old', type: 'paragraph', props: {}, content: 'Old note', children: [] }],
      });

      // 2. Import bundle with skip strategy -> does not overwrite
      const bundle = {
        version: 1 as const,
        exportedAt: new Date().toISOString(),
        media: {},
        notes: [
          {
            patternId: 'decorator',
            version: 1 as const,
            lastModified: new Date().toISOString(),
            blocks: [{ id: 'b-new', type: 'paragraph', props: {}, content: 'New note', children: [] }],
          },
        ],
      };

      const resSkip = await repository.importBundle(bundle, 'skip');
      assert.equal(resSkip.status, 'success');
      assert.equal(resSkip.importedCount, 0);

      // 3. Import bundle with overwrite strategy -> replaces
      const resOverwrite = await repository.importBundle(bundle, 'overwrite');
      assert.equal(resOverwrite.importedCount, 1);
      const afterOverwrite = await repository.get('decorator');
      assert.equal(afterOverwrite?.blocks[0].id, 'b-new');

      // 4. Import bundle with append strategy -> appends with divider
      const resAppend = await repository.importBundle(bundle, 'append');
      assert.equal(resAppend.importedCount, 1);
      const afterAppend = await repository.get('decorator');
      assert.ok(afterAppend!.blocks.length >= 2);
    } finally {
      mediaStorage.importImagesFromBase64 = origImportMedia;
    }
  });

  it('exportAll: bundles notes and referenced media correctly', async () => {
    const origGetMedia = mediaStorage.getAllImagesAsBase64;
    mediaStorage.getAllImagesAsBase64 = async () => ({
      'asset-42': 'data:image/png;base64,mockImage',
    });

    try {
      await repository.upsert({
        patternId: 'proxy',
        version: 1 as const,
        lastModified: new Date().toISOString(),
        blocks: [
          {
            id: 'b-img',
            type: 'image',
            props: { url: '/api/media/asset-42' },
            content: [],
            children: [],
          },
        ],
      });

      const exportBundle = await repository.exportAll(['proxy']);
      assert.equal(exportBundle.notes.length, 1);
      assert.equal(exportBundle.notes[0].patternId, 'proxy');
      assert.ok(exportBundle.media['asset-42']);
    } finally {
      mediaStorage.getAllImagesAsBase64 = origGetMedia;
    }
  });
});
