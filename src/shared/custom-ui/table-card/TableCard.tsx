// 1️⃣ IMPORTS
import type { ReactNode } from "react";

// 2️⃣ TYPE DEFINITIONS
interface TableCardProps {
  children: ReactNode;
  className?: string;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * Optional wrapper for DataTable when you need the card styling.
 * Use this in pages like /customers where you want the bordered card look.
 * Don't use it in components that already have their own card wrapper.
 */
export const TableCard = ({ children, className = "" }: TableCardProps) => {
  // 5️⃣ STATE - None
  // 6️⃣ REFS - None
  // 7️⃣ CUSTOM HOOKS - None
  // 8️⃣ DERIVED VALUES - None
  // 9️⃣ EFFECTS - None
  // 🔟 HANDLER FUNCTIONS - None

  // 1️⃣1️⃣ JSX RETURN
  return (
    <div
      className={`rounded-lg border bg-card shadow-sm p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
};

// 1️⃣2️⃣ EXPORT
export default TableCard;
