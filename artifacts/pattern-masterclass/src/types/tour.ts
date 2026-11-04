import type { ReactNode } from 'react';

export type TourPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

export interface TourStep {
  id: string;
  route: string;
  targetSelector: string;
  badge: string;
  title: string;
  content: string | ReactNode;
  tip?: string;
  placement?: TourPlacement;
  requiresScroll?: boolean;
}

export interface TourPreferences {
  hasSeenTour: boolean;
  dontShowAgain: boolean;
  lastCompletedAt?: string;
}

export type TourStatus = 'idle' | 'running' | 'completed' | 'skipped';

