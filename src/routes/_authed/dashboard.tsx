import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Layout route for /dashboard/* - provides shared Header/Footer
export const Route = createFileRoute("/_authed/dashboard")({
  component: () => (
    <>
      <Header variant="dashboard" />
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  ),
});
