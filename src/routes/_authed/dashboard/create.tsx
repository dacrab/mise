import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecipeEditor } from "@/components/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/create")({
  component: () => (
    <>
      <Header variant="dashboard" backLink={{ href: "/dashboard", label: "Dashboard" }} />
      <main className="pt-20 min-h-screen"><RecipeEditor /></main>
      <Footer />
    </>
  ),
});
