import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <>
      <Header variant="dashboard" />
      <main className="pt-20 min-h-screen">
        <Dashboard />
      </main>
      <Footer />
    </>
  );
}
