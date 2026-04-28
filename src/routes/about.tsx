import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Mise — a place for home cooks to share recipes." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cream-dark/50">
        <div className="wrapper h-16 flex items-center">
          <Link to="/" className="link-muted">
            ← Back
          </Link>
        </div>
      </header>
      <main className="pt-20 pb-24">
        <article className="wrapper max-w-2xl py-12 md:py-16">
          <h1 className="font-serif text-4xl font-medium mb-4">A place for home cooks</h1>
          <p className="font-hand text-xl text-sage mb-3">our story</p>
          <p className="body-large mb-12">
            Mise is a platform born from the love of home cooking and the desire to share culinary secrets with a
            global community.
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
              Our mission is simple: provide a beautiful, fast, and secure space for cooks of all levels to document
              their creations and discover new tastes.
            </p>
            <p>
              No algorithms pushing viral content. No ads interrupting your flow. Just good food, shared with
              intention.
            </p>
          </div>
        </article>
      </main>
      <footer className="border-t border-cream-dark bg-warm-white mt-auto">
        <div className="wrapper py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="font-serif text-xl font-semibold text-charcoal">mise</span>
              <p className="text-sm text-stone mt-2 max-w-xs">
                A place for home cooks to share recipes made with love.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/about" className="text-stone hover:text-charcoal transition-colors">
                About
              </Link>
              <Link to="/privacy" className="text-stone hover:text-charcoal transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-stone hover:text-charcoal transition-colors">
                Terms
              </Link>
              <a href="https://github.com/dacrab/mise" className="text-stone hover:text-charcoal transition-colors">
                GitHub
              </a>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-cream-dark">
            <p className="text-xs text-stone-light">© {new Date().getFullYear()} mise. Made with care.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
