// 1️⃣ IMPORTS
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { IoGrid } from "react-icons/io5";
import type { ColumnConfig } from "../types/action-container.types";
import { SortableColumnItem } from "./SortableColumnItem";

// 2️⃣ TYPE DEFINITIONS
export interface ColumnConfigPanelProps {
  columns: ColumnConfig[];
  columnManagement: {
    activeColumns: string[];
    removedColumns: string[];
    handleDragEnd: (event: any) => void;
    removeColumn: (colId: string) => void;
    addColumn: (colId: string) => void;
  };
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
export function ColumnConfigPanel({
  columns,
  columnManagement,
}: ColumnConfigPanelProps) {
  const {
    activeColumns,
    removedColumns,
    handleDragEnd,
    removeColumn,
    addColumn,
  } = columnManagement;

  // 5️⃣ JSX RETURN
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <IoGrid className="h-4 w-4 text-violet-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">
          Column Configuration
        </h3>
      </div>

      {/* VISIBLE COLUMNS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Visible Columns
            </span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {activeColumns.length} columns
          </span>
        </div>

        {activeColumns.length > 0 ? (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeColumns}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg min-h-[56px]">
                {activeColumns.map((colId) => {
                  const col = columns.find((c) => c.id === colId);
                  if (!col) return null;
                  return (
                    <SortableColumnItem
                      key={colId}
                      id={colId}
                      label={col.header}
                      onRemove={() => removeColumn(colId)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg text-center text-sm text-gray-400">
            No visible columns. Add columns from below.
          </div>
        )}
        <p className="text-xs text-gray-400">
          Drag to reorder • Click × to hide
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* HIDDEN COLUMNS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Hidden Columns
            </span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {removedColumns.length} columns
          </span>
        </div>

        {removedColumns.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 border border-gray-100 rounded-lg min-h-[56px]">
            {removedColumns.map((colId) => {
              const col = columns.find((c) => c.id === colId);
              if (!col) return null;
              return (
                <button
                  key={colId}
                  onClick={() => addColumn(colId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all text-sm text-gray-600"
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{col.header}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-center text-sm text-emerald-600">
            ✓ All columns are visible
          </div>
        )}
      </div>
    </div>
  );
}
