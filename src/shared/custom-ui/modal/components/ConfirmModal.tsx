// 1️⃣ IMPORTS
"use client";

import { cn } from "@/shared/lib/utils";
import type { ConfirmModalProps } from "../types";
import { Modal } from "./Modal";
import { LoadingSpinner } from "./LoadingSpinner";

// 2️⃣ TYPE DEFINITIONS - In ../types

// 3️⃣ CONSTANTS - None

// 4️⃣ COMPONENT DECLARATION
/**
 * Confirmation Modal - Clean SaaS style
 *
 * For delete confirmations, dangerous actions, or simple yes/no prompts
 */
export function ConfirmModal({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  loading = false,
  trigger,
}: ConfirmModalProps) {
  // 5️⃣ STATE - None

  // 6️⃣ REFS - None

  // 7️⃣ CUSTOM HOOKS - None

  // 8️⃣ DERIVED VALUES
  const isDanger = variant === "danger";

  // 9️⃣ EFFECTS - None

  // 🔟 HANDLERS
  const handleConfirm = async () => {
    await onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  // 1️⃣1️⃣ JSX RETURN
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      trigger={trigger}
      maxWidth="400px"
      preventClose={loading}
      loading={loading}
      footer={
        <>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-gray-700 bg-white border border-gray-300",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isDanger
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
            )}
          >
            {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
            {confirmText}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
