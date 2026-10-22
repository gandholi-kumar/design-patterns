import { FileText, Pencil } from "lucide-react";
import { AppTooltip } from "../ui/app-tooltip";

interface NotesBadgeProps {
  hasNotes: boolean;
  variant?: "dot" | "icon" | "count";
  count?: number;
  className?: string;
}

export function NotesBadge({
  hasNotes,
  variant = "dot",
  count,
  className = "",
}: NotesBadgeProps) {
  if (!hasNotes && (!count || count === 0)) return null;

  if (variant === "dot") {
    return (
      <AppTooltip content="You have study notes for this pattern">
        <span
          className={`inline-block w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)] ${className}`}
          aria-label="Notes available"
        />
      </AppTooltip>
    );
  }

  if (variant === "icon") {
    return (
      <AppTooltip content="Notes available">
        <span
          className={`inline-flex items-center justify-center p-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${className}`}
          aria-label="Notes available"
        >
          <Pencil className="w-3 h-3" />
        </span>
      </AppTooltip>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 ${className}`}
      aria-label={`${count} notes recorded`}
    >
      <FileText className="w-3 h-3" />
      <span>{count}</span>
    </span>
  );
}
