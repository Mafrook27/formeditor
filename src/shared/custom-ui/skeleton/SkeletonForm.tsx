// 1️⃣ IMPORTS
import { cn } from "@/shared/lib/utils";
import { SkeletonBase } from "./SkeletonBase";

// 2️⃣ TYPE DEFINITIONS
interface FieldMeta {
  name?: string;
  type?: "text" | "select" | "textarea" | "checkbox";
  width?: "full" | "half" | "third";
}

interface SkeletonFormProps {
  /** Field definitions */
  fields?: FieldMeta[];
  /** Number of fields (if no fields provided) */
  fieldCount?: number;
  /** Form columns */
  columns?: 1 | 2 | 3;
  /** Show submit button */
  showSubmit?: boolean;
  /** Custom className */
  className?: string;
}

// 3️⃣ CONSTANTS
const LABEL_WIDTHS = ["50%", "60%", "45%", "55%", "40%", "65%"];

const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

// 4️⃣ COMPONENT DECLARATION
/**
 * Form Skeleton - Matches form layouts
 */
export function SkeletonForm({
  fields = [],
  fieldCount = 6,
  columns = 2,
  showSubmit = true,
  className,
}: SkeletonFormProps) {
  // 5️⃣ STATE - None

  // 6️⃣ REFS - None

  // 7️⃣ DERIVED VALUES
  const displayFields =
    fields.length > 0
      ? fields
      : Array.from({ length: fieldCount }, () => ({ type: "text" as const }));

  // 8️⃣ JSX RETURN
  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("grid gap-4", GRID_COLS[columns])}>
        {displayFields.map((field, i) => (
          <div key={i} className="space-y-2">
            {/* Label */}
            <SkeletonBase
              height={14}
              width={LABEL_WIDTHS[i % LABEL_WIDTHS.length]}
              rounded="sm"
            />
            {/* Input */}
            <SkeletonBase
              height={field.type === "textarea" ? 80 : 40}
              width="100%"
              rounded="md"
            />
          </div>
        ))}
      </div>

      {showSubmit && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <SkeletonBase height={40} width={100} rounded="md" />
          <SkeletonBase height={40} width={120} rounded="md" />
        </div>
      )}
    </div>
  );
}
