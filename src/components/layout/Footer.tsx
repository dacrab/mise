import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-subtle bg-warm-white dark:bg-d-surface mt-auto">
      <div className="wrapper py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-serif text-xl font-semibold text-primary">mise</span>
            <p className="text-sm text-stone mt-2 max-w-xs">A place for home cooks to share recipes made with love.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/about" className="text-stone hover:text-charcoal dark:hover:text-d-text transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-stone hover:text-charcoal dark:hover:text-d-text transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-stone hover:text-charcoal dark:hover:text-d-text transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/dacrab/mise"
              className="text-stone hover:text-charcoal dark:hover:text-d-text transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-subtle">
          <p className="text-xs text-stone-light">&copy; {new Date().getFullYear()} mise. Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
