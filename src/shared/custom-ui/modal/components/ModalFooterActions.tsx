// 1️⃣ IMPORTS
"use client";

import { DialogClose } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import type { ModalFooterActionsProps } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";

// 2️⃣ COMPONENT DECLARATION
/**
 * Pre-built footer actions for Modal
 *
 * Standard confirm/cancel pattern with loading state support
 */
export function ModalFooterActions({
  primaryText = "Confirm",
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryText = "Cancel",
  onSecondary,
  secondaryDisabled = false,
  className,
}: ModalFooterActionsProps) {
  // 3️⃣ JSX RETURN
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DialogClose asChild>
        <button
          type="button"
          onClick={onSecondary}
          disabled={secondaryDisabled || primaryLoading}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "text-gray-700 bg-white border border-gray-300",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {secondaryText}
        </button>
      </DialogClose>

      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled || primaryLoading}
        className={cn(
          "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
          "text-white bg-blue-600",
          "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {primaryLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {primaryText}
      </button>
    </div>
  );
}
