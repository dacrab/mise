import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About", "Mise — a quiet recipe journal for home cooks."),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageLayout>
      <article className="container-prose py-16 md:py-24">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
          A place for home cooks to keep what matters.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          Mise is a recipe journal for the food you actually make — the weeknight dinners, the slow Sunday projects, and
          the dishes you want to remember.
        </p>

        <figure className="mt-12">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface-2">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745a3002?q=80&w=2070&auto=format&fit=crop"
              className="size-full object-cover"
              alt="A home cook preparing a meal"
              loading="lazy"
            />
          </div>
          <figcaption className="mt-3 text-xs text-muted">
            Cooking is a practice. A recipe is how we pass it on.
          </figcaption>
        </figure>

        <div className="prose-editorial mt-12">
          <p>
            Our mission is simple: give cooks of every level a beautiful, fast, and private place to document their
            creations and discover what other people are making at home.
          </p>
          <p>
            No algorithms pushing viral content. No ads interrupting the process. No pressure to perform. Just good
            food, written down carefully and shared with intention.
          </p>
          <h2>What we believe</h2>
          <ul>
            <li>Recipes are working documents, not performances.</li>
            <li>The best cooking happens when you can find what you saved.</li>
            <li>A quiet interface is a feature, not a lack of ambition.</li>
          </ul>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
          <Link to="/dashboard/create" className="btn-primary">
            Share a recipe
          </Link>
          <Link to="/" className="btn-secondary">
            Browse the journal
          </Link>
        </div>
      </article>
    </PageLayout>
  );
}
