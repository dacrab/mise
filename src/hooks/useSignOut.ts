import { useClerk } from "@clerk/tanstack-react-start";
import { useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

export function useSignOut() {
  const { signOut } = useClerk();
  const { toast } = useToast();

  return useCallback(
    async (redirectUrl = "/") => {
      try {
        await signOut({ redirectUrl });
      } catch {
        toast("Could not sign out", "error");
      }
    },
    [signOut, toast],
  );
}
