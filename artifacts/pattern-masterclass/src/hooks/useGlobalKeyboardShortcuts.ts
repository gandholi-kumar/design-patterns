import { useEffect } from 'react';
import type { Pattern } from '../types';

interface KeyboardShortcutOptions {
  isPatternPage: boolean;
  activePattern: Pattern | null;
  studioMode: boolean;
  toggleSidebar: () => void;
  setStudioMode: (val: boolean) => void;
  toggleBookmark: (patternId: string) => void;
  setLoc: (path: string) => void;
}

/**
 * Global keyboard shortcuts:
 * - Ctrl/Cmd + B: Toggle sidebar collapse
 * - Alt + F: Toggle Studio focus mode
 * - P (when on pattern page): Open interactive playground
 * - B (when on pattern page): Toggle bookmark for current pattern
 */
export function useGlobalKeyboardShortcuts({
  isPatternPage,
  activePattern,
  studioMode,
  toggleSidebar,
  setStudioMode,
  toggleBookmark,
  setLoc,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setStudioMode(!studioMode);
      }
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if ((e.key === 'p' || e.key === 'P') && isPatternPage && activePattern) {
          e.preventDefault();
          setLoc(`/playground?pattern=${activePattern.id}`);
        }
        if ((e.key === 'b' || e.key === 'B') && isPatternPage && activePattern) {
          e.preventDefault();
          toggleBookmark(activePattern.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPatternPage, activePattern, studioMode, toggleSidebar, setStudioMode, toggleBookmark, setLoc]);
}
