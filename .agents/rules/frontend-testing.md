# Frontend Testing Standards (React 19, Vitest, Jest & React Testing Library)

This document establishes the mandatory unit and component integration testing rules for React applications in this workspace (specifically `@workspace/pattern-masterclass` and `@workspace/mockup-sandbox`).

---

## 1. Testing Philosophy: Behavior-Driven Over Implementation Details

> *"The more your tests resemble the way your software is used, the more confidence they can give you."* — Kent C. Dodds

### Core Tenets

1. **Test User Behavior, Never Component Internals**:
   * **Do not test**: internal component state variables (`wrapper.state('isOpen')`), private method calls, whether a specific internal helper function was called, or exact component re-render counts.
   * **Do test**: what the user sees in the DOM (rendered text, headings, dialogs) and how the application responds when users trigger events (clicks, typing, keyboard navigation).

2. **Resilience to Refactoring**:
   * A well-written test must pass when code is refactored from `useState` to `useReducer`, or from inline state to a custom hook or Zustand store, as long as external behavior and user-facing DOM remain unchanged.

3. **The Modern Testing Pyramid**:
   * **Unit Tests**: Pure domain logic, utility functions, algorithms, and Zustand store action reducers.
   * **Component Integration Tests**: React components rendered via React Testing Library with real DOM events, verifying user flows and edge cases.
   * **End-to-End (E2E) Tests**: High-level smoke tests of critical customer journeys using Playwright against running dev/preview servers.

---

## 2. Test Runner Selection: Vitest vs Jest in Modern React

| Dimension | Vitest (Recommended for Vite) | Jest (Traditional Standard) |
| :--- | :--- | :--- |
| **Monorepo / Build Integration** | Shares `vite.config.ts` plugins, alias paths (`@/...`), CSS processing, and TS configuration out-of-the-box with **zero duplicate configuration**. | Requires separate babel/ts-jest/SWC transforms, module mapper configs (`moduleNameMapper`), and CSS mockers. |
| **Execution Speed** | Extremely fast; uses Vite's instant native ESM pipeline and worker threads with in-memory caching. | Slower startup; transpiles every file before execution unless paired with high-performance SWC transforms. |
| **React 19 Support** | Native support for React 19 JSX runtime, server components, and React 19 transitions. | Requires up-to-date `@babel/preset-react` or SWC compiler options for React 19 JSX transform. |
| **API Compatibility** | 100% drop-in Jest API compatible (`describe`, `it`, `test`, `expect`, `beforeEach`, `afterEach`, `vi` vs `jest`). | The original API standard. |

### Rule:
* In this Vite monorepo, **Vitest** is the standard test runner.
* All testing principles, query hierarchies, and mocking techniques defined here apply identically to **Jest** when configuring Webpack/Next.js projects.

---

## 3. Query Precedence: How to Locate Elements

Always query the DOM using the exact priority defined by React Testing Library. This guarantees that your tests enforce digital accessibility (WCAG 2.2 AA) by design.

### The RTL Query Hierarchy

```text
Priority 1: Queries Accessible to Everyone (Reflects assistive tech & visual users)
  ├── getByRole(role, { name: /.../i })      <-- [PRIMARY GOLD STANDARD]
  ├── getByLabelText(/.../i)                 <-- [Form inputs, selects, switches]
  ├── getByPlaceholderText(/.../i)           <-- [Only if input lacks explicit label]
  ├── getByText(/.../i)                      <-- [Headings, paragraph descriptions, buttons]
  └── getByDisplayValue(/.../i)              <-- [Current input value assertions]

Priority 2: Semantic HTML Queries
  ├── getByAltText(/.../i)                   <-- [Images, avatars, illustrations]
  └── getByTitle(/.../i)                     <-- [SVG icon titles, iframe titles]

Priority 3: Test IDs (Strict Last Resort)
  └── getByTestId(/.../i)                    <-- [Use ONLY when role or text cannot locate element]
```

