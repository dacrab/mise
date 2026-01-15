import { useState, useCallback } from "react";
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

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      if (isPending) return undefined;
      setIsPending(true);
      try {
        const result = await (action as (...args: Parameters<T>) => Promise<unknown>)(...args);
        if (options?.successMessage) toast(options.successMessage, "success");
        options?.onSuccess?.(result as Awaited<ReturnType<T>>);
        return result as Awaited<ReturnType<T>>;
      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred");
        toast(options?.errorMessage || error.message, "error");
        options?.onError?.(error);
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [action, isPending, options, toast]
  );

  return { execute, isPending };
}
