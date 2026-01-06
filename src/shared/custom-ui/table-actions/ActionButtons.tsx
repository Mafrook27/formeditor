// 1️⃣ IMPORTS
import { Settings, Tag, MessageSquare } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

// 2️⃣ TYPE DEFINITIONS
interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATIONS

/**
 * Column Config Button - Shows "Columns" button
 */
export function ColumnButton({
  onClick,
  disabled = false,
  isActive = false,
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "transition-all cursor-pointer",
        isActive
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 hover:bg-blue-700"
          : "text-blue-600 border-blue-600 hover:bg-blue-50",
      )}
    >
      <Settings className="h-4 w-4 mr-2" />
      Columns
    </Button>
  );
}

/**
 * Tags Button - Shows "Add Tags" button
 */
export function TagsButton({
  onClick,
  disabled = false,
  isActive = false,
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "transition-all cursor-pointer",
        isActive
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 hover:bg-blue-700"
          : "text-blue-600 border-blue-600 hover:bg-blue-50",
      )}
    >
      <Tag className="h-4 w-4 mr-2" />
      Add Tags
    </Button>
  );
}

/**
 * Communication Button - Shows "Comms" button
 */
export function CommsButton({
  onClick,
  disabled = false,
  isActive = false,
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "transition-all cursor-pointer",
        isActive
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 hover:bg-blue-700"
          : "text-blue-600 border-blue-600 hover:bg-blue-50",
      )}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Comms
    </Button>
  );
}
