// 1️⃣ IMPORTS
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// 2️⃣ TYPE DEFINITIONS
interface SortableColumnItemProps {
  id: string;
  label: string;
  onRemove: () => void;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
export function SortableColumnItem({
  id,
  label,
  onRemove,
}: SortableColumnItemProps) {
  // 5️⃣ CUSTOM HOOKS
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // 6️⃣ JSX RETURN
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
      }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white shadow-sm",
        "border-2 border-blue-500",
        isDragging ? "shadow-lg cursor-grabbing" : "hover:shadow-md",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        title="Drag to reorder"
        type="button"
      >
        <span className="text-lg leading-none select-none">≡</span>
      </button>
      <span className="text-gray-700 font-medium select-none text-sm">
        {label}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-red-500 hover:text-red-700 ml-1"
        title="Hide column"
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
