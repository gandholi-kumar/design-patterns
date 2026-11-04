import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { useTourStore, LARGE_SCREEN_BREAKPOINT } from '../../stores/useTourStore';
import { TOUR_STEPS } from './tourSteps';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';

export function TourManager() {
  const [loc, setLoc] = useLocation();
  const status = useTourStore((s) => s.status);
  const currentStepIndex = useTourStore((s) => s.currentStepIndex);
  const dontShowAgain = useTourStore((s) => s.dontShowAgain);
  const isLargeScreen = useTourStore((s) => s.isLargeScreen);
  const startTour = useTourStore((s) => s.startTour);
  const nextStep = useTourStore((s) => s.nextStep);
  const prevStep = useTourStore((s) => s.prevStep);
  const skipTour = useTourStore((s) => s.skipTour);
  const setDontShowAgain = useTourStore((s) => s.setDontShowAgain);
  const setIsLargeScreen = useTourStore((s) => s.setIsLargeScreen);
  const checkAndAutoStart = useTourStore((s) => s.checkAndAutoStart);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);

  // 1. Check first-time visit on mount (desktop only)
  useEffect(() => {
    checkAndAutoStart();

    const handleResize = () => {
      const isLarge = window.innerWidth >= LARGE_SCREEN_BREAKPOINT;
      setIsLargeScreen(isLarge);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkAndAutoStart, setIsLargeScreen]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // 2. Synchronize target element and multi-route transitions
  const updateTargetRect = useCallback(() => {
    if (status !== 'running' || !currentStep || !isLargeScreen) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [status, currentStep, isLargeScreen]);

  useEffect(() => {
    if (status !== 'running' || !currentStep || !isLargeScreen) {
      setTargetRect(null);
      return;
    }

    // Step A: Route Transition Check
    // If the step belongs to a different route, navigate first
    const targetRouteBase = currentStep.route.split('?')[0];
    const currentRouteBase = loc.split('?')[0];

    if (currentRouteBase !== targetRouteBase) {
      setLoc(currentStep.route);
      setTargetRect(null);
    }

    // Step B: Target Element Polling with RAF / MutationObserver
    let attempts = 0;
    const maxAttempts = 30; // ~1500ms max polling for lazy-loaded route views

    const pollElement = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        // Scroll target gently into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        setTargetRect(el.getBoundingClientRect());
      } else if (attempts < maxAttempts) {
        attempts++;
        retryTimeoutRef.current = window.setTimeout(pollElement, 50);
      } else {
        // Target not found within timeout; render centered fallback
        setTargetRect(null);
      }
    };

    pollElement();

    // Step C: Listen to scroll and resize to keep spotlight in sync with layout
    window.addEventListener('scroll', updateTargetRect, true);
    window.addEventListener('resize', updateTargetRect);

    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      window.removeEventListener('scroll', updateTargetRect, true);
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [status, currentStep, loc, isLargeScreen, setLoc, updateTargetRect]);

  // Guard: If not running or on mobile screen, render nothing
  if (status !== 'running' || !currentStep || !isLargeScreen) {
    return null;
  }

  return createPortal(
    <>
      <TourOverlay targetRect={targetRect} />
      <TourTooltip
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={TOUR_STEPS.length}
        targetRect={targetRect}
        dontShowAgain={dontShowAgain}
        onNext={() => nextStep(TOUR_STEPS.length)}
        onPrev={prevStep}
        onSkip={skipTour}
        onToggleDontShowAgain={setDontShowAgain}
      />
    </>,
    document.body
  );
}

