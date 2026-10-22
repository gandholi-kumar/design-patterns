import React from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  PenTool,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  ImageIcon,
} from "lucide-react";
import type { Pattern } from "../../data";
import type { PatternNote } from "../../lib/notes/notes-schema";
import { AppTooltip } from "../ui/app-tooltip";
import { NotesPaginationBar } from "./NotesPaginationBar";

export type SortField = "name" | "category" | "modified" | "status";
export type SortDirection = "asc" | "desc";

interface NotesTableViewProps {
  patterns: Pattern[];
  notesMap: Record<string, PatternNote>;
  selectedPatternIds: Set<string>;
  onToggleSelect: (patternId: string, e: React.MouseEvent) => void;
  onSelectAllVisible: () => void;
  onOpenNote: (patternId: string) => void;
  onExportJson: (patternIds: string[], e: React.MouseEvent) => void;
  onExportMarkdown?: (patternIds: string[], e: React.MouseEvent) => void;
  onRequestDelete: (patternId: string, patternName: string, e: React.MouseEvent) => void;
  extractSnippet: (blocks: any[]) => string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
}

export function NotesTableView({
  patterns,
  notesMap,
  selectedPatternIds,
  onToggleSelect,
  onSelectAllVisible,
  onOpenNote,
  onExportJson,
  onRequestDelete,
  extractSnippet,
  sortField,
  sortDirection,
  onSortChange,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: NotesTableViewProps) {
  const allVisibleSelected =
    patterns.length > 0 && selectedPatternIds.size === patterns.length;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40 group-hover/th:text-muted-foreground transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-amber-500 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-500 font-bold" />
    );
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "creational":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
      case "structural":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "behavioral":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
      case "distributed":
      case "saga":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "playground":
        return "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30";
      default:
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full border border-border/80 rounded-xl overflow-hidden bg-card/40 backdrop-blur-sm">
        <div className="p-4 flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-full bg-muted/40 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return null; // Empty state handled by parent container
  }

  return (
    <div className="w-full border border-border/80 rounded-xl overflow-hidden bg-card/60 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
              {/* Checkbox column */}
              <th className="py-3 px-3.5 w-10 text-center">
                <button
                  type="button"
                  onClick={onSelectAllVisible}
                  className="hover:text-amber-500 text-muted-foreground transition-colors inline-flex items-center justify-center"
                  title={allVisibleSelected ? "Deselect all" : "Select all visible"}
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>

              {/* Pattern / Topic Name */}
              <th
                onClick={() => onSortChange("name")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors group/th"
              >
                <div className="flex items-center gap-1.5">
                  <span>Topic / Pattern</span>
                  {renderSortIcon("name")}
                </div>
              </th>

              {/* Domain / Scope (Future extensible: GoF, Saga, Playground) */}
              <th className="py-3 px-3 hidden sm:table-cell">
                <span>Domain</span>
              </th>

              {/* Category */}
              <th
                onClick={() => onSortChange("category")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors group/th"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {renderSortIcon("category")}
                </div>
              </th>

              {/* Note Snippet / Preview */}
              <th className="py-3 px-4 min-w-[200px] hidden md:table-cell">
                <span>Notes Snippet Preview</span>
              </th>

              {/* Content Stats (Blocks/Images) */}
              <th className="py-3 px-3 hidden lg:table-cell">
                <span>Length / Media</span>
              </th>

              {/* Status */}
              <th
                onClick={() => onSortChange("status")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors group/th"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </th>

              {/* Last Modified */}
              <th
                onClick={() => onSortChange("modified")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors group/th hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Last Modified</span>
                  {renderSortIcon("modified")}
                </div>
              </th>

              {/* Row Actions */}
              <th className="py-3 px-4 text-right pr-4">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border/60">
            {patterns.map((pattern) => {
              const note = notesMap[pattern.id];
              const isSelected = selectedPatternIds.has(pattern.id);
              const snippet = note ? extractSnippet(note.blocks) : "";
              const blockCount = note?.blocks?.length || 0;
              
              // Count images in blocks
              const imageCount = note?.blocks
                ? note.blocks.filter((b) => b.type === "image").length
                : 0;

              const formattedDate = note
                ? new Date(note.lastModified).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <tr
                  key={pattern.id}
                  onClick={() => onOpenNote(pattern.id)}
                  className={`group transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 hover:bg-amber-500/15"
                      : note
                      ? "hover:bg-muted/50 bg-background/50"
                      : "hover:bg-muted/30 bg-background/20 opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => onToggleSelect(pattern.id, e)}
                      className="text-muted-foreground hover:text-amber-500 transition-colors inline-flex items-center justify-center"
                      title={isSelected ? "Deselect row" : "Select row"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>

                  {/* Pattern / Topic Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {note ? (
                        <PenTool className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {pattern.name}
                        </span>
                        <div className="text-xs text-muted-foreground font-mono sm:hidden">
                          {pattern.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Domain Tag (Extensible for GoF, Saga, Live Playground) */}
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      GoF
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryBadgeClass(
                        pattern.category
                      )}`}
                    >
                      {pattern.category}
                    </span>
                  </td>

                  {/* Snippet Preview */}
                  <td className="py-3 px-4 hidden md:table-cell max-w-xs lg:max-w-md xl:max-w-xl 2xl:max-w-2xl">
                    {note ? (
                      <p className="text-xs text-muted-foreground truncate leading-normal" title={snippet}>
                        {snippet}
                      </p>
                    ) : (
                      <span className="text-muted-foreground/50 italic text-xs">
                        No notes yet
                      </span>
                    )}
                  </td>

                  {/* Stats (Blocks & Images) */}
                  <td className="py-3 px-3 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                    {note ? (
                      <div className="flex items-center gap-2">
                        <span>{blockCount} {blockCount === 1 ? "block" : "blocks"}</span>
                        {imageCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                            <ImageIcon className="w-3 h-3" />
                            <span>{imageCount}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3 px-3">
                    {note ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Annotated</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        <span>Empty</span>
                      </span>
                    )}
                  </td>

                  {/* Last Modified */}
                  <td className="py-3 px-3 hidden sm:table-cell text-muted-foreground text-xs whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3 px-4 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {note && (
                        <AppTooltip content="Export note JSON">
                          <button
                            type="button"
                            onClick={(e) => onExportJson([pattern.id], e)}
                            className="p-1 rounded text-muted-foreground hover:text-amber-500 hover:bg-muted transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </AppTooltip>
                      )}

                      {note && (
                        <AppTooltip content="Delete note">
                          <button
                            type="button"
                            onClick={(e) => onRequestDelete(pattern.id, pattern.name, e)}
                            className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-muted transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AppTooltip>
                      )}

                      <AppTooltip content="Open full notes editor">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote(pattern.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-border/80 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-500/40 text-muted-foreground transition-colors"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </AppTooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Bar */}
      {totalItems !== undefined &&
        currentPage !== undefined &&
        pageSize !== undefined &&
        onPageChange &&
        onPageSizeChange && (
          <NotesPaginationBar
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
    </div>
  );
}
