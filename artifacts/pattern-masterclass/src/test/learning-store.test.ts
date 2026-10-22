import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useLearningStore } from '../stores/useLearningStore';

describe('Frontend State: useLearningStore Unit Tests', () => {
  beforeEach(() => {
    // Reset store before each test (Rule 5: Store Isolation)
    useLearningStore.getState().resetAll();
  });

  it('toggles and sets visual themes', () => {
    const store = useLearningStore.getState();
    assert.equal(store.theme, 'dark');

    store.toggleTheme();
    assert.equal(useLearningStore.getState().theme, 'light');

    store.setTheme('dark');
    assert.equal(useLearningStore.getState().theme, 'dark');
  });

  it('manages bookmarks with idempotency and toggling', () => {
    const store = useLearningStore.getState();
    assert.deepEqual(store.bookmarks, []);

    // Toggle on
    store.toggleBookmark('strategy');
    assert.deepEqual(useLearningStore.getState().bookmarks, ['strategy']);

    // Set bookmark idempotently (true when already true should not duplicate)
    store.setBookmark('strategy', true);
    assert.deepEqual(useLearningStore.getState().bookmarks, ['strategy']);

    // Add second bookmark
    store.setBookmark('factory-method', true);
    assert.deepEqual(useLearningStore.getState().bookmarks, ['strategy', 'factory-method']);

    // Toggle off
    store.toggleBookmark('strategy');
    assert.deepEqual(useLearningStore.getState().bookmarks, ['factory-method']);

    // Set bookmark false
    store.setBookmark('factory-method', false);
    assert.deepEqual(useLearningStore.getState().bookmarks, []);
  });

  it('records quiz answers and advances Leitner spaced repetition boxes', () => {
    const store = useLearningStore.getState();

    // 1. Correct answer moves from box 1 to box 2
    store.recordAnswer('scenario-01', true);
    let progress = useLearningStore.getState().progress['scenario-01'];
    assert.equal(progress.attempts, 1);
    assert.equal(progress.correct, 1);
    assert.equal(progress.box, 2);

    // 2. Another correct answer moves to box 3
    store.recordAnswer('scenario-01', true);
    progress = useLearningStore.getState().progress['scenario-01'];
    assert.equal(progress.attempts, 2);
    assert.equal(progress.correct, 2);
    assert.equal(progress.box, 3);

    // 3. Incorrect answer resets box back to 1
    store.recordAnswer('scenario-01', false);
    progress = useLearningStore.getState().progress['scenario-01'];
    assert.equal(progress.attempts, 3);
    assert.equal(progress.correct, 2);
    assert.equal(progress.box, 1);
  });

  it('clears quiz progress and bookmarks while preserving theme preferences', () => {
    const store = useLearningStore.getState();

    store.setTheme('dark');
    store.setBookmark('observer', true);
    store.recordAnswer('scenario-42', true);

    store.clearQuizProgress();

    const current = useLearningStore.getState();
    assert.equal(current.theme, 'dark');
    assert.deepEqual(current.bookmarks, []);
    assert.deepEqual(current.progress, {});
  });

  it('updates scenario notes and toggles scenario bookmarks', () => {
    const store = useLearningStore.getState();

    // 1. Update note on non-existent progress item creates it with default
    store.updateNote('scenario-99', 'Remember to review trade-offs.');
    let progress = useLearningStore.getState().progress['scenario-99'];
    assert.equal(progress.note, 'Remember to review trade-offs.');
    assert.equal(progress.attempts, 0);

    // 2. Toggle scenario bookmark
    store.toggleScenarioBookmark('scenario-99');
    progress = useLearningStore.getState().progress['scenario-99'];
    assert.equal(progress.bookmarked, true);

    store.toggleScenarioBookmark('scenario-99');
    progress = useLearningStore.getState().progress['scenario-99'];
    assert.equal(progress.bookmarked, false);
  });

  it('updates perspective, code mode, and studio mode flags', () => {
    const store = useLearningStore.getState();

    store.setPerspective('modern-ts');
    assert.equal(useLearningStore.getState().perspective, 'modern-ts');

    store.setMode('java');
    assert.equal(useLearningStore.getState().mode, 'java');

    store.setStudioMode(true);
    assert.equal(useLearningStore.getState().studioMode, true);

    store.resetAll();
    assert.equal(useLearningStore.getState().studioMode, false);
  });

  it('interacts with document.documentElement when document is available', () => {
    let toggledDark = false;
    const originalDoc = (globalThis as any).document;

    (globalThis as any).document = {
      documentElement: {
        classList: {
          toggle: (cls: string, active: boolean) => {
            if (cls === 'dark') toggledDark = active;
          },
        },
      },
    };

    try {
      const store = useLearningStore.getState();
      store.setTheme('dark');
      assert.equal(toggledDark, true);

      store.toggleTheme();
      assert.equal(toggledDark, false);
    } finally {
      (globalThis as any).document = originalDoc;
    }
  });
});