### Query Variants & When to Use Them

| Variant | Throws if Not Found? | Returns Promise? | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **`getBy...`** | **Yes** (immediate error) | No | Synchronous assertion that an element is present in the DOM. |
| **`queryBy...`** | **No** (returns `null`) | No | **Asserting absence**: `expect(screen.queryByRole('dialog')).not.toBeInTheDocument()`. |
| **`findBy...`** | **Yes** (after timeout) | **Yes** | **Asynchronous appearance**: Elements rendered after an API call, state transition, or dynamic import. |

```typescript
// ❌ Anti-pattern: Using CSS class selectors or arbitrary test IDs everywhere
const button = container.querySelector('.submit-btn');
const card = screen.getByTestId('pattern-card-strategy');

// ✅ Best Practice: Semantic, accessible role queries
const submitButton = screen.getByRole('button', { name: /save changes/i });
const dialog = screen.getByRole('dialog', { name: /architectural decision/i });
```

---

## 4. User Event vs `fireEvent`: Realistic User Interaction

### Why `fireEvent` is Deprecated for UI Behavior
`fireEvent.click(button)` only dispatches a single synthetic DOM `click` event. In reality, a human user clicking a button triggers:
`pointerover` ➔ `mouseover` ➔ `pointerdown` ➔ `mousedown` ➔ `focus` ➔ `pointerup` ➔ `mouseup` ➔ `click`.

### The Rule: Always Use `@testing-library/user-event`
Set up `userEvent` before rendering or at the start of each test:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits user comment on Enter or Click', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<CommentForm onSubmit={handleSubmit} />);

  const input = screen.getByRole('textbox', { name: /add note/i });
  const submitBtn = screen.getByRole('button', { name: /publish/i });

  // Types real character-by-character events with focus and keyboard codes
  await user.type(input, 'Strategy pattern decouples algorithms.');
  await user.click(submitBtn);

  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(handleSubmit).toHaveBeenCalledWith('Strategy pattern decouples algorithms.');
});
```

---

## 5. Comprehensive Mocking Strategies

### 1. Mocking External Libraries & Visual Components
Heavy third-party components (e.g. Monaco Editor, Mermaid JS diagrams, Mapbox, Canvas engines) should be mocked in unit tests to prevent slow execution and JSDOM rendering errors.

```typescript
// Mocking Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange }: { value: string; onChange?: (val: string) => void }) => (
    <div data-testid="mock-monaco-editor">
      <textarea
        aria-label="Monaco Code Editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}));
```

### 2. Mocking Client State Stores (Zustand)
When testing components that consume Zustand stores, prevent test bleed by resetting the store state in `beforeEach` or `afterEach`:

```typescript
import { useWorkspacePreferencesStore } from '../stores';

const initialStoreState = useWorkspacePreferencesStore.getState();

beforeEach(() => {
  // Reset store to pure defaults before each test runs
  useWorkspacePreferencesStore.setState(initialStoreState, true);
});
```

### 3. Mocking Browser APIs in JSDOM
JSDOM does not implement all browser Web APIs (e.g., `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `scrollTo`, `clipboard`). Mock them cleanly:

```typescript
// Mock matchMedia for theme & responsive tests
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock navigator.clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });

  // Mock window.scrollTo
  window.scrollTo = vi.fn();
});
```

### 4. Mocking Server State & Network (TanStack Query / Fetch)
* **Never mock raw `fetch` with multiple inline ad-hoc returns if MSW is available**.
* When testing components using TanStack React Query, always wrap the test component in a `QueryClientProvider` configured with retries disabled:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Prevents tests from hanging on failed queries
        gcTime: 0,
      },
    },
  });
}

