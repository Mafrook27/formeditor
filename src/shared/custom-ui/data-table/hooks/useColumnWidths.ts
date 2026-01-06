import { useMemo } from "react";
import type { ColumnDef } from "../types";
import { calculateColumnWidth } from "../utils";

/**
 * Calculates column widths based on content or explicit width settings
 */
export function useColumnWidths<T>(
  columns: ColumnDef<T>[],
  data: T[],
  disableAutoSize: boolean,
) {
  return useMemo(() => {
    if (disableAutoSize) return {};

    const widths: Record<string, number> = {};
    columns.forEach((col) => {
      const key = String(col.key);
      if (col.width) {
        widths[key] =
          typeof col.width === "number" ? col.width : parseInt(col.width);
      } else {
        const columnData = data.map((row) => row[col.key]);
        widths[key] = calculateColumnWidth(
          col.header,
          columnData,
          col.minWidth,
          col.maxWidth,
        );
      }
    });
    return widths;
  }, [columns, data, disableAutoSize]);
}
