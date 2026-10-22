import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useWorkspacePreferencesStore } from '../stores/useWorkspacePreferencesStore';

describe('Frontend State: WorkspacePreferencesStore Unit Tests', () => {
  const initialDefaults = {
    sidebarCollapsed: false,
    playgroundLayout: 'split' as const,
    playgroundWide: false,
    playgroundWordWrap: true,
    notesPanelOpen: true,
    notesPanelOrientation: 'horizontal' as const,
    notesViewMode: 'cards' as const,
    notesPageSize: 20,
    notesImportPolicy: 'append' as const,
  };

  beforeEach(() => {
    // Reset store to pure defaults before each test run (Rule 5: Store Isolation)
    useWorkspacePreferencesStore.setState(initialDefaults);
  });

  it('toggles and sets sidebarCollapsed state', () => {
    const store = useWorkspacePreferencesStore.getState();
    assert.equal(store.sidebarCollapsed, false);

    store.toggleSidebar();
    assert.equal(useWorkspacePreferencesStore.getState().sidebarCollapsed, true);

    store.setSidebarCollapsed(false);
    assert.equal(useWorkspacePreferencesStore.getState().sidebarCollapsed, false);
  });

  it('updates playground layout and editor display preferences', () => {
    const store = useWorkspacePreferencesStore.getState();

    store.setPlaygroundLayout('stacked');
    assert.equal(useWorkspacePreferencesStore.getState().playgroundLayout, 'stacked');

    store.togglePlaygroundWide();
    assert.equal(useWorkspacePreferencesStore.getState().playgroundWide, true);

    store.togglePlaygroundWordWrap();
    assert.equal(useWorkspacePreferencesStore.getState().playgroundWordWrap, false);
  });

  it('supports functional updates for setNotesPanelOpen', () => {
    const store = useWorkspacePreferencesStore.getState();
    assert.equal(store.notesPanelOpen, true);

    // Pass functional callback
    store.setNotesPanelOpen((prev) => !prev);
    assert.equal(useWorkspacePreferencesStore.getState().notesPanelOpen, false);

    store.setNotesPanelOpen(true);
    assert.equal(useWorkspacePreferencesStore.getState().notesPanelOpen, true);
  });

  it('updates notes view mode and import policies according to preferences', () => {
    const store = useWorkspacePreferencesStore.getState();

    store.setNotesViewMode('table');
    assert.equal(useWorkspacePreferencesStore.getState().notesViewMode, 'table');

    store.setNotesPageSize(50);
    assert.equal(useWorkspacePreferencesStore.getState().notesPageSize, 50);

    store.setNotesImportPolicy('overwrite');
    assert.equal(useWorkspacePreferencesStore.getState().notesImportPolicy, 'overwrite');
  });
});
