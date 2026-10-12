# PRD: Per-Pattern Rich Notes System — v2

**Document ID:** PRD-2026-003-v2  
**Feature Slug:** `per-pattern-notes`  
**Status:** Gate 1 Clarifications Incorporated — Ready for Gate 2 (Architecture + ADR)  
**Author:** Antigravity Agent (via `new-feature-workflow` skill)  
**Created:** 2026-10-12 | **Revised:** 2026-10-12  
**Scope:** Complete production scope. DB-agnostic (localStorage-first, switchable to PostgreSQL at any time).

---

## Gate 1 Clarifications Summary

| # | Topic | Decision |
| :--- | :--- | :--- |
| **C1** | Scroll rule | Max 2 **nested** levels. Sibling scrolls (left pane + right pane) = 2 children of the same parent = OK. Three levels deep = forbidden. |
| **C2** | Scope | Full complete scope — not MVP. No shortcuts. |
| **C3** | DB abstraction | `NoteRepository` interface wraps all storage. Swap localStorage → any DB with zero component changes. |
| **C4** | Backward compat | Not required. App is pre-launch with no users. |
| **C5** | UI toggle behavior | Toggle switches **orientation** only: horizontal split (default, side-by-side) ↔ vertical split (stacked). Same `react-resizable-panels`. User drags divider in both modes. |
| **C6** | "Saved ✓" location | Inline in notes panel header, right side. Full detail in Section 3.3. |
| **C7** | Image handling | Auto-resize to pane width (preserve quality). Original blob in IndexedDB. User drags corners to resize manually. |
| **C8** | DB: SQL vs NoSQL | **PostgreSQL + JSONB** recommended. Already in the stack (Drizzle ORM + `lib/db`). |
| **C9** | Free DB hosting | Neon (top pick) · Supabase · CockroachDB — full table in Section 8.2. |
| **C10** | Zoom / pinch | Per-image zoom controls (`[🔍+]` `[🔍-]` + pinch on touch). Notes panel itself does NOT zoom as a unit. |
| **C11** | Export/Import | Export all notes or individual note (`.md` or `.json`). Import via `.json` upload. Full spec in FR-8 and FR-9. |

---

## Phase 1: Codebase Research (Unchanged)

| Area | Current State | Impact |
| :--- | :--- | :--- |
| `Progress.note: string` | Already stored in `localStorage` | Replace with `noteContent: string (JSON)` — no migration (pre-launch) |
| `react-resizable-panels ^2.1.7` | Already installed | Powers both horizontal and vertical split — zero new dep needed |
| `framer-motion ^12.23.24` | Already installed | Orientation switch animation |
| `vaul ^1.1.2` | Already installed | Mobile bottom sheet (no backdrop) |
| `zod ^3.25.76` | Already installed | NoteDocument + import validation |
| `NotesDrawer.tsx` | Has dark backdrop overlay | Cannot reuse — prohibited |
| `lib/db` (Drizzle + PostgreSQL) | Already in workspace | Future DB migration path is trivially clean |

---

## Phase 2: Problem Statement (Unchanged — See v1)

---

## Phase 3: Complete UI Design — All States

### 3.1 Default — Horizontal Split (Content Left | Notes Right)

