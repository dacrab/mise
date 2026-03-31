import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

type AsyncFunction = (...args: never[]) => Promise<unknown>;

/**
 * Generic async action wrapper.
 * - Tracks pending state
 * - Toasts on success/error
 * - Keeps action + options in refs so the execute callback is stable
 *   and won't trigger re-render loops when the action function changes identity each render.
 */
export function useAsyncAction<T extends AsyncFunction>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const isPendingRef = useRef(false);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      if (isPendingRef.current) return undefined;
      isPendingRef.current = true;
      setIsPending(true);
      try {
        const result = await (actionRef.current as (...args: Parameters<T>) => Promise<unknown>)(...args);
        const opts = optionsRef.current;
        if (opts?.successMessage) toast(opts.successMessage, "success");
        opts?.onSuccess?.(result as Awaited<ReturnType<T>>);
        return result as Awaited<ReturnType<T>>;
      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred");
        const opts = optionsRef.current;
        toast(opts?.errorMessage ?? error.message, "error");
        opts?.onError?.(error);
        return undefined;
      } finally {
        isPendingRef.current = false;
        setIsPending(false);
      }
    },
    [toast]
  );

  return { execute, isPending };
}
