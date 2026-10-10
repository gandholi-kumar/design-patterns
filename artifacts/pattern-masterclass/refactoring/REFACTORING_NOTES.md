# Refactoring Notes: `@workspace/pattern-masterclass`

**Project Type**: React 19 + Vite 7 Single Page Application  
**Location**: `artifacts/pattern-masterclass`  
**Primary File**: `src/App.tsx` (54.8 KB, 363 lines)

---

## 1. Architectural Diagnosis

### 1.1 The "God Component" Anti-Pattern
[src/App.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/App.tsx) currently houses **15+ distinct components, utilities, and models** in a single file:
* **Views**: `Catalog`, `Decision`, `Playground`, `Simulators`, `QuizLab`, `NotFound`
* **Modals**: `PatternDialog`, `BackupDialog`
* **Sub-views**: `PatternOverview`, `PatternCode`, `PatternTradeoffs`, `PageIntro`, `PatternCard`
* **Low-level Binary Utilities**: `zipStore`, `crc32`, `download`
* **State / Calculations**: `getSaved`, `STORE`, `progressListCount`, `accuracy`

**Problems Caused**:
* Defeats Vite's route-based code-splitting.
* High cognitive load and risk of merge conflicts.
* Impossible to write isolated React Testing Library unit tests for individual screens.
* Prop drilling `saved` and `setSaved` through 5-6 levels of components.

---

## 2. Refactoring Blueprint

### Target Directory Structure
Refactor `artifacts/pattern-masterclass/src/` into the following modular hierarchy:

```text
src/
├── components/
│   ├── dialogs/
│   │   ├── PatternDialog.tsx       # Detail modal & tabs (Overview, Code, Diagrams, Trade-offs)
│   │   └── BackupDialog.tsx        # Export / restore / appearance settings modal
│   ├── cards/
│   │   └── PatternCard.tsx         # Reusable card component in Catalog
│   ├── PageIntro.tsx               # Reusable section header banner
│   └── ui/                         # Prune unused components, retain active controls
├── hooks/
│   ├── useLearningStore.ts         # Centralized state management & localStorage persistence
│   └── useKeyboardShortcut.ts     # Command-K search shortcut
├── pages/
│   ├── CatalogPage.tsx             # Pattern library & filters
│   ├── DecisionPage.tsx            # Diagnostic recommendation tree
│   ├── PlaygroundPage.tsx          # Code editor & simulated executions
│   ├── SimulatorsPage.tsx          # Interactive pattern collaboration simulations
│   ├── QuizLabPage.tsx             # Scenario questions with Leitner box algorithm
│   └── NotFoundPage.tsx            # 404 screen
├── schemas/
│   └── storage.schema.ts           # Zod schema for backup validation and migrations
├── services/
│   ├── zip-service.ts              # zipStore, crc32, download helpers
│   └── simulator-strategies.ts     # Extensible Strategy Pattern for simulator engines
├── data.ts                         # Static catalog of 23 GoF patterns & quizzes
├── java-examples.ts                # Java reference implementations
├── PatternDiagrams.tsx             # Mermaid integration
├── pattern-diagrams.ts             # Raw UML / Mermaid diagram definitions
├── index.css
├── main.tsx
└── App.tsx                         # Lean root shell (<80 lines)
```

---

## 3. High-Priority Refactoring Actions

### Action 1: Isolate Binary Utilities (`src/services/zip-service.ts`)
Move low-level binary manipulation from `App.tsx` (lines 354–361) into a dedicated service:

```typescript
// src/services/zip-service.ts
export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function zipStore(files: [string, string][]): ArrayBuffer {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  const put = (arr: Uint8Array, pos: number, val: number) => {
    arr[pos] = val & 255;
    arr[pos + 1] = (val >>> 8) & 255;
    arr[pos + 2] = (val >>> 16) & 255;
    arr[pos + 3] = (val >>> 24) & 255;
  };

  const crc32 = (data: Uint8Array) => {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  for (const [name, body] of files) {
    const n = enc.encode(name);
    const d = enc.encode(body);
    const crc = crc32(d);
    const local = new Uint8Array(30 + n.length + d.length);
    put(local, 0, 0x04034b50);
    local[4] = 20;
    put(local, 14, crc);
    put(local, 18, d.length);
    put(local, 22, d.length);
    local[26] = n.length;
    local.set(n, 30);
    local.set(d, 30 + n.length);
    chunks.push(local);

    const c = new Uint8Array(46 + n.length);
    put(c, 0, 0x02014b50);
    c[4] = 20;
    c[6] = 20;
    put(c, 16, crc);
    put(c, 20, d.length);
    put(c, 24, d.length);
    c[28] = n.length;
    put(c, 42, offset);
    c.set(n, 46);
    central.push(c);
    offset += local.length;
  }

  const start = offset;
  const centralSize = central.reduce((a, x) => a + x.length, 0);
  const end = new Uint8Array(22);
  put(end, 0, 0x06054b50);
  end[8] = files.length;
  end[10] = files.length;
  put(end, 12, centralSize);
  put(end, 16, start);

  const parts = [...chunks, ...central, end].map(p => new Uint8Array(p).buffer as ArrayBuffer);
  return new Blob(parts).arrayBuffer() as any;
}
```

