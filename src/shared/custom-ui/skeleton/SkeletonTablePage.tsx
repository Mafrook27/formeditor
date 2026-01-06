// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonTable } from "./SkeletonTable";
import { SkeletonPageHeader } from "./SkeletonPageHeader";

// 2️⃣ TYPE DEFINITIONS
interface ColumnMeta {
  key?: string | number | symbol;
  header?: string;
  width?: string | number;
  minWidth?: number;
  visible?: boolean;
}

interface SkeletonTablePageProps {
  /** Column definitions - uses your existing table column metadata */
  columns?: ColumnMeta[];
  /** Number of skeleton rows */
  rows?: number;
  /** Show checkbox column */
  showCheckbox?: boolean;
  /** Show actions column in table */
  showTableActions?: boolean;
  /** Number of action buttons in table */
  tableActionCount?: number;
  /** Show page header action buttons */
  showHeaderActions?: boolean;
  /** Number of header action buttons */
  headerActionCount?: number;
  /** Show pagination */
  showPagination?: boolean;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * Complete Table Page Skeleton
 *
 * Matches your /customers page layout:
 * - Page Header (Title + Action Buttons)
 * - TableCard wrapper
 * - DataTable with columns, rows, actions, pagination
 */
export function SkeletonTablePage({
  columns = [],
  rows = 10,
  showCheckbox = false,
  showTableActions = true,
  tableActionCount = 3,
  showHeaderActions = true,
  headerActionCount = 3,
  showPagination = true,
  className,
}: SkeletonTablePageProps) {
  // 5️⃣ STATE - None
  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None
  // 8️⃣ DERIVED VALUES - None
  // 9️⃣ EFFECTS - None
  // 🔟 HANDLERS - None

  // 1️⃣1️⃣ JSX RETURN
  return (
    <div className={cn("space-y-4", className)}>
      {/* Page Header */}
      <SkeletonPageHeader
        showActions={showHeaderActions}
        actionCount={headerActionCount}
      />

      {/* TableCard Wrapper */}
      <div className="rounded-lg border bg-card shadow-sm p-4 sm:p-6">
        <SkeletonTable
          columns={columns}
          rows={rows}
          showCheckbox={showCheckbox}
          showActions={showTableActions}
          actionCount={tableActionCount}
          showPagination={showPagination}
        />
      </div>
    </div>
  );
}
