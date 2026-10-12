import { useEffect, useCallback } from "react";
import { X, ExternalLink, Download, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { usePatternNotes } from "../../hooks/usePatternNotes";
import { NotesSaveIndicator } from "./NotesSaveIndicator";
import { NotesOrientationToggle } from "./NotesOrientationToggle";
import { NotesEditor } from "./NotesEditor";
import { NotesErrorBoundary } from "./NotesErrorBoundary";
import { AppTooltip } from "../ui/app-tooltip";

interface PatternNotesPanelProps {
  patternId: string;
  patternName: string;
  category: string;
  direction: "horizontal" | "vertical";
  theme?: "light" | "dark";
  onToggleOrientation: () => void;
  onClose: () => void;
}

export function PatternNotesPanel({
  patternId,
  patternName,
  category,
  direction,
  theme = "dark",
  onToggleOrientation,
  onClose,
}: PatternNotesPanelProps) {
  const [, setLoc] = useLocation();

  const {
    blocks,
    isLoading,
    saveStatus,
    lastSavedAt,
    errorMessage,
    handleBlocksChange,
    uploadMedia,
    retrySave,
    saveImmediately,
  } = usePatternNotes(patternId);

  // Keyboard shortcut Ctrl+S / Cmd+S to save immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveImmediately();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveImmediately]);

  // Download single note as Markdown
  const handleExportMarkdown = useCallback(() => {
    // Generate simple markdown representation
    let md = `# ${patternName} — Study Notes\n\n`;
    md += `*Pattern:* ${patternName} (${category})\n`;
    md += `*Exported:* ${new Date().toLocaleString()}\n\n---\n\n`;

    for (const b of blocks) {
      if (b.type === "heading") {
        const level = (b.props?.level as number) || 2;
        const prefix = "#".repeat(level);
        const text = Array.isArray(b.content)
          ? b.content.map((c: any) => c?.text || "").join("")
          : "";
        md += `${prefix} ${text}\n\n`;
      } else if (b.type === "paragraph") {
        const text = Array.isArray(b.content)
          ? b.content.map((c: any) => c?.text || "").join("")
          : "";
        md += `${text}\n\n`;
      } else if (b.type === "bulletListItem") {
        const text = Array.isArray(b.content)
          ? b.content.map((c: any) => c?.text || "").join("")
          : "";
        md += `- ${text}\n`;
      } else if (b.type === "numberedListItem") {
        const text = Array.isArray(b.content)
          ? b.content.map((c: any) => c?.text || "").join("")
          : "";
        md += `1. ${text}\n`;
      } else if (b.type === "codeBlock") {
        const text = Array.isArray(b.content)
          ? b.content.map((c: any) => c?.text || "").join("")
          : "";
        md += `\`\`\`\n${text}\n\`\`\`\n\n`;
      }
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patternId}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [patternId, patternName, category, blocks]);

  return (
    <aside
      className={`flex flex-col h-full w-full bg-card/95 backdrop-blur-md select-text ${
        direction === "horizontal" ? "border-l border-border/80" : "border-t border-border/80"
      }`}
      role="complementary"
      aria-label={`Study notes for ${patternName}`}
      data-testid="pattern-notes-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60 bg-muted/20 flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90">
              My Notes
            </span>
            <span className="text-muted-foreground/40 text-[10px]">•</span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {category}
            </span>
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground truncate max-w-[200px]">
            {patternName}
          </h2>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5">
          <NotesSaveIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            onRetry={retrySave}
          />

          <div className="h-3.5 w-px bg-border/60 mx-1" />

          {/* Orientation Toggle */}
          <NotesOrientationToggle
            direction={direction}
            onToggle={onToggleOrientation}
          />

          {/* Export Note MD */}
          <AppTooltip content="Export note as Markdown (.md)">
            <button
              type="button"
              onClick={handleExportMarkdown}
              aria-label="Export Markdown"
              className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </AppTooltip>

          {/* Navigate to All Notes */}
          <AppTooltip content="View all notes in workspace">
            <button
              type="button"
              onClick={() => setLoc("/notes")}
              aria-label="Open Notes Workspace"
              className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </AppTooltip>

          {/* Close Panel Button */}
          <AppTooltip content="Close notes panel (N)">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notes panel"
              className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </AppTooltip>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-background/50 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
            Loading note content...
          </div>
        ) : errorMessage ? (
          <div className="p-4 text-xs text-rose-400">
            <p className="font-medium">Error loading notes:</p>
            <p className="text-muted-foreground mt-1">{errorMessage}</p>
            <button
              type="button"
              onClick={retrySave}
              className="mt-3 px-2 py-1 rounded bg-rose-900/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60"
            >
              Try Reloading
            </button>
          </div>
        ) : (
          <NotesErrorBoundary resetKey={blocks} onReset={retrySave}>
            <NotesEditor
              initialBlocks={blocks}
              patternName={patternName}
              theme={theme}
              onBlocksChange={handleBlocksChange}
              onUploadMedia={uploadMedia}
            />
          </NotesErrorBoundary>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-muted/10 text-[10px] text-muted-foreground/70 flex-shrink-0">
        <span>💡 Type &apos;/&apos; for formatting menu</span>
        <span>Shift+N layout toggle</span>
      </div>
    </aside>
  );
}
