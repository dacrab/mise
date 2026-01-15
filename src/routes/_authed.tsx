import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location, context }) => {
    const user = context.queryClient.getQueryData(["convexQuery", "users:currentUser", {}]);
    // Fix: Check for falsy (null OR undefined) - undefined means loading/not cached
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
