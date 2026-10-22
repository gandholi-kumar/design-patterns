---
name: radix-ui-modernization
description: >-
  Best practices, traps, and step-by-step procedures for modernizing native HTML elements
  (select, combobox, dropdowns, checkboxes) to accessible Radix UI primitives in React 19,
  and styling accessible inverted surfaces and shortcut badges across light and dark modes.
---

# Radix UI Modernization & Inverted Surface Guidelines

This skill provides step-by-step procedures for replacing native HTML form controls with accessible Radix UI primitives in React 19 and ensuring WCAG AAA contrast across dark and light themes.

---

## 1. Modernizing Native Form Controls to Radix UI

### A. Replacing Native `<select>` with Radix UI `Select`

1. **Primitive Hierarchy & Component Mapping:**
   - `<select value={val} onChange={...}>` -> `<Select value={val} onValueChange={...}>`
   - Custom trigger button -> `<SelectTrigger className="...">` + `<SelectValue placeholder="..." />`
   - Dropdown options container -> `<SelectContent position="popper" sideOffset={4}>`
   - `<optgroup label="...">` -> `<SelectGroup><SelectLabel>...</SelectLabel>`
   - `<option value="...">` -> `<SelectItem value="...">`

2. **Crucial Gotchas & React 19 Traps:**
   - **Never pass empty string values (`value=""`):**
     Radix UI `Select` treats `""` as invalid or uncontrolled, throwing runtime warnings and dropping selection synchronization. Always map empty/unselected states to an explicit sentinel (e.g., `value="all"`) or provide non-empty default fallback values (`pA || 'factory-method'`).
   - **Avoid Viewport Height Locking:**
     Default Shadcn/Radix snippets often include `h-[var(--radix-select-trigger-height)]` on `SelectPrimitive.Viewport`. In flex/grid or scrollable containers, this locks the dropdown menu viewport height to the trigger's height (e.g. 36px), preventing items from rendering or being clickable. Ensure `SelectPrimitive.Viewport` uses `max-h-[min(var(--radix-select-content-available-height,320px),24rem)]` with `overflow-y-auto`.
   - **Portal Stacking & Overflow Containment:**
     Always wrap `SelectPrimitive.Content` in `SelectPrimitive.Portal` with `z-50` to prevent clipping inside modals, drawers, or overflowing parent containers.

### B. Custom Dropdowns and Dialogs
- Convert native `<details>`/`<summary>` or ad-hoc custom dropdowns to Radix `DropdownMenu` (`DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`).
- Convert native checkboxes (`<input type="checkbox">`) to Radix `Checkbox` with accessible IDs and `<label htmlFor="...">`.

---

## 2. Inverted Surfaces & Tooltip Shortcut Badges

### A. The Inverted Surface Polarity Problem
When UI elements invert background/foreground (such as tooltips with `bg-primary text-primary-foreground` where Light Mode uses a dark surface and Dark Mode uses a high-luminance amber/gold surface):
1. **Never allow global tag selectors (`kbd`, `code`, `input`) to dictate colors on inverted surfaces.**
2. A global rule such as `kbd { color: hsl(var(--foreground)); }` will render dark charcoal text on dark surfaces in Light Mode (completely invisible), and faint cream text on gold surfaces in Dark Mode (unreadable).

### B. The Adaptive Inverted Keycap Formula
Style shortcut badges on inverted surfaces to adapt dynamically to the container's foreground:

```css
.app-tooltip-kbd,
.app-tooltip-content kbd,
[role="tooltip"] kbd,
[data-slot="tooltip-content"] kbd {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--app-font-mono) !important;
  font-size: 0.625rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  letter-spacing: 0.025em !important;
  padding: 0.125rem 0.375rem !important;
  border-radius: 0.25rem !important;
  color: hsl(var(--primary-foreground)) !important;
  background-color: hsl(var(--primary-foreground) / 0.16) !important;
  border: 0.0625rem solid hsl(var(--primary-foreground) / 0.3) !important;
  box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.12) !important;
  opacity: 1 !important;
}
```

- **Light Mode** (dark tooltip): Bright crisp off-white text (`#f8fafc`) on a 16% translucent white pill with subtle border.
- **Dark Mode** (amber/gold tooltip): Crisp dark navy text (`#212836`) on a 16% translucent dark navy pill.
- Both achieve WCAG AAA contrast ratio automatically.

### C. Tooltip Label Deduplication Hygiene
If an `AppTooltip` component provides a `shortcut` prop, ensure the `content` label does NOT redundantly hardcode the shortcut string:
- **Correct:** `content="Collapse sidebar" shortcut="Ctrl+B"`
- **Incorrect:** `content="Collapse sidebar (Ctrl+B)" shortcut="Ctrl+B"`

---

## 3. Headless Browser Automated Verification Runbook

1. **Triggering Popovers & Tooltips Deterministically:**
   - In headless browser subagents (CDP), synthetic mouse movements may not always trigger pointer-hover events reliably.
   - Trigger Radix popovers, dropdowns, and tooltips reliably by executing `.focus()` on the target `data-testid` element.
2. **Dual-Theme Verification Checklist:**
   - Always verify and capture screenshots in **both Dark and Light modes** before completing the task.
   - Verify that all keyboard shortcut keycap text remains sharp and legible in both modes.
3. **Quality Gates:**
   - Run typecheck: `pnpm run typecheck`
   - Run unit test suite: `npm test`
