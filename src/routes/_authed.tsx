import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Navigate, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { fetchViewerId } from "@/lib/auth-server";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const userId = await fetchViewerId();
    if (!userId) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useUser();
  const href = useRouterState({ select: (state) => state.location.href });

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/login" search={{ redirect: href }} replace />;
  }

  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}
