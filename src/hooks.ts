import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";

type AsyncFunction = (...args: never[]) => Promise<unknown>;

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

  // Keep latest action + options in a ref so the execute callback never
  // needs to be recreated when they change, avoiding infinite re-render loops
  // that would occur if `action` (a new function reference each render) were
  // listed as a dependency of useCallback.
  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      if (isPending) return undefined;
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
        toast(opts?.errorMessage || error.message, "error");
        opts?.onError?.(error);
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [isPending, toast] // intentionally omit action/options — they live in refs
  );

  return { execute, isPending };
}
