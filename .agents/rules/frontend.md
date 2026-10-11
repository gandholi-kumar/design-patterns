# Frontend Coding Standards (React 19 & TypeScript)

These rules apply to all frontend applications in this monorepo, primarily **`@workspace/pattern-masterclass`** and **`@workspace/mockup-sandbox`**.

---

## 1. Component Architecture & Decomposition

1. **Strict Component Isolation (No "God Components")**:
   * Never combine multiple route views, modals, and utilities in a single file.
   * Target maximum file length: **under 200–250 lines**. If a component exceeds this, extract sub-components or custom hooks.
   * Organize files by role:
     * `src/pages/`: Route-level screen components (e.g. `CatalogPage.tsx`, `QuizLabPage.tsx`).
     * `src/components/`: Reusable domain components (e.g. `PatternCard.tsx`).
     * `src/components/dialogs/`: Modal dialogs (e.g. `PatternDialog.tsx`, `BackupDialog.tsx`).
     * `src/components/ui/`: Generic design-system primitives (buttons, inputs, tabs).

2. **Single Responsibility**:
   * A component should handle rendering and UI interaction.
   * Extract business calculations, data transformations, and storage logic into `src/services/` or `src/hooks/`.

3. **Explicit Typing of Props**:
   * Always define component props with TypeScript `interface` or `type`.
   * Never use `React.FC` or `React.FunctionComponent`. Declare direct functional signatures:
   ```typescript
   interface PatternCardProps {
     pattern: Pattern;
     isSaved: boolean;
     onBookmark: (id: string) => void;
     onOpen: () => void;
   }

   export function PatternCard({ pattern, isSaved, onBookmark, onOpen }: PatternCardProps) {
     return ( ... );
   }
   ```

---

## 2. React 19 Best Practices & Hook Discipline

1. **Minimize `useEffect`**:
   * **Never use `useEffect` for data fetching**. Use TanStack Query hooks instead.
   * **Never use `useEffect` to synchronize state**. Compute derived values inline during render:
     ```typescript
     // ❌ Anti-pattern: Syncing derived state with useEffect
     const [count, setCount] = useState(0);
     useEffect(() => { setCount(items.length); }, [items]);

     // ✅ Best Practice: Compute inline
     const count = items.length;
     ```
   * Use `useEffect` exclusively for synchronization with external non-React systems (e.g., setting `document.title`, adding window event listeners, initializing third-party canvas engines).

2. **Custom Hook Extraction**:
   * Whenever a component manages non-trivial state machines or effects (e.g. keyboard shortcuts, local storage sync, media queries), extract it into a dedicated hook (`useKeyboardShortcut.ts`, `useMobile.ts`).

3. **Performance & Memoization**:
   * With the React 19 compiler in place, avoid premature manual memoization (`useCallback`, `useMemo`) unless performing heavy data transformations (e.g., filtering 10,000 items) or stabilizing dependency arrays for external subscribers.

---

## 3. Accessibility (a11y) & Semantic Markup

1. **Semantic HTML Elements**:
   * Use `<main>`, `<header>`, `<nav>`, `<aside>`, `<article>`, and `<section>` instead of generic `<div>` soup.
2. **Interactive Elements**:
   * Never use `<div onClick={...}>` or `<a onClick={...}>`. Use native `<button>` with explicit `type="button"`.
3. **Accessible Icon Buttons**:
   * Every icon-only button must include an `aria-label`:
     ```tsx
     <button type="button" aria-label="Bookmark pattern" onClick={onBookmark}>
       <Bookmark size={16} />
     </button>
     ```
4. **Dialogs & Modals**:
   * Modals must use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="dialog-title"`, and handle `Escape` key close events.

---

## 4. Styling & Design System Standards

1. **Tailwind CSS v4 & CSS Variables**:
   * Use semantic token classes (e.g., `bg-background`, `text-foreground`, `border-border`, `bg-muted`) rather than hardcoded hex colors (`bg-[#ffffff]`).
   * Adhere to the established font family tokens (`font-sans`, `font-mono`).
2. **Responsive Mobile-First Design**:
   * Ensure layouts adapt cleanly across viewports: mobile (`<768px`), tablet, and desktop (`>=1024px`).
3. **Dynamic Theme Hygiene**:
   * Ensure all custom colors support both light and dark themes using the `@custom-variant dark` tokens in `index.css`.
