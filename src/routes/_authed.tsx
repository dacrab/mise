import { useConvexAuth } from "convex/react";
import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Spinner } from "@/components/ui/Primitives";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const location = useRouterState({ select: (s) => s.location });

  if (isLoading) {
    return (
      <div className="center min-h-screen">
        <Spinner className="w-8 h-8 text-sage" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.href }} replace />;
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
