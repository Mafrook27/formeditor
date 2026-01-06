import { useEffect } from "react";
import type { Table } from "@tanstack/react-table";
import type { RowSelectionState } from "@tanstack/react-table";

/**
 * Handles row selection changes and notifies parent component
 */
export function useRowSelection<T>(
  table: Table<T> | null,
  rowSelection: RowSelectionState,
  enableRowSelection: boolean,
  onRowSelectionChange?: (selectedRows: T[]) => void,
) {
  useEffect(() => {
    if (onRowSelectionChange && enableRowSelection && table) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, enableRowSelection, table, onRowSelectionChange]);
}
