import type { TourStep } from '../../types/tour';

export const TOUR_STEPS: TourStep[] = [
  // --- PAGE 1: PATTERN LIBRARY ---
  {
    id: 'library-search',
    route: '/',
    targetSelector: '[data-testid="pattern-search"]',
    badge: 'STEP 01 / 12 · PATTERN LIBRARY',
    title: 'Explore the 23 Classic Patterns',
    content:
      'Welcome to the Masterclass! The collection organizes all 23 classic Gang of Four patterns into Creational, Structural, and Behavioral families. You can filter by family, search keywords, or sort by complexity and bookmarks.',
    tip: 'Press Ctrl+K anywhere in the library to jump straight to the search bar.',
    placement: 'bottom',
  },
  {
    id: 'library-card',
    route: '/',
    targetSelector: '[data-testid="pattern-factory-method"]',
    badge: 'STEP 02 / 12 · PATTERN CARD',
    title: 'Interactive Pattern Cards',
    content:
      'Each card displays the pattern family, tagline, memory hook, and a quick-save bookmark button. Clicking any card opens the deep-dive Pattern Studio.',
    tip: 'Click Next to jump straight into the Factory Method Pattern Studio.',
    placement: 'right',
  },

  // --- PAGE 2: PATTERN STUDIO (DETAIL PAGE) ---
  {
    id: 'studio-perspectives',
    route: '/pattern/factory-method',
    targetSelector: '[data-testid="global-perspective-canonical"]',
    badge: 'STEP 03 / 12 · PERSPECTIVE ARCHITECTURE',
    title: 'Canonical vs. Enterprise Cloud Perspectives',
    content:
      'Explore patterns from two distinct viewpoints: 🎓 Canonical (academic GoF & Refactoring Guru foundational structure) and 🏢 Enterprise (production-ready distributed cloud architectures). The topbar switches the entire application, while the local pattern banner switcher allows you to decouple a single pattern to inspect both sides.',
    tip: 'Click the local reset icon (↺) in the studio banner anytime to re-sync with global settings.',
    placement: 'bottom',
  },
  {
    id: 'studio-tabs',
    route: '/pattern/factory-method',
    targetSelector: '[role="tablist"][aria-label="Pattern detail tabs"]',
    badge: 'STEP 04 / 12 · PATTERN STUDIO',
    title: 'Comprehensive Architectural Breakdown',
    content:
      'Master each pattern across 4 focused tabs: Overview (intent, problem & mechanics), Code (full TypeScript and Java implementations), Diagrams (interactive Mermaid UML class & sequence charts), and Trade-Offs (honest pros, cons, and antipattern warnings).',
    tip: 'Press N to toggle your personal architectural study notes.',
    placement: 'bottom',
  },
  {
    id: 'studio-go-playground',
    route: '/pattern/factory-method',
    targetSelector: '[data-testid="topbar-playground-btn"]',
    badge: 'STEP 05 / 12 · LIVE PLAYGROUND',
    title: 'Hands-On Sandbox Practice',
    content:
      'Ready to experiment? Click the terminal icon in the topbar (or press P) to load this active pattern into the Interactive Code Playground.',
    tip: 'Click Next to open the Code Playground with Factory Method pre-loaded.',
    placement: 'bottom-end',
  },

  // --- PAGE 3: CODE PLAYGROUND ---
  {
    id: 'playground-combobox',
    route: '/playground?pattern=factory-method',
    targetSelector: '[data-testid="playground-pattern-combobox"]',
    badge: 'STEP 06 / 12 · CODE PLAYGROUND',
    title: 'Fast Pattern Switching',
    content:
      'Switch between any of the 23 design patterns on the fly without leaving your editor. Search by name, category, or keyword to instantly reload the starter code and project files.',
    tip: 'Use arrow keys inside the dropdown to navigate patterns rapidly.',
    placement: 'bottom-start',
  },
  {
    id: 'playground-blank-scratchpad',
    route: '/playground?pattern=factory-method',
    targetSelector: '[data-testid="switch-blank-editor-btn"]',
    badge: 'STEP 07 / 12 · BLANK CANVAS',
    title: 'Custom Coding Scratchpad',
    content:
      'Need a clean slate? Toggle the Blank Scratchpad button to open an empty project with a standard main() entrypoint. Perfect for practicing implementations from memory or sketching custom designs.',
    tip: 'Switch back to any design pattern anytime from the pattern dropdown.',
    placement: 'bottom',
  },
  {
    id: 'playground-sources',
    route: '/playground?pattern=factory-method',
    targetSelector: '.playground-source-switch',
    badge: 'STEP 08 / 12 · CODE PERSPECTIVES',
    title: 'Canonical, Enterprise & Curated Code',
    content:
      'Choose between three distinct code implementations: 🎓 Canonical (standard single-file GoF textbook implementation), 🏢 Enterprise (cloud-scale distributed implementation with error recovery), and 📁 Curated (multi-file modular OOP architecture).',
    tip: 'The curated source includes helper files, services, and interfaces.',
    placement: 'bottom',
  },
  {
    id: 'playground-study-link',
    route: '/playground?pattern=factory-method',
    targetSelector: '[data-testid="view-pattern-study-link"]',
    badge: 'STEP 09 / 12 · STUDY LINK',
    title: 'Instant Study Guide Access',
    content:
      'While coding in the playground, click this book icon at any time to jump directly back to the detailed architectural documentation, diagrams, and trade-offs for the active pattern.',
    tip: 'Your editor changes are preserved in memory while navigating between views.',
    placement: 'bottom',
  },
  {
    id: 'playground-run',
    route: '/playground?pattern=factory-method',
    targetSelector: '[data-testid="run-example"]',
    badge: 'STEP 10 / 12 · EXECUTION ENGINE',
    title: 'Run Java 25 & TypeScript in Real-Time',
    content:
      'Toggle between Java 25 LTS (isolated server sandbox) and TypeScript (client Web Worker sandbox). Hit the Run button to compile, execute, and view colored standard output in the terminal below.',
    tip: 'Press Ctrl+Enter to execute code immediately from the keyboard.',
    placement: 'bottom',
  },
  {
    id: 'playground-layout',
    route: '/playground?pattern=factory-method',
    targetSelector: '.layout-toggle-group',
    badge: 'STEP 11 / 12 · WORKSPACE ERGONOMICS',
    title: 'Stacked Rows vs. Side-by-Side Split View',
    content:
      'Customize your workspace view: Stacked Rows provides a single full-width vertical scroll, while Split Columns displays the editor and live terminal side-by-side with a resizable divider.',
    tip: 'Drag the center divider handle in split mode to resize the terminal.',
    placement: 'bottom',
  },
  {
    id: 'playground-guide',
    route: '/playground?pattern=factory-method',
    targetSelector: '[data-testid="playground-guide-button"]',
    badge: 'TOUR COMPLETE · READY TO CODE!',
    title: 'In-Depth Guide & Next Steps',
    content:
      'Press F1 anytime to open the Playground Guide, detailing compiler limits, standard libraries, and keyboard shortcuts. You have completed the tour! You can restart this tour anytime from the sidebar footer.',
    tip: 'Click Finish to close the tour and start building.',
    placement: 'bottom-end',
  },
];
