import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Perspective } from '../pattern-types';

export interface ProgressItem {
  attempts: number;
  correct: number;
  bookmarked: boolean;
  note: string;
  box: number;
}

export interface LearningState {
  theme: 'light' | 'dark';
  bookmarks: string[];
  progress: Record<string, ProgressItem>;
  perspective: Perspective;
  mode: string;
  studioMode: boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleBookmark: (patternId: string) => void;
  setBookmark: (patternId: string, bookmarked: boolean) => void;
  recordAnswer: (scenarioId: string, isCorrect: boolean) => void;
  updateNote: (scenarioId: string, note: string) => void;
  toggleScenarioBookmark: (scenarioId: string) => void;
  clearQuizProgress: () => void;
  setPerspective: (perspective: Perspective) => void;
  setMode: (mode: string) => void;
  setStudioMode: (enabled: boolean) => void;
  resetAll: () => void;
}

const DEFAULT_PROGRESS_ITEM: ProgressItem = {
  attempts: 0,
  correct: 0,
  bookmarked: false,
  note: '',
  box: 1,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      theme: 'dark',
      bookmarks: [],
      progress: {},
      perspective: 'canonical',
      mode: 'typescript',
      studioMode: false,

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
          }
          return { theme: next };
        }),

      setTheme: (theme) =>
        set(() => {
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
          return { theme };
        }),

      toggleBookmark: (patternId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(patternId)
            ? state.bookmarks.filter((b) => b !== patternId)
            : [...state.bookmarks, patternId],
        })),

      setBookmark: (patternId, bookmarked) =>
        set((state) => ({
          bookmarks: bookmarked
            ? state.bookmarks.includes(patternId)
              ? state.bookmarks
              : [...state.bookmarks, patternId]
            : state.bookmarks.filter((b) => b !== patternId),
        })),

      recordAnswer: (scenarioId, isCorrect) =>
        set((state) => {
          const current = state.progress[scenarioId] || { ...DEFAULT_PROGRESS_ITEM };
          const nextAttempts = current.attempts + 1;
          const nextCorrect = current.correct + (isCorrect ? 1 : 0);
          const nextBox = isCorrect ? Math.min(5, current.box + 1) : 1;

          return {
            progress: {
              ...state.progress,
              [scenarioId]: {
                ...current,
                attempts: nextAttempts,
                correct: nextCorrect,
                box: nextBox,
              },
            },
          };
        }),

      updateNote: (scenarioId, note) =>
        set((state) => {
          const current = state.progress[scenarioId] || { ...DEFAULT_PROGRESS_ITEM };
          return {
            progress: {
              ...state.progress,
              [scenarioId]: {
                ...current,
                note,
              },
            },
          };
        }),

      toggleScenarioBookmark: (scenarioId) =>
        set((state) => {
          const current = state.progress[scenarioId] || { ...DEFAULT_PROGRESS_ITEM };
          return {
            progress: {
              ...state.progress,
              [scenarioId]: {
                ...current,
                bookmarked: !current.bookmarked,
              },
            },
          };
        }),

      clearQuizProgress: () =>
        set(() => ({
          progress: {},
          bookmarks: [],
        })),

      setPerspective: (perspective) => set({ perspective }),
      setMode: (mode) => set({ mode }),
      setStudioMode: (studioMode) => set({ studioMode }),

      resetAll: () =>
        set({
          bookmarks: [],
          progress: {},
          studioMode: false,
        }),
    }),
    {
      name: 'gof-masterclass-storage',
    }
  )
);
