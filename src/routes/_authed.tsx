import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_authed")({
  // Prefetch auth state on the server / before rendering the layout
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(convexQuery(api.users.currentUser, {}));
    if (!user) throw redirect({ to: "/login", replace: true });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  // Data is guaranteed to exist (loader throws redirect if null)
  const { data: user } = useSuspenseQuery(convexQuery(api.users.currentUser, {}));

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}
