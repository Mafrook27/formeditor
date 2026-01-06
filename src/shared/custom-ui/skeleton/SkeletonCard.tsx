// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonBase } from "./SkeletonBase";

// 2️⃣ TYPE DEFINITIONS
interface SkeletonCardProps {
  /** Number of content lines */
  lines?: number;
  /** Show header */
  showHeader?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Custom className */
  className?: string;
}

interface SkeletonCardsProps {
  /** Number of cards */
  count?: number;
  /** Grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Card props */
  cardProps?: Omit<SkeletonCardProps, "className">;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS
const WIDTHS = ["95%", "80%", "70%", "85%", "75%"];

const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

// 4️⃣ COMPONENT DECLARATIONS

/**
 * Single Card Skeleton
 */
export function SkeletonCard({
  lines = 3,
  showHeader = true,
  showFooter = false,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5 space-y-4",
        className,
      )}
    >
      {showHeader && (
        <div className="space-y-2">
          <SkeletonBase height={18} width="50%" rounded="sm" />
          <SkeletonBase height={12} width="30%" rounded="sm" />
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            height={14}
            width={WIDTHS[i % WIDTHS.length]}
            rounded="sm"
          />
        ))}
      </div>

      {showFooter && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <SkeletonBase height={14} width={80} rounded="sm" />
          <SkeletonBase height={32} width={100} rounded="md" />
        </div>
      )}
    </div>
  );
}

/**
 * Multiple Cards Skeleton Grid
 */
export function SkeletonCards({
  count = 3,
  columns = 3,
  cardProps = {},
  className,
}: SkeletonCardsProps) {
  return (
    <div className={cn("grid gap-4", GRID_COLS[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...cardProps} />
      ))}
    </div>
  );
}
