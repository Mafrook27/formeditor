// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonBase } from "./SkeletonBase";

// 2️⃣ TYPE DEFINITIONS
interface SkeletonPageHeaderProps {
  /** Show action buttons (Columns, Tags, Comms) */
  showActions?: boolean;
  /** Number of action buttons */
  actionCount?: number;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * Page Header Skeleton - Matches your page header layout (Title + Action Buttons)
 */
export function SkeletonPageHeader({
  showActions = true,
  actionCount = 3,
  className,
}: SkeletonPageHeaderProps) {
  // 5️⃣ STATE - None
  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None
  // 8️⃣ DERIVED VALUES - None
  // 9️⃣ EFFECTS - None
  // 🔟 HANDLERS - None

  // 1️⃣1️⃣ JSX RETURN
  return (
    <section className={cn("flex items-center justify-between", className)}>
      {/* Page Title */}
      <SkeletonBase height={32} width={150} rounded="md" />

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-2">
          {Array.from({ length: actionCount }).map((_, i) => (
            <SkeletonBase key={i} height={36} width={100} rounded="md" />
          ))}
        </div>
      )}
    </section>
  );
}
