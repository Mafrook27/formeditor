import { useState } from "react";
import type {
  SortingState,
  ColumnFiltersState,
  ColumnSizingState,
  RowSelectionState,
} from "@tanstack/react-table";

/**
 * Manages all table state (sorting, filtering, pagination, etc.)
 */
export function useTableState(initialPageSize: number) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    columnSizing,
    setColumnSizing,
    rowSelection,
    setRowSelection,
  };
}
