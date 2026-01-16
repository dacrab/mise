import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = useQuery(api.users.currentUser);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-stone animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user === null) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
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
