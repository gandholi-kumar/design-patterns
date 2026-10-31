import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LocalStorageNoteRepository } from '../lib/notes/LocalStorageNoteRepository';
import type { PatternNote, NoteBlock } from '../lib/notes/notes-schema';

describe('Frontend Pattern Notes: Sequential Navigation & State Isolation Unit Tests', () => {
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

  it('preserves strict isolation between notes across different pattern IDs', async () => {
    const singletonBlocks: NoteBlock[] = [
      {
        id: 'b-single-1',
        type: 'paragraph',
        props: {},
        content: 'Singleton ensures a class has only one instance.',
        children: [],
      },
    ];

    const factoryBlocks: NoteBlock[] = [
      {
        id: 'b-factory-1',
        type: 'paragraph',
        props: {},
        content: 'Factory Method delegates instantiation to subclasses.',
        children: [],
      },
    ];

    // 1. Save note for singleton
    await repository.upsert({
      patternId: 'singleton',
      version: 1,
      lastModified: new Date().toISOString(),
      blocks: singletonBlocks,
    });

    // 2. Fetch for singleton -> verify correct content
    const singleNote = await repository.get('singleton');
    assert.ok(singleNote);
    assert.equal(singleNote.patternId, 'singleton');
    assert.equal(singleNote.blocks[0].content, 'Singleton ensures a class has only one instance.');

    // 3. Fetch for factory-method before saving -> should be null
    const initialFactoryNote = await repository.get('factory-method');
    assert.equal(initialFactoryNote, null);

    // 4. Save note for factory-method
    await repository.upsert({
      patternId: 'factory-method',
      version: 1,
      lastModified: new Date().toISOString(),
      blocks: factoryBlocks,
    });

    // 5. Fetch both -> ensure no cross-contamination or overwriting
    const singleNoteAgain = await repository.get('singleton');
    const factoryNote = await repository.get('factory-method');

    assert.ok(singleNoteAgain);
    assert.ok(factoryNote);
    assert.equal(singleNoteAgain.blocks[0].content, 'Singleton ensures a class has only one instance.');
    assert.equal(factoryNote.blocks[0].content, 'Factory Method delegates instantiation to subclasses.');
  });

  it('handles flushing pending dirty notes on sequential pattern transition without loss', async () => {
    // Simulate pending dirty blocks in ref
    const pendingDirtyBlocks: NoteBlock[] = [
      {
        id: 'b-observer-draft',
        type: 'heading',
        props: { level: 2 },
        content: 'Observer Event Bus Mental Model',
        children: [],
      },
    ];

    // Simulate cleanup flush payload
    const flushPayload: PatternNote = {
      patternId: 'observer',
      blocks: pendingDirtyBlocks,
      lastModified: new Date().toISOString(),
      version: 1,
    };

    // Simulate flush on unmount/navigation
    await repository.upsert(flushPayload);

    // Verify flushed note is preserved and retrievable upon returning
    const retrieved = await repository.get('observer');
    assert.ok(retrieved);
    assert.equal(retrieved.patternId, 'observer');
    assert.equal(retrieved.blocks.length, 1);
    assert.equal(retrieved.blocks[0].content, 'Observer Event Bus Mental Model');
  });

  it('distinguishes between empty pattern notes and patterns with saved notes', async () => {
    await repository.upsert({
      patternId: 'strategy',
      version: 1,
      lastModified: new Date().toISOString(),
      blocks: [
        {
          id: 'b-strat-1',
          type: 'bulletListItem',
          props: {},
          content: 'Context references Strategy interface',
          children: [],
        },
      ],
    });

    const strategyNote = await repository.get('strategy');
    const commandNote = await repository.get('command');

    const hasStrategyNote = Boolean(strategyNote && strategyNote.blocks.length > 0);
    const hasCommandNote = Boolean(commandNote && commandNote.blocks.length > 0);

    assert.equal(hasStrategyNote, true);
    assert.equal(hasCommandNote, false);
  });
});

