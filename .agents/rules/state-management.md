# State Management Architecture & Guidelines

This document establishes the **4-Layer State Management Framework** to be followed across all frontend applications.

---

## 1. The 4-Layer Mental Model

Never route all application state through a single global store. Categorize every piece of state into one of these four distinct layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. SERVER STATE        │ TanStack Query               │
│ (Remote API, DB data)  │ Auto-caching, sync, retries   │
├────────────────────────┼───────────────────────────────┤
│ 2. GLOBAL CLIENT STATE │ Zustand                      │
│ (Cross-cutting UI)     │ Bookmarks, preferences, themes│
├────────────────────────┼───────────────────────────────┤
│ 3. LOCAL UI STATE      │ useState / useReducer        │
│ (Component-isolated)   │ Form inputs, tabs, dropdowns  │
├────────────────────────┼───────────────────────────────┤
│ 4. STATIC CONTEXT      │ React Context (useContext)   │
│ (Low-frequency values) │ Localization, Auth user ID   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1: Server State (TanStack Query)

1. **Keep Server Data in the Query Cache**:
   * **Rule**: Never copy data fetched from an API into Zustand, Redux, or `useState`.
   * Consume the auto-generated hooks from `@workspace/api-client-react` directly in components.
2. **Query Key Conventions**:
   * Always structure query keys as hierarchical arrays:
     ```typescript
     ['patterns']                   // List of patterns
     ['patterns', patternId]        // Single pattern detail
     ['progress', userId]           // User learning progress
     ```
3. **Cache Invalidation & Mutations**:
   * After executing a mutation (e.g. saving quiz progress), invalidate related query keys rather than manually updating arrays:
     ```typescript
     const queryClient = useQueryClient();
     const { mutate } = useSaveProgress({
       mutation: {
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['progress'] });
         },
       },
     });
     ```

---

## 3. Layer 2: Global Client State (Zustand)

1. **Why Zustand**:
   * Requires no `<Provider>` wrapping (avoids deeply nested component trees).
   * Supports fine-grained selective subscriptions to eliminate unnecessary re-renders.
2. **Selector Discipline**:
   * Always subscribe to state slices using selectors:
     ```typescript
     // ❌ Anti-pattern: Causes re-renders whenever ANY state changes
     const store = useLearningStore();

     // ✅ Best Practice: Only re-renders when bookmarks change
     const bookmarks = useLearningStore((state) => state.bookmarks);
     const toggleBookmark = useLearningStore((state) => state.toggleBookmark);
     ```
3. **Local Storage Synchronization**:
   * Use Zustand's built-in `persist` middleware for persistent client state:
     ```typescript
     import { create } from 'zustand';
     import { persist } from 'zustand/middleware';

     interface LearningState {
       bookmarks: string[];
       toggleBookmark: (id: string) => void;
     }

     export const useLearningStore = create<LearningState>()(
       persist(
         (set) => ({
           bookmarks: [],
           toggleBookmark: (id) =>
             set((state) => ({
               bookmarks: state.bookmarks.includes(id)
                 ? state.bookmarks.filter((b) => b !== id)
                 : [...state.bookmarks, id],
             })),
         }),
         { name: 'gof-masterclass-storage' }
       )
     );
     ```

---

## 4. Layer 3: Local UI State (`useState` & `useReducer`)

1. **Colocate State with Components**:
   * Keep state as close to where it is used as possible. If state is only used in a search input or a modal toggle, keep it local.
   * Do not lift state up to `App.tsx` unless multiple independent screens need to read or mutate it.
2. **Use `useReducer` for Complex State Machines**:
   * When handling multiple sub-values or complex transitions (e.g., multi-step wizard, quiz progress, simulation pipeline), replace multiple `useState` calls with a strongly-typed `useReducer`.

---

## 5. Layer 4: Static Context (`useContext`)

1. **Low-Frequency Updates Only**:
   * Context is a dependency injection mechanism, not an optimized state manager. Any change to a Context value triggers a re-render for all consumers.
   * Reserve Context exclusively for rarely changing data:
     * App Theme (`'light' | 'dark'`)
     * Current Language / Locale
     * Authenticated User profile reference

---

## 6. Storage Schema Validation with Zod

1. **Defend Storage Boundaries**:
   * Any data loaded from `localStorage` or restored from an uploaded `.json` backup file must be validated at runtime with Zod:
     ```typescript
     import { SavedStateSchema } from '@/schemas/storage.schema';

     const parsed = SavedStateSchema.safeParse(data);
     if (!parsed.success) {
       console.error("Corrupted state detected:", parsed.error);
       // Handle fallback to default values gracefully
     }
     ```