---

### Action 2: Add Zod Validation for Backup Restoration (`src/schemas/storage.schema.ts`)
Prevent corrupted or malicious JSON file imports:

```typescript
// src/schemas/storage.schema.ts
import { z } from 'zod';

export const ProgressItemSchema = z.object({
  attempts: z.number().int().nonnegative().default(0),
  correct: z.number().int().nonnegative().default(0),
  bookmarked: z.boolean().default(false),
  note: z.string().default(''),
  box: z.number().int().min(1).max(5).default(1),
});

export const SavedStateSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  bookmarks: z.array(z.string()).default([]),
  progress: z.record(ProgressItemSchema).default({}),
  mode: z.enum(['typescript', 'java']).default('typescript'),
  scale: z.enum(['normal', 'large', 'projector']).optional().default('normal'),
});

export type SavedState = z.infer<typeof SavedStateSchema>;
export type ProgressItem = z.infer<typeof ProgressItemSchema>;
```

**Usage in Backup Restoration**:
```typescript
const restore = (file?: File) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(String(reader.result));
      const parsed = SavedStateSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Invalid backup file: ' + parsed.error.issues[0]?.message);
      }
      setSaved(parsed.data);
      setBackupOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not read backup file.');
    }
  };
  reader.readAsText(file);
};
```

---

### Action 3: Replace Prop-Drilling with a Custom Hook (`src/hooks/useLearningStore.ts`)
Encapsulate localStorage read/write and state updates:

```typescript
// src/hooks/useLearningStore.ts
import { useState, useEffect, useCallback } from 'react';
import { SavedState, SavedStateSchema } from '../schemas/storage.schema';

const STORE_KEY = 'gof-masterclass-storage';

export function useLearningStore() {
  const [saved, setSaved] = useState<SavedState>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return SavedStateSchema.parse(raw);
    } catch {
      return SavedStateSchema.parse({});
    }
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(saved));
    document.documentElement.classList.toggle('dark', saved.theme === 'dark');
    document.documentElement.setAttribute('data-scale', saved.scale || 'normal');
  }, [saved]);

  const toggleBookmark = useCallback((patternId: string) => {
    setSaved(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(patternId)
        ? prev.bookmarks.filter(id => id !== patternId)
        : [...prev.bookmarks, patternId],
    }));
  }, []);

  const updateQuizProgress = useCallback((patternId: string, isCorrect: boolean, note?: string) => {
    setSaved(prev => {
      const old = prev.progress[patternId] || { attempts: 0, correct: 0, bookmarked: false, note: '', box: 1 };
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [patternId]: {
            ...old,
            attempts: old.attempts + 1,
            correct: old.correct + (isCorrect ? 1 : 0),
            box: isCorrect ? Math.min(5, old.box + 1) : 1,
            note: note !== undefined ? note : old.note,
          },
        },
      };
    });
  }, []);

  return { saved, setSaved, toggleBookmark, updateQuizProgress };
}
```

---

### Action 4: Refactor Simulators Using the Strategy Pattern
Replace hardcoded `act(i)` ternary ladders (lines 224–249) with polymorphic strategies:

```typescript
// src/services/simulator-strategies.ts
export interface SimulatorDriver {
  id: string;
  title: string;
  execute(actionIndex: number, currentContext: any): { nextContext: any; log: string };
}

export const SIMULATORS: Record<string, SimulatorDriver> = {
  strategy: {
    id: 'strategy',
    title: 'Strategy / Route Planning',
    execute(i) {
      const routes = [
        'Fast route SF→Monterey via Highway · 92 min',
        'Scenic route SF→Monterey via Coast · 2h 14m',
        'Low-toll route SF→Monterey via CA-152 · $4.50'
      ];
      return { nextContext: { route: routes[i] }, log: `${routes[i]} · Navigator unchanged` };
    }
  },
  observer: {
    id: 'observer',
    title: 'Observer / Order Events',
    execute(i) {
      const snippets = [
        'Inventory reserved · email receipt queued · analytics event recorded',
        'Payment ledger updated · order marked paid · customer notified',
        'Support alert raised · delivery ETA recalculated · customer notified'
      ];
      return { nextContext: {}, log: `${snippets[i]} · 3 observers notified` };
    }
  }
};
```

---

### Action 5: Prune Unused UI Components
There are 55 components in `src/components/ui/`. Either:
1. Replace hand-rolled elements in `App.tsx` (`<div className="modal-backdrop">`) with `<Dialog>` from [src/components/ui/dialog.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/pattern-masterclass/src/components/ui/dialog.tsx) to gain proper ARIA accessibility and focus traps.
2. Or delete unused files in `src/components/ui/` to eliminate dead code.
