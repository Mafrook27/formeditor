// ============================================================================
// MODAL - BARREL EXPORT
// ============================================================================

// Main Modal component
export { Modal } from "./components/Modal";

// Pre-built variants
export { ConfirmModal } from "./components/ConfirmModal";

// Footer helpers
export { ModalFooterActions } from "./components/ModalFooterActions";

// Loading spinner (internal, but exported for custom footers)
export { LoadingSpinner } from "./components/LoadingSpinner";

// Hook
export { useModal } from "./useModal";

// Types
export type {
  ModalProps,
  ModalFooterActionsProps,
  ConfirmModalProps,
  UseModalReturn,
} from "./types";

// Re-export DialogClose for custom close buttons
export { DialogClose as ModalClose } from "@/shared/components/ui/dialog";
