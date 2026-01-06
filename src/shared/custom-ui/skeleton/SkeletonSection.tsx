// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonBase } from "./SkeletonBase";

// 2️⃣ TYPE DEFINITIONS
interface SkeletonSectionProps {
  /** Show section title */
  showTitle?: boolean;
  /** Number of content lines */
  lines?: number;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS
const WIDTHS = ["95%", "75%", "85%", "60%", "90%", "70%"];

// 4️⃣ COMPONENT DECLARATION
/**
 * Section Skeleton - Generic content section
 */
export function SkeletonSection({
  showTitle = true,
  lines = 4,
  className,
}: SkeletonSectionProps) {
  // 5️⃣ STATE - None
  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None
  // 8️⃣ DERIVED VALUES - None
  // 9️⃣ EFFECTS - None
  // 🔟 HANDLERS - None

  // 1️⃣1️⃣ JSX RETURN
  return (
    <div className={cn("space-y-4", className)}>
      {showTitle && <SkeletonBase height={24} width={200} rounded="md" />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            height={16}
            width={WIDTHS[i % WIDTHS.length]}
            rounded="sm"
          />
        ))}
      </div>
    </div>
  );
}
