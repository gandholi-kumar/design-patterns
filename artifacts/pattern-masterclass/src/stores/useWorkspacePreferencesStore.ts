import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkspacePreferencesState {
  sidebarCollapsed: boolean;
  playgroundLayout: 'split' | 'stacked';
  playgroundWide: boolean;
  playgroundWordWrap: boolean;
  notesPanelOpen: boolean;
  notesPanelOrientation: 'horizontal' | 'vertical';
  notesViewMode: 'cards' | 'table';
  notesPageSize: number;
  notesImportPolicy: 'append' | 'overwrite' | 'skip' | 'ask';

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPlaygroundLayout: (layout: 'split' | 'stacked') => void;
  togglePlaygroundWide: () => void;
  setPlaygroundWide: (wide: boolean) => void;
  togglePlaygroundWordWrap: () => void;
  setPlaygroundWordWrap: (wrap: boolean) => void;
  toggleNotesPanel: () => void;
  setNotesPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setNotesPanelOrientation: (orientation: 'horizontal' | 'vertical') => void;
  setNotesViewMode: (mode: 'cards' | 'table') => void;
  setNotesPageSize: (size: number) => void;
  setNotesImportPolicy: (policy: 'append' | 'overwrite' | 'skip' | 'ask') => void;
}

export const useWorkspacePreferencesStore = create<WorkspacePreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      playgroundLayout: 'split',
      playgroundWide: false,
      playgroundWordWrap: true,
      notesPanelOpen: true,
      notesPanelOrientation: 'horizontal',
      notesViewMode: 'cards',
      notesPageSize: 20,
      notesImportPolicy: 'append',

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setPlaygroundLayout: (playgroundLayout) => set({ playgroundLayout }),
      togglePlaygroundWide: () => set((s) => ({ playgroundWide: !s.playgroundWide })),
      setPlaygroundWide: (playgroundWide) => set({ playgroundWide }),
      togglePlaygroundWordWrap: () => set((s) => ({ playgroundWordWrap: !s.playgroundWordWrap })),
      setPlaygroundWordWrap: (playgroundWordWrap) => set({ playgroundWordWrap }),
      toggleNotesPanel: () => set((s) => ({ notesPanelOpen: !s.notesPanelOpen })),
      setNotesPanelOpen: (open) =>
        set((s) => ({
          notesPanelOpen: typeof open === 'function' ? open(s.notesPanelOpen) : open,
        })),
      setNotesPanelOrientation: (notesPanelOrientation) => set({ notesPanelOrientation }),
      setNotesViewMode: (notesViewMode) => set({ notesViewMode }),
      setNotesPageSize: (notesPageSize) => set({ notesPageSize }),
      setNotesImportPolicy: (notesImportPolicy) => set({ notesImportPolicy }),
    }),
    {
      name: 'gof-workspace-preferences',
    }
  )
);
