import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy${APP_TITLE_SUFFIX}` },
      { name: "description", content: "How Mise handles your personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <h1 className="font-serif text-4xl font-medium mb-4">Privacy Policy</h1>
          <p className="text-stone mb-8">We respect your privacy and are committed to protecting your personal data.</p>
          <div className="space-y-10 text-charcoal-light leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly when you create an account, such as your name and email
                address.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide, maintain, and improve our services, including personalizing your
                experience and managing your recipe collection.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">3. Data Storage</h2>
              <p>Your data is stored securely using Convex, a real-time backend platform with built-in file storage.</p>
            </section>
          </div>
          <footer className="mt-16 pt-6 border-t border-cream-dark text-sm text-stone">
            Last updated: January 2026
          </footer>
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
