import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "../../../lib/utils";

interface DataTablePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-3 sm:gap-4 border-t">
      {/* Status Text */}
      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
        Showing{" "}
        <span className="font-medium text-foreground">
          {totalItems > 0 ? startItem : 0}
        </span>{" "}
        to <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        entries
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4 order-1 sm:order-2">
        {/* Rows Per Page */}
        <div className="flex items-center space-x-2">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
            Rows per page
          </p>
          <Select
            value={String(pageSize)}
            onValueChange={(value: string) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[60px] sm:w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "inline-flex items-center justify-center gap-1 h-10 px-4 rounded-md text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className={cn(
              "inline-flex items-center justify-center gap-1 h-10 px-4 rounded-md text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              currentPage === totalPages || totalPages === 0
                ? "pointer-events-none opacity-50"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
}
