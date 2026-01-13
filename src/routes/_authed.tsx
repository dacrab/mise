import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location, context }) => {
    // Check auth via query client - Convex handles actual auth server-side
    // This is a client-side guard; Convex mutations/queries enforce real auth
    const user = context.queryClient.getQueryData(["convexQuery", "users:currentUser", {}]);
    if (user === null) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
