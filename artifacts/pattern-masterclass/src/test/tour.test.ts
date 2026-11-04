import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS } from '../components/tour/tourSteps';
import { useTourStore, LARGE_SCREEN_BREAKPOINT } from '../stores/useTourStore';

describe('Frontend Application Tour: Step Definitions & Integrity Unit Tests', () => {
  it('defines the complete set of tour steps covering Pattern Library, Studio, and Playground', () => {
    assert.equal(TOUR_STEPS.length, 12, 'Must have exactly 12 tour steps');

    for (const step of TOUR_STEPS) {
      assert.ok(step.id && step.id.length > 0, `Step must have a non-empty id: ${JSON.stringify(step)}`);
      assert.ok(step.route && step.route.length > 0, `Step ${step.id} must have a valid route`);
      assert.ok(step.targetSelector && step.targetSelector.length > 0, `Step ${step.id} must have a valid target selector`);
      assert.ok(step.title && step.title.length > 0, `Step ${step.id} must have a non-empty title`);
      assert.ok(step.content && String(step.content).length > 0, `Step ${step.id} must have non-empty content`);
      assert.ok(step.badge && step.badge.length > 0, `Step ${step.id} must have a badge`);
    }
  });

  it('covers the Pattern Library with search and card navigation', () => {
    const librarySteps = TOUR_STEPS.filter((s) => s.route === '/');
    assert.ok(librarySteps.length >= 2, 'Must have at least 2 steps on the Library page');

    const searchStep = librarySteps.find((s) => s.id === 'library-search');
    assert.ok(searchStep, 'Must have library search step');
    assert.equal(searchStep?.targetSelector, '[data-testid="pattern-search"]');

    const cardStep = librarySteps.find((s) => s.id === 'library-card');
    assert.ok(cardStep, 'Must have pattern card navigation step');
    assert.equal(cardStep?.targetSelector, '[data-testid="pattern-factory-method"]');
  });

  it('covers Pattern Studio with global & local perspectives and the 4 study tabs', () => {
    const studioSteps = TOUR_STEPS.filter((s) => s.route === '/pattern/factory-method');
    assert.ok(studioSteps.length >= 3, 'Must have at least 3 steps on Pattern Studio');

    // Perspectives
    const perspectiveStep = studioSteps.find((s) => s.id === 'studio-perspectives');
    assert.ok(perspectiveStep, 'Must have perspectives explanation step');
    assert.ok(String(perspectiveStep?.content).includes('Canonical'));
    assert.ok(String(perspectiveStep?.content).includes('Enterprise'));

    // 4 Tabs: Overview, Code, Diagrams, Trade-offs
    const tabsStep = studioSteps.find((s) => s.id === 'studio-tabs');
    assert.ok(tabsStep, 'Must have 4 tabs explanation step');
    assert.ok(String(tabsStep?.content).includes('Overview'));
    assert.ok(String(tabsStep?.content).includes('Code'));
    assert.ok(String(tabsStep?.content).includes('Diagrams'));
    assert.ok(String(tabsStep?.content).includes('Trade-Offs'));

    // Playground transition action
    const goPlaygroundStep = studioSteps.find((s) => s.id === 'studio-go-playground');
    assert.ok(goPlaygroundStep, 'Must have playground transition step');
  });

  it('covers Code Playground with all required action items', () => {
    const playgroundSteps = TOUR_STEPS.filter((s) => s.route.startsWith('/playground'));
    assert.equal(playgroundSteps.length, 7, 'Must have 7 steps covering Playground capabilities');

    // 1. Selection of patterns
    assert.ok(playgroundSteps.some((s) => s.id === 'playground-combobox'));

    // 2. Blank page button / scratchpad
    assert.ok(playgroundSteps.some((s) => s.id === 'playground-blank-scratchpad'));

    // 3. Canonical, Enterprise, and Curated buttons
    const sourceStep = playgroundSteps.find((s) => s.id === 'playground-sources');
    assert.ok(sourceStep, 'Must have multi-perspective source step');
    assert.ok(String(sourceStep?.content).includes('Canonical'));
    assert.ok(String(sourceStep?.content).includes('Enterprise'));
    assert.ok(String(sourceStep?.content).includes('Curated'));

    // 4. Pattern reference code / study guide link
    assert.ok(playgroundSteps.some((s) => s.id === 'playground-study-link'));

    // 5. Java & TS selection with code run
    const runStep = playgroundSteps.find((s) => s.id === 'playground-run');
    assert.ok(runStep, 'Must have language & code execution step');
    assert.ok(String(runStep?.content).includes('Java 25'));
    assert.ok(String(runStep?.content).includes('TypeScript'));

    // 6. Stacking row and column
    const layoutStep = playgroundSteps.find((s) => s.id === 'playground-layout');
    assert.ok(layoutStep, 'Must have stacking row and column layout step');
    assert.ok(String(layoutStep?.content).includes('Stacked Rows'));
    assert.ok(String(layoutStep?.content).includes('Split Columns'));

    // 7. User guide (F1)
    const guideStep = playgroundSteps.find((s) => s.id === 'playground-guide');
    assert.ok(guideStep, 'Must have playground guide step');
    assert.ok(String(guideStep?.content).includes('F1'));
  });
});

