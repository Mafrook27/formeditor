import { useState, useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { ColumnConfig } from "../types/action-container.types";

export function useColumnManagement(columns: ColumnConfig[]) {
  // Initialize active columns (visible ones)
  const [activeColumns, setActiveColumns] = useState<string[]>(() => {
    return columns.filter((c) => c.visible !== false).map((c) => c.id);
  });

  // Initialize removed columns (hidden ones)
  const [removedColumns, setRemovedColumns] = useState<string[]>(() => {
    const allColumnIds = columns.map((c) => c.id);
    const activeIds = columns
      .filter((c) => c.visible !== false)
      .map((c) => c.id);
    return allColumnIds.filter((id) => !activeIds.includes(id));
  });

  // Handle drag and drop reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setActiveColumns((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newOrder = [...items];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      return newOrder;
    });
  }, []);

  // Remove column from visible list
  const removeColumn = useCallback((colId: string) => {
    setActiveColumns((prev) => prev.filter((id) => id !== colId));
    setRemovedColumns((prev) => {
      if (prev.includes(colId)) return prev;
      return [...prev, colId];
    });
  }, []);

  // Add column to visible list
  const addColumn = useCallback((colId: string) => {
    setRemovedColumns((prev) => prev.filter((id) => id !== colId));
    setActiveColumns((prev) => {
      if (prev.includes(colId)) return prev;
      return [...prev, colId];
    });
  }, []);

  // Safety check: Ensure no duplicates
  const safeActiveColumns = activeColumns.filter((id) =>
    columns.some((c) => c.id === id),
  );
  const safeRemovedColumns = removedColumns.filter(
    (id) => columns.some((c) => c.id === id) && !safeActiveColumns.includes(id),
  );

  return {
    activeColumns: safeActiveColumns,
    removedColumns: safeRemovedColumns,
    handleDragEnd,
    removeColumn,
    addColumn,
  };
}
