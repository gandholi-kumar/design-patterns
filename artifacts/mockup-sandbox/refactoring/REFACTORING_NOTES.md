# Refactoring Notes: `@workspace/mockup-sandbox`

**Project Type**: Vite + React Prototyping Sandbox  
**Location**: `artifacts/mockup-sandbox`  
**Primary Files**: [src/App.tsx](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/mockup-sandbox/src/App.tsx), [mockupPreviewPlugin.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/artifacts/mockup-sandbox/mockupPreviewPlugin.ts)

---

## 1. Architectural Diagnosis

### Current Strengths
1. **Automated Component Discovery**: Uses a custom Vite plugin (`mockupPreviewPlugin.ts`) to scan `./components/mockups/**/*.tsx` and generate dynamic import map definitions into `./.generated/mockup-components.ts`.
2. **Defensive Component Resolution**: Supports multiple export conventions (`default`, `Preview`, named component function, or last exported function).

### Key Gaps
1. **Missing React Error Boundary Around Rendered Mockups**: If a mock component throws a runtime error during render or in a hook, the entire sandbox UI crashes into a blank screen.
2. **Missing Viewport Resizing & Device Emulation**: The sandbox renders full-width only. Real component prototyping requires previewing mobile (375px), tablet (768px), and desktop (1280px) viewports.
3. **No Dark/Light Theme Switching**: Prototyped components cannot easily be verified against both color schemes.

---

## 2. Refactoring Actions

### Action 1: Wrap Preview In a React Error Boundary
Add an Error Boundary component around the dynamic renderer in `src/App.tsx`:

```tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackKey: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MockupErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Mockup render error:", error, info);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.fallbackKey !== this.props.fallbackKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-900 border border-red-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Component Crashed</h3>
          <pre className="text-sm overflow-x-auto">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### Action 2: Add Viewport Emulation Controls
Provide quick sizing toggles above the preview frame:

```tsx
const VIEWPORTS = {
  mobile: { name: "Mobile", width: "375px" },
  tablet: { name: "Tablet", width: "768px" },
  desktop: { name: "Desktop", width: "100%" },
};

function SandboxFrame({ children, viewport }) {
  return (
    <div className="flex justify-center bg-muted/20 min-h-screen p-4">
      <div 
        style={{ width: VIEWPORTS[viewport].width }} 
        className="transition-all duration-300 bg-background shadow-lg rounded-md overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
```
