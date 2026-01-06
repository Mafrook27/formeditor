import { IoSearch } from "react-icons/io5";
import { FileDown } from "lucide-react";

interface TableHeaderProps {
  title?: string;
  enableGlobalSearch: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  enableExport?: boolean;
  onExport?: () => void;
}

/**
 * Table header with title, global search, and export
 */
export function TableHeader({
  title,
  enableGlobalSearch,
  globalFilter,
  onGlobalFilterChange,
  enableExport = false,
  onExport,
}: TableHeaderProps) {
  if (!title && !enableGlobalSearch && !enableExport) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      {/* Left: Search */}
      {enableGlobalSearch && (
        <div className="relative w-full sm:w-80 flex items-center">
          <IoSearch className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* Right: Title and Export */}
      <div className="flex items-center gap-3">
        {/* {title && <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>} */}

        {enableExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 h-8 px-3 text-sm font-medium rounded-md border border-blue-600 text-blue-600 bg-background hover:bg-blue-50 transition-colors"
            aria-label="Export to CSV"
          >
            <FileDown className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
}
