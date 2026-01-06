import type { ColumnSizingState, OnChangeFn } from "@tanstack/react-table";

/**
 * Column definition for DataTable
 */
export interface ColumnDef<T> {
  /** Unique key from data object */
  key: keyof T;
  /** Header text */
  header: string;
  /** Custom width (number in px or string like '150px'). If not set, auto-calculates from content */
  width?: number | string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Enable sorting (default: true) */
  sortable?: boolean;
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Min width for auto-sizing (default: 80px) */
  minWidth?: number;
  /** Max width for auto-sizing (default: 400px) */
  maxWidth?: number;
  /** Column visibility (default: true) */
  visible?: boolean;
  /** Make cell clickable with green color - navigates to customer details */
  clickable?: boolean;
}

/**
 * Action button definition
 */
export interface ActionDef<T> {
  /** Icon component */
  icon: React.ReactNode;
  /** Tooltip/aria-label */
  label: string;
  /** Click handler */
  onClick: (row: T) => void;
  /** Conditional hide */
  hide?: (row: T) => boolean;
}

/**
 * DataTable props
 */
export interface DataTableProps<T> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Actions config - can be static array or dynamic function per row */
  actions?: {
    header?: string;
    width?: string;
    items: ActionDef<T>[] | ((row: T) => ActionDef<T>[]);
  };
  stableHeight?: boolean;
  /** Enable sticky Actions column on the right (default: false) */
  stickyActions?: boolean;
  /** Row key field (default: 'id') */
  rowKey?: keyof T;
  /** Initial page size (default: 10) */
  initialPageSize?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Show column filters (default: true) */
  enableColumnFilters?: boolean;
  /** Show global search bar (default: true) */
  enableGlobalSearch?: boolean;
  /** Table title */
  title?: string;
  /** Enable TanStack column resizing (default: false) */
  enableColumnResizing?: boolean;
  /** Column sizing change callback */
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
  /** Page size options (default: [5, 10, 20, 50]) */
  pageSizeOptions?: number[];
  /** Disable auto-sizing (default: false) */
  disableAutoSize?: boolean;
  /** Enable pagination (default: true) */
  enablePagination?: boolean;
  /** Enable row selection with checkboxes (default: false) */
  enableRowSelection?: boolean;
  /** Callback when row selection changes */
  onRowSelectionChange?: (selectedRows: T[]) => void;
  /** Enable export button (default: false) */
  enableExport?: boolean;
  /** Callback when export is clicked */
  onExport?: () => void;
}
