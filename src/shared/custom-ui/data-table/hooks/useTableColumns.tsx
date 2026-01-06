import {
  useMemo,
  type JSXElementConstructor,
  type Key,
  type ReactElement,
  type ReactNode,
  type ReactPortal,
  cloneElement,
  isValidElement,
} from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { IoCall, IoEye, IoCopy } from "react-icons/io5";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { ColumnDef, ActionDef } from "../types";

/**
 * Builds TanStack Table columns from our column definitions
 */
export function useTableColumns<T extends Record<string, any>>(
  columns: ColumnDef<T>[],
  actions: any,
  columnWidths: Record<string, number>,
  enableRowSelection: boolean,
  stickyActions: boolean = true,
) {
  return useMemo(() => {
    const helper = createColumnHelper<T>();
    const cols: any[] = [];

    // Add selection column if enabled
    if (enableRowSelection) {
      cols.push(
        helper.display({
          id: "select",
          header: ({ table }: any) => (
            <div className="flex items-center justify-center mt-1">
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value: boolean) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }: any) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: boolean) =>
                  row.toggleSelected(!!value)
                }
                aria-label="Select row"
              />
            </div>
          ),
          size: 50,
          enableSorting: false,
          enableResizing: false,
        }),
      );
    }

    // Add data columns
    cols.push(
      ...columns.map((col) => {
        const key = String(col.key);
        return helper.accessor(col.key as any, {
          id: key,
          header: col.header,
          cell: (info: any) => {
            const value = info.getValue();
            const row = info.row.original;

            // Handle clickable cells (green link to customer details)
            if (col.clickable) {
              return (
                <span
                  className="text-green-600   underline  hover:text-green-700 font-bold hover:underline cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/customerDetails/customerLoanHistory`)
                  }
                >
                  {col.render ? col.render(value as T[keyof T], row) : value}
                </span>
              );
            }

            return col.render ? col.render(value as T[keyof T], row) : value;
          },
          enableSorting: col.sortable !== false,
          size: columnWidths[key],
          minSize: col.minWidth || 80,
          maxSize: col.maxWidth || 400,
        });
      }),
    );

    // Add actions column
    if (actions) {
      const actionCol = helper.display({
        id: "actions",
        header: actions.header || "Actions",
        size: actions.width ? parseInt(actions.width) : 100,
        meta: {
          sticky: stickyActions,
        },
        cell: (info: any) => {
          const row = info.row.original;
          const actionItems =
            typeof actions.items === "function"
              ? actions.items(row)
              : actions.items;

          // Default actions if none provided
          const defaultActions: ActionDef<T>[] = [
            {
              icon: <IoCall className="h-4 w-4" />,
              label: "Call",
              onClick: (row) => console.log("Call", row),
            },
            {
              icon: <IoEye className="h-4 w-4" />,
              label: "View",
              onClick: (row) => console.log("View", row),
            },
            {
              icon: <IoCopy className="h-4 w-4" />,
              label: "Copy",
              onClick: (row) => console.log("Copy", row),
            },
          ];

          const finalActions =
            actionItems.length > 0 ? actionItems : defaultActions;

          return (
            <div className="flex items-center justify-center gap-2">
              {finalActions.map(
                (
                  action: {
                    hide: (arg0: any) => any;
                    onClick: (arg0: any) => void;
                    label: string | undefined;
                    icon:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | null
                      | undefined;
                  },
                  idx: Key | null | undefined,
                ) => {
                  if (action.hide && action.hide(row)) return null;

                  // Clone icon and add shake-icon class for animation
                  const iconWithClass = isValidElement(action.icon)
                    ? cloneElement(action.icon as ReactElement<any>, {
                        className:
                          `${(action.icon as ReactElement<any>).props?.className || ""} shake-icon`.trim(),
                      })
                    : action.icon;

                  // Get color classes based on action label - distinct contrasting colors
                  const getActionColorClasses = (label: string | undefined) => {
                    switch (label?.toLowerCase()) {
                      case "call":
                        return "text-green-600 hover:bg-green-50 hover:text-green-700"; // Green - call/contact
                      case "view":
                        return "text-blue-600 hover:bg-blue-50 hover:text-blue-700"; // Blue - view/info
                      case "copy":
                        return "text-rose-600 hover:bg-rose-50 hover:text-rose-700"; // Rose - copy action
                      default:
                        return "text-gray-500 hover:bg-gray-50 hover:text-gray-600";
                    }
                  };

                  return (
                    <button
                      key={idx}
                      onClick={() => action.onClick(row)}
                      className={`group inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${getActionColorClasses(action.label)}`}
                      title={action.label}
                      aria-label={action.label}
                    >
                      {iconWithClass}
                    </button>
                  );
                },
              )}
            </div>
          );
        },
      });

      return [...cols, actionCol];
    }

    return cols;
  }, [columns, actions, columnWidths, enableRowSelection, stickyActions]);
}
