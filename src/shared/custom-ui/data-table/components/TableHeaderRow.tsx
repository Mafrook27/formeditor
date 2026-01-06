import { flexRender } from "@tanstack/react-table";
import type { Table, Header } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type { ColumnDef } from "../types";

interface TableHeaderRowProps<T> {
  table: Table<T>;
  columns: ColumnDef<T>[];
  enableColumnFilters: boolean;
  enableColumnResizing: boolean;
  disableAutoSize: boolean;
  stickyActions?: boolean;
  isScrolled?: boolean;
}

const STICKY_ACTIONS_WIDTH = 120;

/**
 * Table header row with sorting and filtering
 */
export function TableHeaderRow<T>({
  table,
  columns,
  enableColumnFilters,
  enableColumnResizing,
  disableAutoSize,
  stickyActions = false,
  isScrolled = false,
}: TableHeaderRowProps<T>) {
  return (
    <thead className="bg-muted/50 sticky top-0 z-2">
      {/* Headers */}
      <tr className="border-b">
        {table
          .getHeaderGroups()[0]
          .headers.map((header: Header<T, unknown>) => {
            const column = header.column;
            const columnDef = columns.find((c) => String(c.key) === header.id);
            const isActionsColumn = header.id === "actions";
            const isSelectColumn = header.id === "select";
            const align =
              isActionsColumn || isSelectColumn
                ? "center"
                : columnDef?.align || "left";
            const isSortable =
              column.getCanSort() && !isActionsColumn && !isSelectColumn;

            // Sticky styles for actions column
            const stickyStyles =
              stickyActions && isActionsColumn
                ? {
                    position: "sticky" as const,
                    right: 0,
                    width: STICKY_ACTIONS_WIDTH,
                    minWidth: STICKY_ACTIONS_WIDTH,
                    maxWidth: STICKY_ACTIONS_WIDTH,
                    zIndex: 20,
                  }
                : {};

            return (
              <th
                key={header.id}
                style={{
                  width: disableAutoSize ? undefined : header.getSize(),
                  minWidth: disableAutoSize
                    ? undefined
                    : enableColumnResizing
                      ? 50
                      : header.getSize(),
                  maxWidth: enableColumnResizing ? header.getSize() : undefined,
                  position: "relative",
                  ...stickyStyles,
                }}
                className={cn(
                  "min-h-12 h-auto py-2 px-2 font-medium text-muted-foreground transition-shadow duration-200",
                  align === "right" && "text-right",
                  align === "center" && "text-center",
                  align === "left" && "text-left",
                  stickyActions && isActionsColumn
                    ? cn(
                        "bg-slate-100",
                        isScrolled &&
                          "shadow-[inset_4px_0_8px_-4px_rgba(0,0,0,0.15)]",
                      )
                    : "bg-muted/50",
                )}
              >
                {isSortable ? (
                  <button
                    onClick={column.getToggleSortingHandler()}
                    className="group inline-flex items-center gap-1.5 w-full font-semibold text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <span
                      className={
                        enableColumnResizing || disableAutoSize
                          ? "break-words whitespace-normal"
                          : "truncate"
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    <span className="inline-flex flex-col shrink-0">
                      <ChevronUp
                        className={cn(
                          "h-3 w-3 -mb-1 transition-all",
                          column.getIsSorted() === "asc"
                            ? "text-primary opacity-100"
                            : "text-muted-foreground opacity-30 group-hover:opacity-60",
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-all",
                          column.getIsSorted() === "desc"
                            ? "text-primary opacity-100"
                            : "text-muted-foreground opacity-30 group-hover:opacity-60",
                        )}
                      />
                    </span>
                  </button>
                ) : (
                  <div
                    className={cn(
                      "inline-flex items-center w-full",
                      isActionsColumn ? "justify-center" : "gap-1.5",
                      isSelectColumn && "justify-center",
                    )}
                  >
                    <span
                      className={cn(
                        "font-semibold text-foreground",
                        enableColumnResizing || disableAutoSize
                          ? "break-words whitespace-normal"
                          : "truncate",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                    {!isActionsColumn && !isSelectColumn && (
                      <span className="inline-flex flex-col shrink-0">
                        <ChevronUp className="h-3 w-3 -mb-1 text-muted-foreground opacity-30" />
                        <ChevronDown className="h-3 w-3 text-muted-foreground opacity-30" />
                      </span>
                    )}
                  </div>
                )}

                {/* Resize Handle */}
                {enableColumnResizing && header.column.getCanResize() && (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={cn(
                      "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none cus-resize ",
                      "hover:bg-primary/50",
                      header.column.getIsResizing() && "bg-primary",
                    )}
                  />
                )}
              </th>
            );
          })}
      </tr>

      {/* Column Filters */}
      {enableColumnFilters && (
        <tr className="border-b">
          {table.getHeaderGroups()[0].headers.map((header: any) => {
            const isActionsColumn = header.id === "actions";

            // Sticky styles for actions column filter cell
            const stickyFilterStyles =
              stickyActions && isActionsColumn
                ? {
                    position: "sticky" as const,
                    right: 0,
                    width: STICKY_ACTIONS_WIDTH,
                    minWidth: STICKY_ACTIONS_WIDTH,
                    maxWidth: STICKY_ACTIONS_WIDTH,
                    zIndex: 20,
                  }
                : {};

            return (
              <th
                key={`${header.id}-filter`}
                className={cn(
                  "h-10 px-1.5 transition-shadow duration-200",
                  stickyActions && isActionsColumn
                    ? cn(
                        "bg-slate-100",
                        isScrolled &&
                          "shadow-[inset_4px_0_8px_-4px_rgba(0,0,0,0.15)]",
                      )
                    : "bg-muted/50",
                )}
                style={stickyFilterStyles}
              >
                {header.id !== "actions" && header.id !== "select" && (
                  <div className="relative flex items-center">
                    <Search className="absolute left-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={(header.column.getFilterValue() as string) ?? ""}
                      onChange={(e) =>
                        header.column.setFilterValue(e.target.value)
                      }
                      className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      )}
    </thead>
  );
}