export function renderWithProviders(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}
```

---

## 6. Asynchronous Behavior & React 19 Transitions

1. **Avoid Arbitrary `sleep()` or `setTimeout()`**:
   * Never write `await new Promise(r => setTimeout(r, 1000))`. This introduces flaky tests and slows CI.
   * Use RTL's `waitFor` or `findBy...`:

```typescript
// ❌ Flaky & Slow
await new Promise((r) => setTimeout(r, 500));
expect(screen.getByText('Saved')).toBeInTheDocument();

// ✅ Deterministic Async Waiting
await waitFor(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
});

// ✅ Or use findBy directly
const savedBadge = await screen.findByText('Saved');
expect(savedBadge).toBeInTheDocument();
```

2. **Testing Fake Timers (Debounce, Intervals, Toasts)**:
   * When testing countdowns (e.g. 10-second toast auto-dismiss) or debounced inputs, use fake timers:

```typescript
test('auto-dismisses alert after 5000ms', async () => {
  vi.useFakeTimers();
  const handleClose = vi.fn();

  render(<AutoDismissAlert timeout={5000} onClose={handleClose} />);

  expect(handleClose).not.toHaveBeenCalled();

  // Advance time deterministically
  vi.advanceTimersByTime(5000);

  expect(handleClose).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
```

---

## 7. Testing Custom Hooks

Test custom hooks in isolation using `renderHook` from `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments and resets counter state', () => {
  const { result } = renderHook(() => useCounter(10));

  expect(result.current.count).toBe(10);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(11);

  act(() => {
    result.current.reset();
  });

  expect(result.current.count).toBe(10);
});
```

---

## 8. Crucial Points Often Missed

1. **Testing Error Boundaries**:
   * Temporarily silence `console.error` during tests that deliberately throw errors so CI test logs remain clean.
   ```typescript
   const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
   render(
     <NotesErrorBoundary>
       <ExplodingComponent />
     </NotesErrorBoundary>
   );
   expect(screen.getByRole('alert')).toHaveTextContent(/error loading note/i);
   consoleSpy.mockRestore();
   ```

2. **Negative Assertions (Checking that something did NOT happen)**:
   * Use `queryBy...` combined with `.not.toBeInTheDocument()`:
   ```typescript
   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
   ```

3. **Accessibility Assertions (axe-core)**:
   * Periodically assert component accessibility using `axe`:
   ```typescript
   import { axe } from 'vitest-axe';
   const { container } = render(<PatternCard pattern={mockPattern} />);
   const results = await axe(container);
   expect(results).toHaveNoViolations();
   ```

4. **Keyboard Accessibility Tests**:
   * Ensure tabs, modals, and dropdowns can be operated via `Tab`, `Enter`, `Space`, and `Escape`:
   ```typescript
   await user.keyboard('{Escape}');
   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
   ```

---

## 9. Comprehensive Example: Testing a Feature Component

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WipModulePlaceholder } from './WipModulePlaceholder';

describe('WipModulePlaceholder', () => {
  const defaultProps = {
    moduleIndex: '05 / PATTERN STUDIO',
    moduleTitle: 'Interactive Pattern Studio',
    moduleHeadline: 'Visual drag-and-drop structural simulator.',
    upcomingFeatures: [
      { title: 'Component Wiring', desc: 'Connect Strategy algorithms.' },
    ],
  };

  it('renders module title, index, and upcoming features correctly', () => {
    render(<WipModulePlaceholder {...defaultProps} />);

    expect(screen.getByText('05 / PATTERN STUDIO')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /interactive pattern studio/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Component Wiring')).toBeInTheDocument();
  });

  it('triggers prototype launch callback when button is clicked', async () => {
    const user = userEvent.setup();
    const handleLaunch = vi.fn();

    render(
      <WipModulePlaceholder
        {...defaultProps}
        onLaunchPrototype={handleLaunch}
        prototypeName="Studio Alpha"
      />
    );

    const launchButton = screen.getByRole('button', { name: /launch studio alpha/i });
    expect(launchButton).toBeInTheDocument();

    await user.click(launchButton);
    expect(handleLaunch).toHaveBeenCalledTimes(1);
  });
});
```
