import { useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";

/**
 * Double-tap confirmation pattern.
 * First call shows a toast and arms the confirm state.
 * Second call (within `timeout` ms) executes the action.
 */
export function useConfirmAction<T>(
  action: (arg: T) => Promise<void>,
  {
    confirmMessage = "Tap again to confirm",
    timeout = 3000,
    onSuccess,
    successMessage,
    errorMessage = "Action failed",
  }: {
    confirmMessage?: string;
    timeout?: number;
    onSuccess?: () => void;
    successMessage?: string;
    errorMessage?: string;
  } = {}
) {
  const [pendingId, setPendingId] = useState<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const trigger = async (id: T) => {
    if (pendingId !== id) {
      setPendingId(id);
      toast(confirmMessage, "info");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPendingId(null), timeout);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setPendingId(null);
    try {
      await action(id);
      if (successMessage) toast(successMessage, "success");
      onSuccess?.();
    } catch {
      toast(errorMessage, "error");
    }
  };

  return { trigger, pendingId };
}
