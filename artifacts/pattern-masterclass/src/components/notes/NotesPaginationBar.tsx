import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export interface NotesPaginationBarProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  className?: string;
  itemName?: string;
}

export function NotesPaginationBar({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = "",
  itemName = "notes",
}: NotesPaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * pageSize);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (safeCurrentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground select-none ${className}`}
    >
      {/* Item range count */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span>Showing</span>
        <span className="font-semibold text-foreground">
          {startItem}–{endItem}
        </span>
        <span>of</span>
        <span className="font-semibold text-foreground">{totalItems}</span>
        <span>{itemName}</span>
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-1">
        {/* First Page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          className="p-1 rounded-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="p-1 rounded-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-muted-foreground/60 font-mono text-[11px]"
                >
                  •••
                </span>
              );
            }

            const isCurrent = page === safeCurrentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-7 h-7 px-2 rounded-md font-mono text-[11px] font-medium transition-all ${
                  isCurrent
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold shadow-2xs"
                    : "border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1 rounded-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1 rounded-md border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rows per page selector (10, 20, 50, 100) */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-[11px] text-muted-foreground">Rows per page:</span>
        <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-background shadow-2xs">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                pageSize === size
                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              title={`Show ${size} rows per page`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
