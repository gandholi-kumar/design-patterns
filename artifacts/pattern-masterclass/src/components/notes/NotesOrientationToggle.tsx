import { useEffect } from "react";
import { Columns2, Rows2 } from "lucide-react";
import { AppTooltip } from "../ui/app-tooltip";

interface NotesOrientationToggleProps {
  direction: "horizontal" | "vertical";
  onToggle: () => void;
  className?: string;
}

export function NotesOrientationToggle({
  direction,
  onToggle,
  className = "",
}: NotesOrientationToggleProps) {
  // Listen for global Shift+N shortcut to toggle orientation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable editor
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);

  const isHorizontal = direction === "horizontal";
  const tooltipText = isHorizontal
    ? "Switch to Bottom Shelf layout (Shift+N)"
    : "Switch to Side-by-Side layout (Shift+N)";

  return (
    <AppTooltip content={tooltipText}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={tooltipText}
        aria-pressed={!isHorizontal}
        data-testid="notes-orientation-toggle"
        className={`inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${className}`}
      >
        {isHorizontal ? (
          <Rows2 className="w-3.5 h-3.5" />
        ) : (
          <Columns2 className="w-3.5 h-3.5" />
        )}
      </button>
    </AppTooltip>
  );
}
