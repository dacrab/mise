import { useEffect, useRef } from "react";

export function useDismissableLayer<T extends HTMLElement>(
  open: boolean,
  onDismiss: () => void,
  { closeOnEscape = true }: { closeOnEscape?: boolean } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, onDismiss, open]);

  return ref;
}
