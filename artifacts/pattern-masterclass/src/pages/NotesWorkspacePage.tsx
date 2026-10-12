import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  Search,
  Download,
  Upload,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Trash2,
  CheckCircle2,
  PenTool,
  FolderOpen,
} from "lucide-react";
import { PATTERNS } from "../data";
import { useNoteRepository } from "../lib/notes/NoteRepositoryContext";
import type { PatternNote } from "../lib/notes/notes-schema";
import { AppTooltip } from "../components/ui/app-tooltip";

export function NotesWorkspacePage() {
  const [, setLoc] = useLocation();
  const repository = useNoteRepository();

  const [notesMap, setNotesMap] = useState<Record<string, PatternNote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "annotated" | "unannotated">("all");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all notes from repository
  const loadNotes = () => {
    setIsLoading(true);
    repository
      .getAll()
      .then((notes) => {
        const map: Record<string, PatternNote> = {};
        for (const n of notes) {
          map[n.patternId] = n;
        }
        setNotesMap(map);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load all notes:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, [repository]);

  // Extract plain text snippet from BlockNote blocks
  const extractSnippet = (blocks: any[]): string => {
    if (!blocks || blocks.length === 0) return "";
    for (const b of blocks) {
      if (Array.isArray(b.content) && b.content.length > 0) {
        const text = b.content.map((c: any) => c?.text || "").join("").trim();
        if (text) return text;
      }
    }
    return "Notes recorded (diagrams/blocks)";
  };

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    return PATTERNS.filter((p) => {
      // Category filter
      if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      const hasNote = Boolean(notesMap[p.id]);
      if (statusFilter === "annotated" && !hasNote) return false;
      if (statusFilter === "unannotated" && hasNote) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const note = notesMap[p.id];
        const snippet = note ? extractSnippet(note.blocks).toLowerCase() : "";
        const matchesSnippet = snippet.includes(query);

        return matchesName || matchesCat || matchesSnippet;
      }

      return true;
    });
  }, [notesMap, categoryFilter, statusFilter, searchQuery]);

  const totalAnnotated = Object.keys(notesMap).length;

  // Export all notes as self-contained JSON
  const handleExportJson = async () => {
    try {
      const payload = await repository.exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gof-pattern-notes-bundle-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export JSON failed:", err);
    }
  };

  // Export all notes as Master Markdown
  const handleExportAllMarkdown = async () => {
    try {
      const notes = await repository.getAll();
      let md = `# GoF Design Patterns Masterclass — Study Notes Bundle\n\n`;
      md += `*Exported on:* ${new Date().toLocaleString()}\n`;
      md += `*Annotated Patterns:* ${notes.length} of ${PATTERNS.length}\n\n`;
      md += `---\n\n`;

      for (const p of PATTERNS) {
        const n = notesMap[p.id];
        if (!n) continue;

        md += `## ${p.name} (${p.category})\n\n`;
        md += `**Last Modified:** ${new Date(n.lastModified).toLocaleString()}\n\n`;

        for (const b of n.blocks) {
          if (b.type === "heading") {
            const level = ((b.props as any)?.level as number) || 3;
            const prefix = "#".repeat(level);
            const text = Array.isArray(b.content)
              ? b.content.map((c: any) => (c as any)?.text || "").join("")
              : "";
            md += `${prefix} ${text}\n\n`;
          } else if (b.type === "paragraph") {
            const text = Array.isArray(b.content)
              ? b.content.map((c: any) => (c as any)?.text || "").join("")
              : "";
            md += `${text}\n\n`;
          } else if (b.type === "bulletListItem") {
            const text = Array.isArray(b.content)
              ? b.content.map((c: any) => (c as any)?.text || "").join("")
              : "";
            md += `- ${text}\n`;
          } else if (b.type === "codeBlock") {
            const text = Array.isArray(b.content)
              ? b.content.map((c: any) => (c as any)?.text || "").join("")
              : "";
            md += `\`\`\`\n${text}\n\`\`\`\n\n`;
          }
        }
        md += `\n---\n\n`;
      }

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gof-all-notes-${new Date().toISOString().split("T")[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Markdown failed:", err);
    }
  };

  // Import JSON bundle
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await repository.importBundle(json);
      setImportStatus(`Successfully imported ${result.importedCount} notes!`);
      loadNotes();
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      console.error("Import failed:", err);
      setImportStatus("Import failed: Invalid bundle file");
      setTimeout(() => setImportStatus(null), 4000);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete note
  const handleDeleteNote = async (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete notes for this pattern?")) return;
    await repository.delete(patternId);
    loadNotes();
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-background text-foreground select-text">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLoc("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Masterclass</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h1 className="text-lg font-bold tracking-tight">Study Notes Workspace</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {totalAnnotated} / {PATTERNS.length} Annotated
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized knowledge repository across all 23 GoF design patterns
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON Bundle</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Markdown</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Bundle</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="max-w-7xl mx-auto mt-3 p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-3.5 rounded-xl border border-border/60">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes and patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border/80 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-background">
              {["all", "creational", "structural", "behavioral"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-amber-500/20 text-amber-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-background">
              {(["all", "annotated", "unannotated"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pattern Notes Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-border/60 bg-card/40 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPatterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No matching pattern notes found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Try adjusting your search terms or category filters to view other patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatterns.map((pattern) => {
              const note = notesMap[pattern.id];
              const snippet = note ? extractSnippet(note.blocks) : "";
              const formattedDate = note
                ? new Date(note.lastModified).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={pattern.id}
                  onClick={() => setLoc(`/pattern/${pattern.id}?notes=open`)}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    note
                      ? "bg-card/70 border-amber-500/30 hover:border-amber-500/60 shadow-sm"
                      : "bg-card/30 border-border/50 hover:border-border hover:bg-card/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                          {pattern.category}
                        </span>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors">
                          {pattern.name}
                        </h3>
                      </div>

                      {note ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <PenTool className="w-2.5 h-2.5" />
                          <span>Notes</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50">
                          Empty
                        </span>
                      )}
                    </div>

                    {/* Card Snippet / Placeholder */}
                    <div className="mt-3">
                      {note ? (
                        <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed font-sans">
                          {snippet}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic">
                          No notes written yet. Click to start jotting down understanding...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    {formattedDate ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground/60" />
                        <span>{formattedDate}</span>
                      </span>
                    ) : (
                      <span>Pattern #{pattern.id}</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {note && (
                        <AppTooltip content="Delete note">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNote(pattern.id, e)}
                            className="p-1 rounded text-muted-foreground hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </AppTooltip>
                      )}

                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-400 group-hover:underline">
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
