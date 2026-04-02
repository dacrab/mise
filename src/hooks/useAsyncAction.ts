import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

type AsyncFunction = (...args: never[]) => Promise<unknown>;

interface AsyncActionOptions<T extends AsyncFunction> {
  onSuccess?: (result: Awaited<ReturnType<T>>) => void;
  onError?: (error: Error) => void;
  onErrorMessage?: (message: string, error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  getErrorMessage?: (error: Error) => string;
}

/**
 * Generic async action wrapper.
 * - Tracks pending state
 * - Toasts on success/error
 * - Keeps action + options in refs so the execute callback is stable
 *   and won't trigger re-render loops when the action function changes identity each render.
 */
export function useAsyncAction<T extends AsyncFunction>(action: T, options?: AsyncActionOptions<T>) {
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
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error("An error occurred");
        const opts = optionsRef.current;
        const message = opts?.getErrorMessage?.(normalizedError) ?? opts?.errorMessage ?? normalizedError.message;
        toast(message, "error");
        opts?.onError?.(normalizedError);
        opts?.onErrorMessage?.(message, normalizedError);
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
