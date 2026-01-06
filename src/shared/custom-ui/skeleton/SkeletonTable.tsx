// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonBase } from "./SkeletonBase";

// 2️⃣ TYPE DEFINITIONS
interface ColumnMeta {
  key?: string | number | symbol;
  header?: string;
  width?: string | number;
  minWidth?: number;
  visible?: boolean;
}

interface SkeletonTableProps {
  /** Column definitions - uses your existing table column metadata */
  columns?: ColumnMeta[];
  /** Number of skeleton rows */
  rows?: number;
  /** Show checkbox column */
  showCheckbox?: boolean;
  /** Show actions column */
  showActions?: boolean;
  /** Number of action buttons */
  actionCount?: number;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS
const HEADER_WIDTHS = ["60%", "70%", "55%", "65%", "50%", "75%"];
const CELL_WIDTHS = ["70%", "85%", "60%", "90%", "75%", "80%"];

// 4️⃣ COMPONENT DECLARATION
/**
 * Enterprise Table Skeleton - Matches your DataTable layout
 */
export function SkeletonTable({
  columns = [],
  rows = 10,
  showCheckbox = false,
  showActions = true,
  actionCount = 3,
  showPagination = true,
  className,
}: SkeletonTableProps) {
  // 5️⃣ DERIVED VALUES
  const visibleColumns = columns.filter((col) => col.visible !== false);

  // If no columns provided, generate default columns
  const displayColumns =
    visibleColumns.length > 0
      ? visibleColumns
      : Array.from({ length: 6 }, (_, i) => ({
          key: `col${i}`,
          header: `Column ${i}`,
          width: undefined,
          minWidth: undefined,
          visible: true,
        }));

  // 6️⃣ JSX RETURN
  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200">
              {showCheckbox && (
                <th className="w-12 px-4 py-3">
                  <div className="flex justify-center">
                    <SkeletonBase width={18} height={18} rounded="sm" />
                  </div>
                </th>
              )}
              {displayColumns.map((col, idx) => (
                <th
                  key={String(col.key) || idx}
                  className="px-4 py-3 text-left"
                  style={{ width: col.width, minWidth: col.minWidth }}
                >
                  <SkeletonBase
                    height={14}
                    width={HEADER_WIDTHS[idx % HEADER_WIDTHS.length]}
                    rounded="sm"
                  />
                </th>
              ))}
              {showActions && (
                <th className="w-32 px-4 py-3">
                  <div className="flex justify-center">
                    <SkeletonBase height={14} width={50} rounded="sm" />
                  </div>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {showCheckbox && (
                  <td className="w-12 px-4 py-3">
                    <div className="flex justify-center">
                      <SkeletonBase width={18} height={18} rounded="sm" />
                    </div>
                  </td>
                )}
                {displayColumns.map((col, colIdx) => (
                  <td
                    key={String(col.key) || colIdx}
                    className="px-4 py-3"
                    style={{ width: col.width, minWidth: col.minWidth }}
                  >
                    <SkeletonBase
                      height={16}
                      width={CELL_WIDTHS[colIdx % CELL_WIDTHS.length]}
                      rounded="sm"
                    />
                  </td>
                ))}
                {showActions && (
                  <td className="w-32 px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {Array.from({ length: actionCount }).map((_, i) => (
                        <SkeletonBase
                          key={i}
                          width={32}
                          height={32}
                          rounded="md"
                        />
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <SkeletonBase width={70} height={14} rounded="sm" />
            <SkeletonBase width={70} height={36} rounded="md" />
          </div>
          <div className="flex items-center gap-4">
            <SkeletonBase width={100} height={14} rounded="sm" />
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBase key={i} width={36} height={36} rounded="md" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
