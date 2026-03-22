import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/ui/StaticPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Mise" },
      { name: "description", content: "Mise — a place for home cooks to share recipes." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <StaticPage title="A place for home cooks">
      <p className="font-hand text-xl text-sage mb-3">our story</p>
      <p className="body-large mb-12">
        Mise is a platform born from the love of home cooking and the desire to share culinary secrets with a global
        community.
      </p>

      <div className="aspect-video rounded-xl bg-cream-dark overflow-hidden mb-12">
        <img
          src="https://images.unsplash.com/photo-1556910103-1c02745a3002?q=80&w=2070&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="Cooking"
          loading="lazy"
        />
      </div>

      <div className="space-y-4 text-charcoal-light leading-relaxed">
        <p>
          Our mission is simple: provide a beautiful, fast, and secure space for cooks of all levels to document their
          creations and discover new tastes.
        </p>
        <p>
          No algorithms pushing viral content. No ads interrupting your flow. Just good food, shared with intention.
        </p>
      </div>
    </StaticPage>
  );
}
