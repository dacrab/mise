import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Spinner } from "@/components/ui/Primitives";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useUser();
  const location = useRouterState({ select: (s) => s.location });

  if (!isLoaded) {
    return (
      <div className="center min-h-screen">
        <Spinner className="w-8 h-8 text-sage" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" search={{ redirect: location.pathname + location.search }} replace />;
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
