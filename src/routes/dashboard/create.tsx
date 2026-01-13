import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecipeEditor } from "@/components/RecipeEditor";

export const Route = createFileRoute("/dashboard/create")({
  component: CreateRecipePage,
});

function CreateRecipePage() {
  return (
    <>
      <Header variant="dashboard" backLink={{ href: "/dashboard", label: "Dashboard" }} />
      <main className="pt-20 min-h-screen">
        <RecipeEditor />
      </main>
      <Footer />
    </>
  );
}
