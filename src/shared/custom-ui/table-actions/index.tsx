// 1️⃣ IMPORTS
import type { ReactNode } from "react";
import { ColumnButton, TagsButton, CommsButton } from "./ActionButtons";

// 2️⃣ TYPE DEFINITIONS
interface TableActionsProps {
  children: ReactNode;
  selectedCount?: number;
  className?: string;
}

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * TableActions - Container for action buttons above DataTable
 *
 * @example
 * <TableActions selectedCount={5}>
 *   <TableActions.ColumnButton onClick={...} />
 *   <TableActions.TagsButton onClick={...} />
 *   <TableActions.CommsButton onClick={...} />
 * </TableActions>
 */
export function TableActions({ children, className = "" }: TableActionsProps) {
  return (
    <div className={`flex items-center justify-end gap-2  ${className}`}>
      {children}
    </div>
  );
}

// 5️⃣ ATTACH SUB-COMPONENTS
TableActions.ColumnButton = ColumnButton;
TableActions.TagsButton = TagsButton;
TableActions.CommsButton = CommsButton;

// 6️⃣ EXPORTS
export { ActionContainer } from "./panels/ActionContainer";
export type {
  ColumnConfig,
  PanelType,
  Template,
  CommunicationMode,
} from "./types/action-container.types";
