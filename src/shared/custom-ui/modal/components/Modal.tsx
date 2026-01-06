// 1️⃣ IMPORTS
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import type { ModalProps } from "../types";

// 2️⃣ TYPE DEFINITIONS - In ../types

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * Modern SaaS Modal Component
 *
 * Clean, accessible, and optimized for all use cases:
 * - Forms, tables, confirmations, wizards
 * - Auto-adaptive sizing with viewport caps
 * - Controlled close behavior
 */
export function Modal({
  // State
  open,
  defaultOpen,
  onOpenChange,

  // Content
  title,
  description,
  children,
  footer,
  trigger,

  // Sizing
  maxWidth = "480px",
  maxHeight = "85vh",

  // Behavior
  closeOnEsc = true,
  closeOnOutside = true,
  preventClose = false,
  loading = false,
  showCloseButton = true,

  // Styling
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: ModalProps) {
  // 5️⃣ DERIVED VALUES
  const isLocked = preventClose || loading;
  const hasHeader = !!(title || description);
  const hasBody = !!children;
  const hasFooter = !!footer;

  // 6️⃣ HANDLERS
  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!value && isLocked) return;
      onOpenChange?.(value);
    },
    [onOpenChange, isLocked],
  );

  const handleEscapeKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!closeOnEsc || isLocked) e.preventDefault();
    },
    [closeOnEsc, isLocked],
  );

  const handlePointerDownOutside = React.useCallback(
    (e: CustomEvent) => {
      if (!closeOnOutside || isLocked) e.preventDefault();
    },
    [closeOnOutside, isLocked],
  );

  // 7️⃣ JSX RETURN
  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-0 overflow-hidden",
          "!max-w-none !w-auto", // Override shadcn defaults
          className,
        )}
        style={{
          maxWidth,
          maxHeight,
          minWidth: "320px",
        }}
        showCloseButton={false}
        onEscapeKeyDown={handleEscapeKeyDown}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handlePointerDownOutside}
      >
        {/* Header */}
        {(hasHeader || showCloseButton) && (
          <div
            className={cn(
              "flex items-start gap-3 px-5 pt-5",
              hasBody || hasFooter ? "pb-4" : "pb-5",
              headerClassName,
            )}
          >
            {hasHeader && (
              <DialogHeader className="flex-1 space-y-1 text-left">
                {title && (
                  <DialogTitle className="text-lg font-semibold text-gray-900 leading-6">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <DialogDescription className="text-sm text-gray-500 leading-5">
                    {description}
                  </DialogDescription>
                )}
              </DialogHeader>
            )}

            {showCloseButton && (
              <DialogClose
                disabled={isLocked}
                className={cn(
                  "shrink-0 rounded-md p-1.5 text-gray-400 transition-colors",
                  "hover:bg-gray-100 hover:text-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-gray-200",
                  "disabled:pointer-events-none disabled:opacity-40",
                  !hasHeader && "ml-auto",
                )}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            )}
          </div>
        )}

        {/* Body */}
        {hasBody && (
          <div
            className={cn(
              "flex-1 overflow-y-auto px-5",
              !hasFooter && "pb-5",
              // Modern thin scrollbar
              "[&::-webkit-scrollbar]:w-1",
              "[&::-webkit-scrollbar-thumb]:bg-gray-200",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "hover:[&::-webkit-scrollbar-thumb]:bg-gray-300",
              bodyClassName,
            )}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#e5e7eb transparent",
            }}
          >
            {children}
          </div>
        )}

        {/* Footer */}
        {hasFooter && (
          <div
            className={cn(
              "flex items-center justify-end gap-2 px-5 py-4",
              "border-t border-gray-100 bg-gray-50/50",
              footerClassName,
            )}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
