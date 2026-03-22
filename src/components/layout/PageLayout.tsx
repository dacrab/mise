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
      <main className={`pt-20 pb-24 animate-fade-in ${className}`}>{children}</main>
      <Footer />
    </>
  );
}

export function SimpleLayout({
  children,
  backTo = "/",
  backLabel = "← Back",
}: {
  children: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cream-dark/50">
        <div className="wrapper h-16 flex items-center">
          <Link to={backTo} className="text-sm text-stone hover:text-charcoal transition-colors">
            {backLabel}
          </Link>
        </div>
      </header>
      <main className="pt-20 pb-24 animate-fade-in">{children}</main>
      <Footer />
    </>
  );
}

export function AuthLayout({
  children,
  variant,
  tagline,
  subtitle,
}: {
  children: React.ReactNode;
  variant: "login" | "signup";
  tagline: string;
  subtitle: string;
}) {
  const colors = {
    login: { bg: "bg-charcoal", text: "text-cream", tagline: "text-sage-light", subtitle: "text-stone-light", year: "text-stone" },
    signup: { bg: "bg-sage", text: "text-warm-white", tagline: "text-cream", subtitle: "text-cream/80", year: "text-cream/60" },
  }[variant];

  return (
    <div className="min-h-screen flex">
      <div className={`hidden lg:flex lg:w-1/2 ${colors.bg} p-12 flex-col justify-between`}>
        <Link to="/" className={`font-serif text-2xl font-semibold ${colors.text}`}>
          mise
        </Link>
        <div>
          <p className={`font-hand text-3xl ${colors.tagline} mb-4`}>{tagline}</p>
          <p className={`${colors.subtitle} text-lg max-w-md`}>{subtitle}</p>
        </div>
        <p className={`${colors.year} text-sm`}>© {new Date().getFullYear()} mise</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-charcoal block mb-8">
            mise
          </Link>
          {children}
        </div>
      </div>
    </div>
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
    <div className="min-h-screen flex items-center justify-center bg-cream p-8 text-center">
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
