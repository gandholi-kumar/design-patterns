import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  FileJson,
  FileUp,
  Search,
  Upload,
  Download,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Calendar,
  ExternalLink,
  Trash2,
  PenTool,
  FolderOpen,
  CheckSquare,
  Square,
  Settings,
  ChevronDown,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";
import { PATTERNS } from "../data";
import { useNoteRepository } from "../lib/notes/NoteRepositoryContext";
import type { PatternNote, NotesExportPayload } from "../lib/notes/notes-schema";
import { AppTooltip } from "../components/ui/app-tooltip";
import { appToast } from "../components/ui/app-toaster";
import { DeleteConfirmDialog } from "../components/notes/DeleteConfirmDialog";
import {
  ImportConflictDialog,
  type ImportCollisionStrategy,
} from "../components/notes/ImportConflictDialog";
import {
  NotesTableView,
  type SortField,
  type SortDirection,
} from "../components/notes/NotesTableView";
import { NotesPaginationBar } from "../components/notes/NotesPaginationBar";

export function NotesWorkspacePage() {
  const [, setLoc] = useLocation();
  const repository = useNoteRepository();

  const [notesMap, setNotesMap] = useState<Record<string, PatternNote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "annotated" | "unannotated">("all");

  // View mode state: 'cards' or 'table' (persisted in localStorage)
  const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
    const saved = localStorage.getItem("gof-notes-view-mode");
    return saved === "cards" || saved === "table" ? saved : "table";
  });

  // Sorting state for table and cards
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination state (10, 20, 50, 100 per page)
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem("gof-notes-page-size");
    const num = Number(saved);
    return [10, 20, 50, 100].includes(num) ? num : 10;
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    localStorage.setItem("gof-notes-page-size", String(newSize));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleToggleViewMode = (mode: "cards" | "table") => {
    setViewMode(mode);
    localStorage.setItem("gof-notes-view-mode", mode);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Multi-selection state
  const [selectedPatternIds, setSelectedPatternIds] = useState<Set<string>>(new Set());

  // Dialog states
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    payload: NotesExportPayload;
    conflictingNames: string[];
  } | null>(null);

  // Import Collision Policy
  const [importPolicy, setImportPolicy] = useState<ImportCollisionStrategy | "ask">(() => {
    const saved = localStorage.getItem("gof-notes-import-policy");
    if (saved === "append" || saved === "overwrite" || saved === "skip") {
      return saved as ImportCollisionStrategy;
    }
    return "append"; // Default strategy is append
  });
  const [policyMenuOpen, setPolicyMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const policyMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (policyMenuRef.current && !policyMenuRef.current.contains(e.target as Node)) {
        setPolicyMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Sorted and filtered patterns based on active sortField and sortDirection
  const sortedAndFilteredPatterns = useMemo(() => {
    const list = [...filteredPatterns];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === "status") {
        const aHas = Boolean(notesMap[a.id]);
        const bHas = Boolean(notesMap[b.id]);
        comparison = aHas === bHas ? 0 : aHas ? -1 : 1;
      } else if (sortField === "modified") {
        const aTime = notesMap[a.id]?.lastModified
          ? new Date(notesMap[a.id].lastModified).getTime()
          : 0;
        const bTime = notesMap[b.id]?.lastModified
          ? new Date(notesMap[b.id].lastModified).getTime()
          : 0;
        comparison = bTime - aTime;
        return sortDirection === "asc" ? -comparison : comparison;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return list;
  }, [filteredPatterns, sortField, sortDirection, notesMap]);

  // Pagination calculations
  const totalItems = sortedAndFilteredPatterns.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPatterns = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedAndFilteredPatterns.slice(start, start + pageSize);
  }, [sortedAndFilteredPatterns, safeCurrentPage, pageSize]);

  const totalAnnotated = Object.keys(notesMap).length;

  // Check if all patterns on current page are selected
  const allCurrentPageSelected =
    paginatedPatterns.length > 0 &&
    paginatedPatterns.every((p) => selectedPatternIds.has(p.id));

  // Toggle selection for a single pattern
  const togglePatternSelect = (patternId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatternIds((prev) => {
      const next = new Set(prev);
      if (next.has(patternId)) {
        next.delete(patternId);
      } else {
        next.add(patternId);
      }
      return next;
    });
  };

  // Toggle select all visible patterns on current page
  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedPatternIds((prev) => {
        const next = new Set(prev);
        for (const p of paginatedPatterns) {
          next.delete(p.id);
        }
        return next;
      });
    } else {
      setSelectedPatternIds((prev) => {
        const next = new Set(prev);
        for (const p of paginatedPatterns) {
          next.add(p.id);
        }
        return next;
      });
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPatternIds(new Set());
  };

  // Export JSON Bundle (all or selective)
  const handleExportJson = async (targetPatternIds?: string[]) => {
    try {
      const ids = targetPatternIds ?? (selectedPatternIds.size > 0 ? Array.from(selectedPatternIds) : undefined);
      const payload = await repository.exportAll(ids);
      const count = payload.notes.length;

      if (count === 0) {
        appToast.warning("No notes to export", "Annotate at least one pattern note before exporting.");
        return;
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = ids && ids.length === 1
        ? `gof-${ids[0]}-note-${dateStr}.json`
        : `gof-pattern-notes-bundle-${ids ? `${count}-selected-` : "all-"}${dateStr}.json`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      appToast.success(
        `Exported ${count} ${count === 1 ? "pattern note" : "pattern notes"}`,
        `Self-contained JSON bundle with embedded diagrams & media assets.`
      );
    } catch (err) {
      console.error("Export JSON failed:", err);
      appToast.error("Export failed", "Could not assemble JSON notes bundle.");
    }
  };

  // Export Markdown Bundle (all or selective)
  const handleExportMarkdown = async (targetPatternIds?: string[]) => {
    try {
      const ids = targetPatternIds ?? (selectedPatternIds.size > 0 ? Array.from(selectedPatternIds) : undefined);
      const targetPatterns = ids
        ? PATTERNS.filter((p) => ids.includes(p.id) && Boolean(notesMap[p.id]))
        : PATTERNS.filter((p) => Boolean(notesMap[p.id]));

      if (targetPatterns.length === 0) {
        appToast.warning("No notes to export", "Annotate at least one pattern note before exporting Markdown.");
        return;
      }

      let md = `# GoF Design Patterns Masterclass — Study Notes Bundle\n\n`;
      md += `*Exported on:* ${new Date().toLocaleString()}\n`;
      md += `*Patterns Included:* ${targetPatterns.length} of ${PATTERNS.length}\n\n`;
      md += `---\n\n`;

      for (const p of targetPatterns) {
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
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = ids && ids.length === 1
        ? `gof-${ids[0]}-note-${dateStr}.md`
        : `gof-notes-${ids ? `${targetPatterns.length}-selected-` : "all-"}${dateStr}.md`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      appToast.success(
        `Exported Markdown document`,
        `Formatted Markdown file for ${targetPatterns.length} pattern notes.`
      );
    } catch (err) {
      console.error("Export Markdown failed:", err);
      appToast.error("Export failed", "Could not compile Markdown document.");
    }
  };

  // Inspect incoming file for collisions
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as NotesExportPayload;

      if (!payload.notes || !Array.isArray(payload.notes)) {
        throw new Error("Invalid bundle structure: missing notes array");
      }

      // Check which pattern notes conflict with existing ones
      const conflictingNames = payload.notes
        .filter((n) => Boolean(notesMap[n.patternId]))
        .map((n) => PATTERNS.find((p) => p.id === n.patternId)?.name || n.patternId);

      if (conflictingNames.length > 0 && importPolicy === "ask") {
        // Prompt user with custom theme-reactive modal
        setPendingImport({ payload, conflictingNames });
      } else {
        // Use current policy (default is "append")
        const strategy = importPolicy === "ask" ? "append" : importPolicy;
        await executeImport(payload, strategy);
      }
    } catch (err) {
      console.error("Import failed:", err);
      appToast.error(
        "Import failed",
        "The uploaded file is not a valid GoF Notes JSON bundle."
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute the import with given strategy
  const executeImport = async (
    payload: NotesExportPayload,
    strategy: ImportCollisionStrategy
  ) => {
    try {
      const result = await repository.importBundle(payload, strategy);
      loadNotes();

      const strategyLabel =
        strategy === "append"
          ? "appended and merged"
          : strategy === "overwrite"
          ? "overwritten"
          : "skipped existing";

      appToast.success(
        `Imported ${result.importedCount} notes successfully`,
        `Collision policy applied: ${strategyLabel}.`
      );
    } catch (err) {
      console.error("Import bundle failed:", err);
      appToast.error("Import error", "Failed to restore notes and media assets.");
    }
  };

  // Confirm collision dialog
  const handleConfirmCollision = async (
    strategy: ImportCollisionStrategy,
    rememberAsDefault: boolean
  ) => {
    if (!pendingImport) return;

    if (rememberAsDefault) {
      localStorage.setItem("gof-notes-import-policy", strategy);
      setImportPolicy(strategy);
      appToast.info(
        "Default policy saved",
        `Future imports will automatically use '${strategy}' strategy.`
      );
    }

    const payload = pendingImport.payload;
    setPendingImport(null);
    await executeImport(payload, strategy);
  };

  // Delete note with custom confirmation modal
  const handleRequestDelete = (patternId: string, patternName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id: patternId, name: patternName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    const id = deleteTarget.id;
    setDeleteTarget(null);

    await repository.delete(id);
    loadNotes();
    setSelectedPatternIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    appToast.info(
      `Deleted note for ${name}`,
      `Your notes and diagrams for this pattern were removed.`
    );
  };

  // Change default collision policy from header
  const handleSelectPolicy = (newPolicy: ImportCollisionStrategy | "ask") => {
    setImportPolicy(newPolicy);
    if (newPolicy === "ask") {
      localStorage.removeItem("gof-notes-import-policy");
    } else {
      localStorage.setItem("gof-notes-import-policy", newPolicy);
    }
    setPolicyMenuOpen(false);

    const desc =
      newPolicy === "append"
        ? "Appends new blocks below existing notes (Recommended default)"
        : newPolicy === "overwrite"
        ? "Overwrites existing notes with incoming version"
        : newPolicy === "skip"
        ? "Skips imported notes if an existing note exists"
        : "Always prompts for confirmation when collisions occur";

    appToast.info(`Import policy: ${newPolicy.toUpperCase()}`, desc);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground select-text">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md px-6 py-4 flex-shrink-0 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppTooltip content="Back to Masterclass">
              <button
                type="button"
                onClick={() => setLoc("/")}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-2xs shrink-0"
                aria-label="Back to Masterclass"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </AppTooltip>

            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h1 className="text-lg font-bold tracking-tight">Study Notes Workspace</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {totalAnnotated} / {PATTERNS.length} Annotated
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized knowledge repository across all 23 GoF design patterns
              </p>
            </div>
          </div>

          {/* Header Action Buttons (Icon-only with Tooltips) */}
          <div className="flex items-center gap-2">
            {/* Import Policy Selector Dropdown (Icon-only) */}
            <div className="relative" ref={policyMenuRef}>
              <AppTooltip content={`Collision policy: ${importPolicy === "ask" ? "Always Ask" : importPolicy.toUpperCase()}`}>
                <button
                  type="button"
                  onClick={() => setPolicyMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors shadow-2xs ${
                    policyMenuOpen
                      ? "bg-muted border-amber-500/60 text-amber-500"
                      : "border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Configure collision strategy for bundle imports"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </AppTooltip>

              {policyMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-1 text-slate-900 dark:text-slate-100">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    Import Collision Strategy
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPolicy("append")}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
                      importPolicy === "append"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        importPolicy === "append" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>Append (Merge)</span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-normal">
                          Default
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                        Preserves notes; appends imported blocks below a divider
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPolicy("overwrite")}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
                      importPolicy === "overwrite"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        importPolicy === "overwrite" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div>
                      <span>Overwrite (Replace)</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                        Replaces existing notes with incoming version
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPolicy("skip")}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
                      importPolicy === "skip"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        importPolicy === "skip" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div>
                      <span>Skip Existing</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                        Leaves current notes untouched; only imports new ones
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPolicy("ask")}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
                      importPolicy === "ask"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        importPolicy === "ask" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div>
                      <span>Always Ask on Conflict</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">
                        Show dialog to choose strategy for each import
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Export JSON Button (Micro-pill: Arrow Up) */}
            <AppTooltip content="Export notes bundle (JSON)">
              <button
                type="button"
                onClick={() => handleExportJson()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-amber-500/50 hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs group"
                aria-label="Export all annotated pattern notes as a portable JSON bundle"
              >
                <ArrowUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
                <span>JSON</span>
              </button>
            </AppTooltip>

            {/* Export Markdown Button (Micro-pill: Arrow Up) */}
            <AppTooltip content="Export all notes as Markdown (.md)">
              <button
                type="button"
                onClick={() => handleExportMarkdown()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-emerald-500/50 hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs group"
                aria-label="Export all annotated pattern notes as a single Markdown document"
              >
                <ArrowUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
                <span>MD</span>
              </button>
            </AppTooltip>

            {/* Import Bundle Button (Micro-pill: Arrow Down) */}
            <AppTooltip content="Import notes bundle (.json)">
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-300 cursor-pointer transition-all shadow-2xs group">
                <ArrowDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                <span>Import</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  data-testid="import-bundle-file-input"
                  aria-label="Import notes bundle"
                />
              </label>
            </AppTooltip>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-3.5 rounded-xl border border-border/60">
          {/* Search Box & Select All toggle */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={
                allCurrentPageSelected
                  ? "Deselect all patterns on this page"
                  : "Select all patterns on this page"
              }
            >
              {allCurrentPageSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>

            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes and patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border/80 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Filter Pills & View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-background">
              {["all", "creational", "structural", "behavioral"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md capitalize font-medium transition-colors ${
                    categoryFilter === cat
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
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

            {/* View Mode Toggle: Cards ▦ vs Table ☰ */}
            <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-background">
              <button
                type="button"
                onClick={() => handleToggleViewMode("cards")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === "cards"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                title="Cards grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                title="High-density table view"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          viewMode === "table" ? (
            <NotesTableView
              patterns={[]}
              notesMap={notesMap}
              selectedPatternIds={selectedPatternIds}
              onToggleSelect={() => {}}
              onSelectAllVisible={() => {}}
              onOpenNote={() => {}}
              onExportJson={() => {}}
              onRequestDelete={() => {}}
              extractSnippet={extractSnippet}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              isLoading={true}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl border border-border/60 bg-card/40 animate-pulse"
                />
              ))}
            </div>
          )
        ) : sortedAndFilteredPatterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No matching pattern notes found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Try adjusting your search terms or category filters to view other patterns.
            </p>
          </div>
        ) : viewMode === "table" ? (
          <div className="pb-20">
            <NotesTableView
              patterns={paginatedPatterns}
              notesMap={notesMap}
              selectedPatternIds={selectedPatternIds}
              onToggleSelect={togglePatternSelect}
              onSelectAllVisible={toggleSelectAll}
              onOpenNote={(id) => setLoc(`/pattern/${id}?notes=open`)}
              onExportJson={(ids) => handleExportJson(ids)}
              onRequestDelete={(id, name, e) => handleRequestDelete(id, name, e)}
              extractSnippet={extractSnippet}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              isLoading={false}
              totalItems={totalItems}
              currentPage={safeCurrentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPatterns.map((pattern) => {
                const note = notesMap[pattern.id];
                const isSelected = selectedPatternIds.has(pattern.id);
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
                      isSelected
                        ? "ring-2 ring-amber-500 bg-amber-500/5 border-amber-500/60 shadow-md"
                        : note
                        ? "bg-card/70 border-amber-500/30 hover:border-amber-500/60 shadow-sm"
                        : "bg-card/30 border-border/50 hover:border-border hover:bg-card/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div>
                      {/* Card Header with Checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => togglePatternSelect(pattern.id, e)}
                            className="mt-0.5 text-muted-foreground hover:text-amber-500 transition-colors"
                            title={isSelected ? "Deselect pattern" : "Select pattern for selective export"}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                              {pattern.category}
                            </span>
                            <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                              {pattern.name}
                            </h3>
                          </div>
                        </div>

                        {note ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
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

                      <div className="flex items-center gap-2">
                        {/* Individual pattern quick export */}
                        {note && (
                          <AppTooltip content="Export this pattern's notes (JSON)">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportJson([pattern.id]);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-amber-500 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </AppTooltip>
                        )}

                        {/* Delete note trigger */}
                        {note && (
                          <AppTooltip content="Delete note">
                            <button
                              type="button"
                              onClick={(e) => handleRequestDelete(pattern.id, pattern.name, e)}
                              className="p-1 rounded text-muted-foreground hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </AppTooltip>
                        )}

                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cards View Pagination Bar */}
            {totalItems > 0 && (
              <div className="rounded-xl border border-border/80 overflow-hidden bg-card/60 backdrop-blur-md shadow-sm">
                <NotesPaginationBar
                  totalItems={totalItems}
                  currentPage={safeCurrentPage}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Selective Export Action Bar (100% Solid Opaque background) */}
      {selectedPatternIds.size > 0 && (
        <aside
          aria-label="Selective Notes Actions"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3.5 px-5 py-3 rounded-full bg-slate-950 dark:bg-slate-950 border-2 border-amber-500 shadow-2xl text-white text-xs animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 font-semibold border border-amber-500/40">
            {selectedPatternIds.size} Selected
          </span>

          <div className="h-4 w-px bg-white/30" />

          <button
            type="button"
            onClick={() => handleExportJson()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors shadow-sm"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Export JSON ({selectedPatternIds.size})</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportMarkdown()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow-sm"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Export Markdown ({selectedPatternIds.size})</span>
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="px-2.5 py-1 text-slate-300 hover:text-white transition-colors"
          >
            Clear
          </button>
        </aside>
      )}

      {/* Custom Themed Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          isOpen={true}
          patternName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Custom Themed Import Collision Dialog */}
      {pendingImport && (
        <ImportConflictDialog
          isOpen={true}
          conflictingPatternNames={pendingImport.conflictingNames}
          totalIncoming={pendingImport.payload.notes.length}
          initialStrategy="append"
          onCancel={() => setPendingImport(null)}
          onConfirm={handleConfirmCollision}
        />
      )}
    </div>
  );
}
