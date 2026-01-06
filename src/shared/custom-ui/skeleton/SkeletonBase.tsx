// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";

// 2️⃣ TYPE DEFINITIONS
interface SkeletonBaseProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  style?: React.CSSProperties;
}

// 3️⃣ CONSTANTS
const ROUNDED_CLASSES = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

// 4️⃣ COMPONENT DECLARATION
/**
 * Base skeleton primitive with shimmer animation
 */
export function SkeletonBase({
  className,
  width,
  height,
  rounded = "md",
  style,
}: SkeletonBaseProps) {
  // 5️⃣ STATE - None
  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None
  // 8️⃣ DERIVED VALUES - None
  // 9️⃣ EFFECTS - None
  // 🔟 HANDLERS - None

  // 1️⃣1️⃣ JSX RETURN
  return (
    <div
      className={cn(
        "bg-gray-200 skeleton-shimmer",
        ROUNDED_CLASSES[rounded],
        className,
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    />
  );
}
