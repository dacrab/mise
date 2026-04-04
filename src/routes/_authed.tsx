import { useConvexAuth } from "convex/react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Spinner } from "@/components/ui/Primitives";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8 text-sage" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
