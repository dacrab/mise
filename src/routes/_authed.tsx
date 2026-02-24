import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Header } from "@/components/ui/Layout";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    // Server-side: Convex auth is client-only, so we can't gate here yet.
    // The component-level guard handles the redirect on the client.
    // This hook is reserved for future SSR token validation.
  },
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
