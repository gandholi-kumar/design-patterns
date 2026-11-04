import { create } from 'zustand';
import type { TourPreferences, TourStatus } from '../types/tour';

const STORAGE_KEY = 'gof_tour_preferences';
export const LARGE_SCREEN_BREAKPOINT = 1024;

function loadStoredPreferences(): TourPreferences {
  if (typeof window === 'undefined') {
    return { hasSeenTour: false, dontShowAgain: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TourPreferences>;
      return {
        hasSeenTour: Boolean(parsed.hasSeenTour),
        dontShowAgain: Boolean(parsed.dontShowAgain),
        lastCompletedAt: parsed.lastCompletedAt,
      };
    }
  } catch {
    // ignore JSON or security errors
  }
  return { hasSeenTour: false, dontShowAgain: false };
}

function persistPreferences(prefs: TourPreferences) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export interface TourState {
  status: TourStatus;
  currentStepIndex: number;
  hasSeenTour: boolean;
  dontShowAgain: boolean;
  isLargeScreen: boolean;

  // Actions
  startTour: () => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  setStepIndex: (index: number) => void;
  setDontShowAgain: (value: boolean) => void;
  setIsLargeScreen: (isLarge: boolean) => void;
  checkAndAutoStart: () => void;
}

export const useTourStore = create<TourState>((set, get) => {
  const initialPrefs = loadStoredPreferences();

  return {
    status: 'idle',
    currentStepIndex: 0,
    hasSeenTour: initialPrefs.hasSeenTour,
    dontShowAgain: initialPrefs.dontShowAgain,
    isLargeScreen: typeof window !== 'undefined' ? window.innerWidth >= LARGE_SCREEN_BREAKPOINT : true,

    startTour: () => {
      const { isLargeScreen } = get();
      if (!isLargeScreen) return;
      if (typeof window !== 'undefined' && window.innerWidth < LARGE_SCREEN_BREAKPOINT) return;

      set({
        status: 'running',
        currentStepIndex: 0,
        dontShowAgain: false,
      });
    },

    nextStep: (totalSteps: number) => {
      const { currentStepIndex } = get();
      if (currentStepIndex + 1 < totalSteps) {
        set({ currentStepIndex: currentStepIndex + 1 });
      } else {
        get().finishTour();
      }
    },

    prevStep: () => {
      const { currentStepIndex } = get();
      if (currentStepIndex > 0) {
        set({ currentStepIndex: currentStepIndex - 1 });
      }
    },

    skipTour: () => {
      const { dontShowAgain } = get();
      if (dontShowAgain) {
        persistPreferences({
          hasSeenTour: true,
          dontShowAgain: true,
        });
      }
      set({ status: 'skipped', hasSeenTour: true });
    },

    finishTour: () => {
      const { dontShowAgain } = get();
      persistPreferences({
        hasSeenTour: true,
        dontShowAgain: true, // Always persist upon successful completion
        lastCompletedAt: new Date().toISOString(),
      });
      set({ status: 'completed', hasSeenTour: true, dontShowAgain: true });
    },

    setStepIndex: (currentStepIndex: number) => set({ currentStepIndex }),

    setDontShowAgain: (dontShowAgain: boolean) => set({ dontShowAgain }),

    setIsLargeScreen: (isLargeScreen: boolean) => {
      set({ isLargeScreen });
      if (!isLargeScreen && get().status === 'running') {
        // Automatically pause/hide tour when resized below desktop threshold
        set({ status: 'idle' });
      }
    },

    checkAndAutoStart: () => {
      if (typeof window === 'undefined') return;
      const isLarge = window.innerWidth >= LARGE_SCREEN_BREAKPOINT;
      const prefs = loadStoredPreferences();

      set({
        isLargeScreen: isLarge,
        hasSeenTour: prefs.hasSeenTour,
        dontShowAgain: prefs.dontShowAgain,
      });

      // Auto-start ONLY on large screens if the user hasn't seen the tour and hasn't opted out
      if (isLarge && !prefs.hasSeenTour && !prefs.dontShowAgain && get().status === 'idle') {
        set({
          status: 'running',
          currentStepIndex: 0,
          dontShowAgain: false,
        });
      }
    },
  };
});

