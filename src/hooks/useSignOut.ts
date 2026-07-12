import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";

export function useSignOut() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  return async () => {
    await signOut();
    void navigate({ to: "/", replace: true });
  };
}
