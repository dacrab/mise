import { convexQuery } from "@convex-dev/react-query";
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
  return (
    <>
      <Header />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}
