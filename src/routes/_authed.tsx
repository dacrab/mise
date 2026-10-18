import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { PageLoader } from "@/components/ui/Primitives";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useUser();
  const href = useRouterState({ select: (s) => s.location.href });

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" search={{ redirect: href }} replace />;
  }

  return (
    <>
      <Header />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
}
