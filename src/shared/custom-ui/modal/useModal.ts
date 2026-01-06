import * as React from "react";
import type { UseModalReturn } from "./types";

/**
 * Hook for managing modal state
 *
 * @example
 * ```tsx
 * const modal = useModal();
 *
 * return (
 *   <>
 *     <button onClick={modal.open}>Open Modal</button>
 *     <Modal open={modal.isOpen} onOpenChange={modal.setOpen}>
 *       Content
 *     </Modal>
 *   </>
 * );
 * ```
 */
export function useModal(defaultOpen = false): UseModalReturn {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen: setIsOpen,
  };
}