```
VIEWPORT (full screen):
┌───────┬─────────────────────────────────────────────────────────────────────┐
│SIDEBAR│  MAIN AREA                                                           │
│(fixed)│ ┌─────────────────────────────────────────────────────────────────┐ │
│       │ │ Breadcrumb: GoF > Abstract Factory          [Focus][Light][M]   │ │
│Pattern│ ├─────────────────────────────────────────────────────────────────┤ │
│library│ │ CREATIONAL  PATTERN 02 OF 23                                     │ │
│       │ │ Abstract Factory.         [↺][🎓][🏢]    [💡 Memory hook]      │ │
│Code   │ ├─────────────────────────────────────────────────────────────────┤ │
│playgrd│ │ [Overview][Code][Diagrams][Trade-Offs]   [📝 N]  [⊟ Shift+N]   │ │
│       │ │                                            ↑toggle  ↑orientation │ │
│Decisn │ ├───────────────────────────────────╦═══════════════════════════════┤ │
│engine │ │                                   ║                               │ │
│       │ │  CONTENT PANE (65%)               ║  NOTES PANEL (35%)            │ │
│Pattern│ │  ┌───────────────────────────┐   ║  ┌─────────────────────────┐  │ │
│studio │ │  │ THE INTENT                │   ║  │ MY NOTES           ●    │  │ │
│       │ │  │ Provide an interface...   │   ║  │ ABSTRACT FACTORY  Saved ✓│  │ │
│Scenrio│ │  │                           │   ║  ├─────────────────────────┤  │ │
│lab    │ │  │ THE PROBLEM / SOLUTION    │   ║  │[B][I][`][~~][H1][H2][H3]│  │ │
│       │ │  │ A multi-cloud deploy...   │   ║  │[• ][1.]["][img][/][···] │  │ │
│My     │ │  │                           │   ║  ├─────────────────────────┤  │ │
│Notes 8│ │  │ USE IT WHEN               │   ║  │ # My Understanding      │  │ │
│       │ │  │ ✓ When your system...     │   ║  │                         │  │ │
│────── │ │  │                           │   ║  │ The Abstract Factory is │  │ │
│       │ │  │ THINK TWICE WHEN          │   ║  │ like a themed furniture │  │ │
│Practice│ │  │ ✗ When requirements...   │   ║  │ store.                  │  │ │
│0/3    │ │  │                           │   ║  │                         │  │ │
│       │ │  │  ↑ scroll #1 (content)    │   ║  │ [img: aws.png]          │  │ │
│Backup │ │  └───────────────────────────┘   ║  │ 🔍+ 🔍-  ↔ resize      │  │ │
│settings│ │                                  ║  │  ↑ scroll #2 (notes)    │  │ │
│       │ ├───────────────────────────────────╩  ├─────────────────────────┤  │ │
│       │ │  ← drag handle (═══) ────────────── ─┤ All Notes → │ ↓ Export  │  │ │
│       │ ├────────────────────────────────────────────────────────────────┤  │ │
│       │ │ [← BUILDER]        PATTERN 02/23  ← →         [FACTORY M →]   │  │ │
│       │ └─────────────────────────────────────────────────────────────────┘ │
└───────┴─────────────────────────────────────────────────────────────────────┘

  ╦═══╗  = react-resizable-panels vertical drag handle
  ●       = unsaved changes amber dot (appears in header when user is typing)
  Saved ✓ = appears after 2s debounce save, fades after 4s
  [📝 N]  = Notes toggle button (N key shortcut)
  [⊟ Shift+N] = Orientation toggle (horizontal ↔ vertical)
```

---

### 3.2 Vertical Split Mode (Toggled — Content Top | Notes Bottom)

```
VIEWPORT (full screen):
┌───────┬──────────────────────────────────────────────────────────────────────┐
│SIDEBAR│  MAIN AREA                                                            │
│(fixed)│ ┌──────────────────────────────────────────────────────────────────┐ │
│       │ │ Breadcrumb                                    [Focus][Light][M]  │ │
│       │ ├──────────────────────────────────────────────────────────────────┤ │
│       │ │ Abstract Factory.                [↺][🎓][🏢] [💡 Memory hook]   │ │
│       │ ├──────────────────────────────────────────────────────────────────┤ │
│       │ │ [Overview][Code][Diagrams][Trade-Offs]    [📝 N]  [⊞ Shift+N]   │ │
│       │ ╠══════════════════════════════════════════════════════════════════╣ │
│       │ │  CONTENT PANE (60% of content height)                            │ │
│       │ │  THE INTENT: Provide an interface for creating...                │ │
│       │ │  THE PROBLEM / THE SOLUTION / USE IT WHEN / THINK TWICE          │ │
│       │ │    ↑ scroll #1 (content pane scrolls independently)              │ │
│       │ ╠══════════════════════════════════════════════════════════════════╣ │
│       │ ║  ←──── drag handle: drag UP to expand notes, DOWN to shrink ────  ║ │
│       │ ╠══════════════════════════════════════════════════════════════════╣ │
│       │ │  NOTES PANEL (40% of content height, full width)                 │ │
│       │ │  MY NOTES · ABSTRACT FACTORY                    Saved ✓ 1s ago  │ │
│       │ │  [B][I][`][~~][H1][H2][H3] │ [• ][1.]["][img][/][···] [↓ Exp]  │ │
│       │ │  ────────────────────────────────────────────────────────────── │ │
│       │ │  # My Understanding                                              │ │
│       │ │  The Abstract Factory is like a themed furniture store...        │ │
│       │ │  [image: aws-diagram.png  🔍+  🔍-  ↔ drag corners to resize]  │ │
│       │ │    ↑ scroll #2 (notes pane scrolls independently)                │ │
│       │ ├──────────────────────────────────────────────────────────────────┤ │
│       │ │ [← BUILDER]          PATTERN 02/23             [FACTORY →]      │ │
│       │ └──────────────────────────────────────────────────────────────────┘ │
└───────┴──────────────────────────────────────────────────────────────────────┘

  ╠════╣  = react-resizable-panels horizontal drag handle (drag up/down)
  [⊞] = Layout toggle back to horizontal mode
  Bottom dock ALWAYS stays pinned below the notes panel.
```

**Orientation toggle animation:** `PanelGroup direction` changes from `"horizontal"` → `"vertical"`. Framer Motion `layout` prop on the container creates a smooth morph. Split ratios saved separately via:
- `autoSaveId="notes-panel-h"` (horizontal)
- `autoSaveId="notes-panel-v"` (vertical)

---

### 3.3 "Saved ✓" Indicator — All States

```
Notes panel header — save state machine:

IDLE (no changes):
┌──────────────────────────────────────────────────────────┐
│ MY NOTES                                        [× close] │
│ ABSTRACT FACTORY                                          │
└──────────────────────────────────────────────────────────┘

UNSAVED (user is typing — amber dot appears):
┌──────────────────────────────────────────────────────────┐
│ MY NOTES                          ● Unsaved     [× close] │
│ ABSTRACT FACTORY                                          │
└──────────────────────────────────────────────────────────┘
  ● = 6px amber pulsing dot, same color as app accent

SAVING (2s debounce fires):
┌──────────────────────────────────────────────────────────┐
│ MY NOTES                          ⟳ Saving...  [× close] │
│ ABSTRACT FACTORY                                          │
└──────────────────────────────────────────────────────────┘

SAVED (write complete — shown for 4s then fades):
┌──────────────────────────────────────────────────────────┐
│ MY NOTES                          ✓ Saved 2s ago [× close]│
│ ABSTRACT FACTORY                                          │
└──────────────────────────────────────────────────────────┘
  ✓ = green text, fades out via CSS opacity transition after 4s

ERROR (write failed):
┌──────────────────────────────────────────────────────────┐
│ MY NOTES                          ✗ Save failed [× close] │
│ ABSTRACT FACTORY                  [Retry]                 │
└──────────────────────────────────────────────────────────┘
```

---

### 3.4 Image Block States

```
ON PASTE / DROP — Processing:
┌──────────────────────────────────────────────┐
│  [░░░░░░░░░░░░░░░░░░░░░░░]  Processing 47%   │
└──────────────────────────────────────────────┘

RENDERED (auto-sized to min(paneWidth-32px, naturalWidth)):
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │       [image rendered — no upscale]    │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│  aws-architecture.png  (1920×1080 → 480×270) │
│  [🔍+] [🔍-]   Width: 480px ↔  [🗑 remove]  │
│  ○─────────────────────────────────────────○ │
│  ↑ drag corner circles to resize manually    │
└──────────────────────────────────────────────┘

Storage strategy:
  Original blob  → IndexedDB key: note-img-<uuid>  (lossless)
  Display state  → block props: { idbKey, width, height, naturalW, naturalH }
  Zoom level     → block props: { zoom: 1.2 } (CSS transform: scale applied)
  On pane resize → CSS max-width: 100% reflows automatically
  On DB migration → images moved to object storage (S3/R2/Supabase Storage)
                    block props: { url: "https://..." } replaces idbKey
```

---

### 3.5 Mobile Layout — vaul Bottom Sheet

```
MOBILE (< 768px):
┌──────────────────────────────────────────┐
│ [←] GoF > Abstract Factory        [📝]  │ ← tap to open notes
├──────────────────────────────────────────┤
│ Abstract Factory.                        │
│ PRODUCTION CLOUD ARCHITECTURE            │
├──────────────────────────────────────────┤
│ [Overview][Code][Diagrams][Trade]        │
├──────────────────────────────────────────┤
│ THE INTENT: Provide an interface...      │
│ THE PROBLEM: A multi-cloud...            │
│    ↑ scroll #1 (full page scroll)        │
└──────────────────────────────────────────┘
         ↓ tap [📝]

┌──────────────────────────────────────────┐
│ ───── (drag handle — pull down to close) │
├──────────────────────────────────────────┤
│ MY NOTES · ABSTRACT FACTORY    Saved ✓   │
│ [B][I][`] [• ][1.][img]         [↓ Exp]  │
├──────────────────────────────────────────┤
│ # My Understanding                       │
│ The Abstract Factory is like a themed    │
│ furniture store — each vendor makes...   │
│ [image: aws.png] 🔍+  🔍-               │
│    ↑ scroll #2 (sheet internal scroll)   │
│                                          │
│ [All Notes →]                   [Done]   │
└──────────────────────────────────────────┘
  Sheet: 70% screen height.
  vaul: shouldScaleBackground={false} — NO backdrop dimming.
  Content behind is fully visible, just slightly scaled.
```

---

### 3.6 "My Notes" Global Workspace Page

```
┌───────┬────────────────────────────────────────────────────────────────────┐
│SIDEBAR│  MY NOTES WORKSPACE                                                 │
│       │ ┌──────────────────────────────────────────────────────────────┐   │
│My     │ │ MY NOTES WORKSPACE                    [↓ Export All (.json)] │   │
│Notes ★│ │ 8 of 23 patterns annotated            [↓ Export All (.md)]   │   │
│(active)│ ├──────────────────────────────────────────────────────────────┤   │
│       │ │ [🔍 Search notes...]       Filter:[All▾]   Sort:[Recent▾]    │   │
│       │ ├──────────────────────────────────────────────────────────────┤   │
│       │ │                                                               │   │
│       │ │ ┌──────────────────────┐   ┌──────────────────────┐         │   │
│       │ │ │ Creational           │   │ Structural           │         │   │
│       │ │ │ Abstract Factory   ✏ │   │ Adapter              │         │   │
│       │ │ │ ─────────────────    │   │ ─────────────────    │         │   │
│       │ │ │ "The Abstract Fact   │   │ (no notes yet)       │         │   │
│       │ │ │ ory is like a theme  │   │                      │         │   │
│       │ │ │ d furniture store..."│   │ + Start writing →    │         │   │
│       │ │ │ Modified: 2h ago     │   │                      │         │   │
│       │ │ │ [Edit ✏][↓ .md][🗑] │   │                      │         │   │
│       │ │ └──────────────────────┘   └──────────────────────┘         │   │
│       │ │                                                               │   │
│       │ │ ┌──────────────────────┐   ┌──────────────────────┐         │   │
│       │ │ │ Behavioral           │   │ Creational           │         │   │
│       │ │ │ Observer           ✏ │   │ Builder            ✏ │         │   │
│       │ │ │ ─────────────────    │   │ ─────────────────    │         │   │
│       │ │ │ "Observer = Event    │   │ "Step by step..."    │         │   │
│       │ │ │ bus without types"   │   │                      │         │   │
│       │ │ │ Modified: 1d ago     │   │ Modified: 3d ago     │         │   │
│       │ │ │ [Edit ✏][↓ .md][🗑] │   │ [Edit ✏][↓ .md][🗑] │         │   │
│       │ │ └──────────────────────┘   └──────────────────────┘         │   │
│       │ │    ↑ single page-level scroll (scroll #1 — only scroll here) │   │
│       │ └──────────────────────────────────────────────────────────────┘   │
└───────┴────────────────────────────────────────────────────────────────────┘

Individual note click → full single-note editor:
┌───────┬────────────────────────────────────────────────────────────────────┐
│SIDEBAR│  ← My Notes      ABSTRACT FACTORY                                   │
│       │ ┌──────────────────────────────────────────────────────────────┐   │
│       │ │ [Go to Pattern →]         [↓ Export .md] [↓ Export .json]   │   │
│       │ │                           [↑ Import .json]                   │   │
│       │ ├──────────────────────────────────────────────────────────────┤   │
│       │ │ [Full-width BlockNote editor]                                 │   │
│       │ │ # My Understanding                                            │   │
│       │ │ ...content...                                                 │   │
│       │ │ [image blocks with zoom/resize]                              │   │
│       │ │   ↑ single scroll (this view has 1 scroll only)              │   │
│       │ └──────────────────────────────────────────────────────────────┘   │
└───────┴────────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Complete Functional Requirements

### FR-1: Per-Pattern Notes
- Each of the 23 GoF patterns has its own isolated note document
- Accessible via the split panel on `PatternDetailPage`
- Keyed by `patternId` via `NoteRepository`
- Auto-saves 2s after last keystroke (debounced)
- Save state machine: `idle` → `unsaved●` → `saving⟳` → `saved✓` → `idle`
- Empty placeholder: *"What clicked for you about this pattern?"*

### FR-2: Rich Formatting
**Library:** BlockNote
- Inline: Bold, Italic, Inline Code, Strikethrough, Highlight
- Blocks: Paragraph, H1–H3, Bullet, Numbered list, Code block (syntax-highlighted), Quote/Callout
- Images: paste/drop with IndexedDB storage
- Slash commands (`/`), bubble toolbar on selection, fixed top toolbar strip

### FR-3: Dual-Orientation Split Panel
- **Horizontal (default):** Content left (65%), Notes right (35%)
- **Vertical (toggled):** Content top (60%), Notes bottom (40%)
- Toggle: `[⊟/⊞]` button or `Shift+N` keyboard shortcut
- Same `react-resizable-panels` `PanelGroup` — only `direction` prop changes
- Per-orientation ratios persisted: `autoSaveId="notes-panel-h"` and `"notes-panel-v"`
- Framer Motion `layout` on the container smoothly morphs between orientations

### FR-4: Notes Panel Toggle
- `[📝 N]` button in tabs bar: toggles notes visibility (collapses/expands)
- `N` key: toggle visibility (when not inside text input/editor)
- `Shift+N` key: toggle orientation (horizontal ↔ vertical)
- States persisted: `gof-notes-panel-open`, `gof-notes-panel-orientation`

### FR-5: Notes Badge Indicators
- Tabs bar `[📝]` button: amber 6px dot when current pattern has a note
- Pattern catalog cards: small `✏` icon in card corner when note exists
- Sidebar "My Notes" item: count badge showing number of annotated patterns (e.g. `8`)

### FR-6: Image Handling
- On paste or drag-drop:
  1. Show processing progress bar inline in editor
  2. Original blob stored in **IndexedDB** (key: `note-img-<uuid>`)
  3. Display dimensions: `min(paneWidth - 32px, naturalWidth)` — no upscaling
  4. Aspect ratio preserved automatically
- Manual resize: 8px grab circles on corners, drag to adjust
- Zoom: `[🔍+]` / `[🔍-]` buttons below image (10% increments via CSS `width`)
- Pinch-to-zoom on touch devices: native gesture
- Image zoom NOT persisted to DB — display-state only
- On pane resize: `max-width: 100%` — images reflow without overflow
- Size limits: > 5MB warning toast, > 10MB rejected with error message
- Alt text: optional input field per image block

### FR-7: Zoom / Pinch-to-Zoom
- Per-image zoom via buttons (desktop) or pinch gesture (touch)
- Notes panel as a whole does NOT zoom independently of the browser
- Browser native zoom (Ctrl+/-) applies to the full page as expected

### FR-8: Export Notes
- **Export All:** From "My Notes" page header
  - Format options: `.json` (full fidelity block tree) · `.md` (human-readable)
  - `.json` includes all images as base64-inlined (self-contained)
- **Export Individual:** From note card `[↓ .md]` button and notes panel footer
  - Same format options
- `.md` structure: H1 title, per-pattern H2 headings, Markdown-rendered content
- `.json` structure: `{ version: 1, exportedAt, notes: PatternNote[] }`

### FR-9: Import Notes
- Triggered from "My Notes" page `[↑ Import]` and note panel `[···]` menu
- Accepts `.json` matching export schema (Zod validated)
- Strategy: **Replace** (overwrite existing note for same patternId)
- Images in `.json`: base64 → written to IndexedDB on import, block props updated
- Validation errors shown inline (not toast)

### FR-10: Global "My Notes" Page
- New sidebar entry: **"My Notes"** (`FileText` icon) + annotated-count badge
- 2-column responsive card grid (1-col on mobile)
- Preview: first 150 chars of rendered note text
- Card actions: `[Edit ✏]` `[↓ Export .md]` `[🗑 Delete]`
- Single scroll on this page only

### FR-11: DB-Agnostic NoteRepository
- All note storage reads/writes go through a `NoteRepository` interface
- Components never call `localStorage` directly
- `NoteRepositoryContext` provides the active implementation via React Context
- Switching to any DB: swap the context provider — zero component changes

---

## Phase 5: Non-Functional Requirements

### NFR-1: Scroll Rule (Clarified)
> **No more than 2 nested scroll levels.** Sibling scrolls (left + right pane, or top + bottom pane) count as level 2 each — they share a parent, so there are only 2 levels total (parent → child). Three levels of nesting (grandparent → parent → child) is forbidden.

### NFR-2: No Dark Overlay (unchanged from v1)

### NFR-3: Performance
- BlockNote bundle lazy-loaded via `React.lazy()` + `Suspense` (skeleton shimmer while loading)
- Images: `createImageBitmap` for offscreen processing (main thread unblocked)
- Auto-save: 2s debounce + `requestIdleCallback` for the actual write
- Panel open/close animation: < 150ms

### NFR-4: Responsive Breakpoints

| Breakpoint | Behavior |
| :--- | :--- |
| < 768px (mobile) | No split panel. FAB + `vaul` bottom sheet (no dark overlay) |
| 768–1024px (tablet) | Horizontal split, notes collapsed by default. Min content: 55% |
| > 1024px (desktop) | Full dual-orientation split. Default 65/35 ratio |
| > 1440px (wide) | Notes panel can expand to max 45% width |

### NFR-5: Accessibility (WCAG 2.1 AA)
- Notes toggle: `aria-label="Toggle notes panel (N)"`, `aria-expanded`
- Orientation toggle: `aria-label="Switch layout (Shift+N)"`, `aria-pressed`
- Notes region: `role="complementary"` + `aria-label="Pattern notes"`
- Image blocks: optional `alt` text input field
- Resize handle: keyboard `ArrowLeft`/`ArrowRight` (react-resizable-panels built-in)
- Toolbar buttons: all `aria-label` and `title` attributes

### NFR-6: Data Integrity
- Note JSON (without images) stored in localStorage — stays well under quota
- Images (blobs) stored in IndexedDB — avoids localStorage size limits
- Export `.json` is self-contained (images base64-inlined)
- Existing `Backup & Settings` export still works (notes migrate to new `notes` key)

---

## Phase 6: Technology Contracts

### 6.1 Library: BlockNote
```bash
pnpm --filter @workspace/pattern-masterclass add @blocknote/react @blocknote/core @blocknote/mantine
```
Verify React 19 compat: https://www.blocknotejs.org/docs/

### 6.2 Existing Dependencies Used

| Need | Package | API |
| :--- | :--- | :--- |
| Dual-orientation split | `react-resizable-panels ^2.1.7` | `PanelGroup direction autoSaveId` |
| Mobile sheet | `vaul ^1.1.2` | `Drawer.Root shouldScaleBackground={false}` |
| Animation | `framer-motion ^12.23.24` | `layout`, `AnimatePresence` |
| Validation | `zod ^3.25.76` | Note schema + import validation |
| Icons | `lucide-react ^0.545.0` | PenLine, PanelRight, PanelBottom, FileDown, FileUp, FileText, ZoomIn, ZoomOut |

### 6.3 NoteRepository Interface + Zod Schema

```typescript
// src/lib/notes/NoteRepository.ts
export interface NoteRepository {
  get(patternId: string): Promise<PatternNote | null>;
  upsert(note: PatternNote): Promise<void>;
  getAll(): Promise<PatternNote[]>;
  delete(patternId: string): Promise<void>;
}

// src/lib/notes/notes-schema.ts
import { z } from 'zod';

export const NoteBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.unknown()),
  content: z.array(z.unknown()),
  children: z.array(z.unknown()),
});

export const PatternNoteSchema = z.object({
  patternId: z.string(),
  blocks: z.array(NoteBlockSchema),
  lastModified: z.string().datetime(),
  version: z.literal(1),
});

export type PatternNote = z.infer<typeof PatternNoteSchema>;
```

### 6.4 Future PostgreSQL Schema (Drizzle ORM)

```typescript
// lib/db/schema.ts (to be added when DB integration ships)
export const patternNotes = pgTable('pattern_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  patternId: varchar('pattern_id', { length: 100 }).notNull(),
  blocks: jsonb('blocks').notNull(),          // BlockNote block tree
  lastModified: timestamp('last_modified').defaultNow(),
  version: integer('version').default(1),
}, (t) => ({
  uniqueUserPattern: uniqueIndex().on(t.userId, t.patternId),
}));
```

### 6.5 Future OpenAPI Contract

```yaml
# lib/api-spec/openapi.yaml (add when DB ships)
/patterns/{patternId}/notes:
  get:
    operationId: getPatternNote
    tags: [notes]
  put:
    operationId: upsertPatternNote
    tags: [notes]
/notes/export:
  get:
    operationId: exportAllNotes
    tags: [notes]
```

---

## Phase 7: UI/UX Design Tokens

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| Notes pane bg | `hsl(0,0%,96%)` | `hsl(224,40%,6%)` | Slightly darker than content |
| Notes border | `1px solid var(--border)` | same | Separator |
| Resize handle rest | `1px var(--border)` | same | Subtle |
| Resize handle hover | `3px solid var(--accent)` | same | Amber brand |
| Save `✓` color | `hsl(142,70%,45%)` | `hsl(142,60%,55%)` | Green fade |
| Unsaved dot | `var(--accent)` amber | same | 6px pulse |
| Image resize handles | `var(--accent)` 8px | same | Corner circles |
| Toolbar bg | `var(--card)` | same | Card surface |

### Micro-Interaction Specs

| Interaction | Spec |
| :--- | :--- |
| Panel open/close | Spring `{ stiffness: 280, damping: 28 }` |
| Orientation switch | `layout` prop, spring `{ stiffness: 200, damping: 25 }` |
| Save indicator | Fade in 150ms → hold 4s → fade out 300ms |
| Image drop | Scale 0.95→1.0 + amber glow border on drop zone |
| Image resize handle | Appears on image hover, 8px amber circles at 4 corners |
| Badge count change | `AnimatePresence` number flip |
| Note badge (catalog) | 1.5s amber pulse on first note creation for that pattern |

---

## Phase 8: DB Decision — PostgreSQL vs NoSQL

### Recommendation: PostgreSQL + JSONB

**Why PostgreSQL wins:**
1. **Already in the stack** — `lib/db` uses Drizzle ORM + PostgreSQL
2. **Relational integrity** — `pattern_notes` FKs to future `users` / `workspaces` tables
3. **JSONB is sufficient** — BlockNote blocks < 50KB per note; GIN indexing handles queries
4. **Single DB to manage** — no second database engine

**Why MongoDB is NOT chosen:**
- Second database engine = double operational overhead
- Drizzle ORM has no MongoDB support (would need Mongoose or Prisma)
- Block tree is not polymorphic enough to justify a document DB

### Free Hosting Platforms

| Platform | Engine | Free Limit | Verdict |
| :--- | :--- | :--- | :--- |
| **Neon** | PostgreSQL | 0.5 GB | ⭐ Top pick. No CC, Drizzle-native, DB branching |
| **Supabase** | PostgreSQL + Auth + Storage | 500 MB | ⭐ Top pick if Auth + image storage wanted together |
| **CockroachDB Serverless** | PostgreSQL-compat | 10 GB | Generous. No CC. Good for scale-out. |
| **Aiven** | PostgreSQL | 30-day trial | Needs CC. Not permanently free. |
| **Fly.io Postgres** | PostgreSQL | ~3 GB | Needs CC. Self-managed (not fully managed). |
| **ElephantSQL** | PostgreSQL | 20 MB | Too small. Being sunset. |
| **Turso** | SQLite / libSQL | 5 GB | NOT PostgreSQL. Edge DB. Different Drizzle adapter. |
| **Cloudflare R2** | Object storage | 10 GB | For image storage only (S3-compatible, no egress fee) |
| **Backblaze B2** | Object storage | 10 GB | For image storage only |

**Image storage recommendation:** Use **Supabase Storage** (free 1GB) or **Cloudflare R2** (10GB free) for image blobs when DB integration ships. Images are never stored in PostgreSQL directly.

---

## Phase 9: Component Architecture

### New Files

```
artifacts/pattern-masterclass/src/
├── lib/
│   └── notes/
│       ├── NoteRepository.ts              ← interface
│       ├── LocalStorageNoteRepository.ts  ← localStorage implementation
│       ├── ApiNoteRepository.ts           ← stub for future HTTP/DB
│       ├── NoteRepositoryContext.tsx      ← React context + provider
│       └── notes-schema.ts               ← Zod schemas
├── components/
│   └── notes/
│       ├── PatternNotesPanel.tsx          ← Dual-orientation PanelGroup wrapper
│       ├── NotesEditor.tsx                ← BlockNote editor + toolbar + save indicator
│       ├── NotesBadge.tsx                 ← Amber dot badge
│       ├── NotesOrientationToggle.tsx     ← Horizontal ↔ vertical toggle button
│       └── ImageBlock.tsx                 ← Custom BlockNote image node (zoom + resize)
├── pages/
│   ├── NotesWorkspacePage.tsx             ← "My Notes" grid page
│   └── NoteDetailPage.tsx                 ← Full single-note editor
└── hooks/
    ├── usePatternNotes.ts                 ← Load/save via NoteRepository
    └── useNotesExport.ts                  ← MD + JSON export/import logic
```

### Modified Files

```
artifacts/pattern-masterclass/src/
├── App.tsx                          ← Add "My Notes" nav + NoteRepositoryContext.Provider
├── pages/PatternDetailPage.tsx      ← Wrap workspace area in dual-orientation PanelGroup
└── index.css                        ← Notes panel CSS vars + image resize handle styles
```

---

## Phase 10: Out of Scope (Confirmed)

| Anti-Goal | Status |
| :--- | :--- |
| AI-powered note suggestions | Out of scope |
| Multiplayer / collaboration | Out of scope |
| Canvas / freehand drawing | Out of scope |
| Note sharing / export to Notion | Out of scope |
| SRS / Leitner box integration | Out of scope |
| Note search across patterns | Phase 2 (post-initial ship) |
| Image annotation / markup | Phase 2 |

---

*PRD v2 complete. All Gate 1 clarifications incorporated.*  
*Awaiting final Gate 1 sign-off before Phase 3 (Architecture Decision Record) and Phase 5 (Implementation) begin.*
