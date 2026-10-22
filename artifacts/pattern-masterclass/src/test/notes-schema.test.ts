import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  NoteBlockSchema,
  PatternNoteSchema,
  NoteMediaAssetSchema,
  NotesExportPayloadSchema,
  NotesImportResultSchema,
} from '../lib/notes/notes-schema';

describe('Frontend Notes Zod Schemas Unit Tests', () => {
  describe('NoteBlockSchema', () => {
    it('validates block with defaults applied', () => {
      const parsed = NoteBlockSchema.parse({
        id: 'blk-1',
        type: 'paragraph',
      });
      assert.equal(parsed.id, 'blk-1');
      assert.equal(parsed.type, 'paragraph');
      assert.deepEqual(parsed.props, {});
      assert.deepEqual(parsed.content, []);
      assert.deepEqual(parsed.children, []);
    });

    it('accepts string, object, and array content variations', () => {
      const blockWithStr = NoteBlockSchema.parse({ id: 'b1', type: 'code', content: 'const a = 1;' });
      assert.equal(blockWithStr.content, 'const a = 1;');

      const blockWithObj = NoteBlockSchema.parse({ id: 'b2', type: 'custom', content: { key: 'val' } });
      assert.deepEqual(blockWithObj.content, { key: 'val' });
    });
  });

  describe('PatternNoteSchema', () => {
    it('validates a complete pattern note document', () => {
      const now = new Date().toISOString();
      const validNote = {
        patternId: 'strategy',
        blocks: [{ id: 'b1', type: 'paragraph', content: 'Decouples algorithms' }],
        lastModified: now,
      };

      const parsed = PatternNoteSchema.parse(validNote);
      assert.equal(parsed.patternId, 'strategy');
      assert.equal(parsed.version, 1);
      assert.equal(parsed.blocks.length, 1);
    });

    it('rejects empty patternId or invalid date', () => {
      assert.throws(() => {
        PatternNoteSchema.parse({
          patternId: '',
          blocks: [],
          lastModified: 'not-a-datetime',
        });
      });
    });
  });

  describe('NoteMediaAssetSchema', () => {
    it('validates media asset descriptor with optional properties', () => {
      const validAsset = {
        id: 'asset-123',
        patternId: 'strategy',
        mimeType: 'image/png',
        fileName: 'diagram.png',
        sizeBytes: 2048,
        width: 800,
        height: 600,
        createdAt: new Date().toISOString(),
        url: 'https://cdn.example.com/media/diagram.png',
      };

      const parsed = NoteMediaAssetSchema.parse(validAsset);
      assert.equal(parsed.id, 'asset-123');
      assert.equal(parsed.width, 800);
    });

    it('rejects negative or zero sizeBytes', () => {
      assert.throws(() => {
        NoteMediaAssetSchema.parse({
          id: 'asset-err',
          patternId: 'strategy',
          mimeType: 'image/png',
          sizeBytes: -10,
          createdAt: new Date().toISOString(),
        });
      });
    });
  });

  describe('NotesExportPayloadSchema & NotesImportResultSchema', () => {
    it('validates export bundle payload and import result summary', () => {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        notes: [
          {
            patternId: 'observer',
            blocks: [{ id: 'b-obs', type: 'heading' }],
            lastModified: new Date().toISOString(),
          },
        ],
        media: {
          'asset-1': 'data:image/png;base64,iVBORw0KGgo...',
        },
      };

      const parsedExport = NotesExportPayloadSchema.parse(exportPayload);
      assert.equal(parsedExport.version, 1);
      assert.equal(parsedExport.notes.length, 1);
      assert.ok(parsedExport.media['asset-1']);

      const importResult = {
        importedCount: 1,
        mediaCount: 1,
        status: 'success' as const,
      };

      const parsedResult = NotesImportResultSchema.parse(importResult);
      assert.equal(parsedResult.status, 'success');
      assert.equal(parsedResult.importedCount, 1);
    });
  });
});
