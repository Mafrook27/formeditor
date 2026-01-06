import * as React from "react";

// ============================================================================
// MODAL TYPES
// ============================================================================

export interface ModalProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Modal title (optional) */
  title?: React.ReactNode;
  /** Modal description (optional) */
  description?: React.ReactNode;
  /** Modal content - any JSX (cards, forms, tables, iframes, etc.) */
  children?: React.ReactNode;
  /** Footer content - typically action buttons (optional) */
  footer?: React.ReactNode;

  /** Trigger element (optional) - uses asChild pattern */
  trigger?: React.ReactNode;

  /** Maximum width - defaults to 95vw, accepts any CSS value */
  maxWidth?: string;
  /** Maximum height - defaults to 85vh, accepts any CSS value */
  maxHeight?: string;

  /** Close on ESC key press - defaults to true */
  closeOnEsc?: boolean;
  /** Close on outside/backdrop click - defaults to true */
  closeOnOutside?: boolean;
  /** Prevent all close actions (for loading states, confirmations) */
  preventClose?: boolean;
  /** Loading state - prevents close when true */
  loading?: boolean;

  /** Show close button in header - defaults to true */
  showCloseButton?: boolean;

  /** Additional className for the modal content */
  className?: string;
  /** Additional className for the header */
  headerClassName?: string;
  /** Additional className for the body/content area */
  bodyClassName?: string;
  /** Additional className for the footer */
  footerClassName?: string;
}

// ============================================================================
// MODAL FOOTER ACTIONS TYPES
// ============================================================================

export interface ModalFooterActionsProps {
  /** Primary action button text */
  primaryText?: string;
  /** Primary action callback */
  onPrimary?: () => void;
  /** Primary button disabled state */
  primaryDisabled?: boolean;
  /** Primary button loading state */
  primaryLoading?: boolean;

  /** Secondary/Cancel action button text */
  secondaryText?: string;
  /** Secondary action callback - if not provided, closes modal */
  onSecondary?: () => void;
  /** Secondary button disabled state */
  secondaryDisabled?: boolean;

  /** Additional className */
  className?: string;
}

// ============================================================================
// CONFIRM MODAL TYPES
// ============================================================================

export interface ConfirmModalProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Modal title */
  title?: string;
  /** Modal description/message */
  description?: string;
  /** Additional content */
  children?: React.ReactNode;

  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;

  /** Confirm callback */
  onConfirm?: () => void | Promise<void>;
  /** Cancel callback */
  onCancel?: () => void;

  /** Variant for styling */
  variant?: "default" | "danger";

  /** Loading state */
  loading?: boolean;

  /** Trigger element */
  trigger?: React.ReactNode;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}
