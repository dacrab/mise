import { Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";

function Footer() {
  return (
    <footer className="border-t border-cream-dark bg-warm-white mt-auto">
      <div className="wrapper py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-serif text-xl font-semibold text-charcoal">mise</span>
            <p className="text-sm text-stone mt-2 max-w-xs">A place for home cooks to share recipes made with love.</p>
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
  );
}

export function PageLayout({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <Header />
      <main className={`pt-20 pb-24 ${className}`}>{children}</main>
      <Footer />
    </>
  );
}

export function ErrorPage({
  title,
  message,
  showHomeLink = true,
}: {
  title: string;
  message?: string;
  showHomeLink?: boolean;
}) {
  return (
    <div className="center min-h-screen bg-cream p-8 text-center">
      <div>
        <h1 className="font-serif text-4xl font-medium text-charcoal mb-4">{title}</h1>
        {message && <p className="text-stone mb-6">{message}</p>}
        {showHomeLink && (
          <Link to="/" className="btn-primary">
            Back to recipes
          </Link>
        )}
      </div>
    </div>
  );
}