describe('Frontend Application Tour: Store & Responsive Guard Unit Tests', () => {
  beforeEach(() => {
    // Reset store state
    useTourStore.setState({
      status: 'idle',
      currentStepIndex: 0,
      hasSeenTour: false,
      dontShowAgain: false,
      isLargeScreen: true,
    });
  });

  it('starts tour at step 0 on large screens', () => {
    const store = useTourStore.getState();
    assert.equal(store.status, 'idle');
    assert.equal(store.currentStepIndex, 0);

    store.startTour();

    const updated = useTourStore.getState();
    assert.equal(updated.status, 'running');
    assert.equal(updated.currentStepIndex, 0);
  });

  it('advances steps sequentially and finishes when reaching the end', () => {
    useTourStore.getState().startTour();
    assert.equal(useTourStore.getState().currentStepIndex, 0);

    // Next step
    useTourStore.getState().nextStep(TOUR_STEPS.length);
    assert.equal(useTourStore.getState().currentStepIndex, 1);

    // Previous step
    useTourStore.getState().prevStep();
    assert.equal(useTourStore.getState().currentStepIndex, 0);

    // Previous step at 0 should not go below 0
    useTourStore.getState().prevStep();
    assert.equal(useTourStore.getState().currentStepIndex, 0);

    // Fast-forward to last step
    useTourStore.setState({ currentStepIndex: TOUR_STEPS.length - 1 });
    assert.equal(useTourStore.getState().currentStepIndex, 11);

    // Next on last step completes the tour
    useTourStore.getState().nextStep(TOUR_STEPS.length);
    assert.equal(useTourStore.getState().status, 'completed');
    assert.equal(useTourStore.getState().hasSeenTour, true);
  });

  it('handles skipping the tour cleanly', () => {
    useTourStore.getState().startTour();
    assert.equal(useTourStore.getState().status, 'running');

    useTourStore.getState().skipTour();
    assert.equal(useTourStore.getState().status, 'skipped');
    assert.equal(useTourStore.getState().hasSeenTour, true);
  });

  it('strictly excludes small screens and mobile viewports (< 1024px)', () => {
    // Set small screen mode
    useTourStore.getState().setIsLargeScreen(false);
    assert.equal(useTourStore.getState().isLargeScreen, false);

    // startTour should be rejected on mobile / small screens
    useTourStore.getState().startTour();
    assert.equal(useTourStore.getState().status, 'idle', 'Tour must not launch on small screens');

    // If running on desktop and resized to mobile, automatically pauses/stops
    useTourStore.getState().setIsLargeScreen(true);
    useTourStore.getState().startTour();
    assert.equal(useTourStore.getState().status, 'running');

    // User resizes viewport below 1024px
    useTourStore.getState().setIsLargeScreen(false);
    assert.equal(useTourStore.getState().status, 'idle', 'Tour must automatically halt when resized below desktop breakpoint');
  });

  it('manages dontShowAgain preference state', () => {
    assert.equal(useTourStore.getState().dontShowAgain, false);
    useTourStore.getState().setDontShowAgain(true);
    assert.equal(useTourStore.getState().dontShowAgain, true);
  });
});

