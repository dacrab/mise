import { useClerk } from "@clerk/tanstack-react-start";

export function useSignOut() {
  const { signOut } = useClerk();
  return async () => {
    await signOut({ redirectUrl: "/" });
  };
}
