import { createFileRoute, Outlet } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = useQuery(api.users.currentUser);
  const navigate = Route.useNavigate();

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-stone animate-pulse">Loading…</div>
      </div>
    );
  }

  if (user === null) {
    // Use router navigation instead of window.location so history is preserved
    void navigate({ to: "/login", replace: true });
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
