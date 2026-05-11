import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function StaticPageLayout({ children }: { children: ReactNode }) {
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
        <article className="wrapper max-w-2xl py-12 md:py-16">{children}</article>
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
