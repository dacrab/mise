import { Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeLink } from "@/components/layout/HomeLink";

export function PageLayout({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <Header />
      <main className={`pt-20 pb-24 animate-fade-in ${className}`}>{children}</main>
      <Footer />
    </>
  );
}

export function SimpleLayout({ children, backTo = "/", backLabel = "← Back" }: {
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

export function AuthLayout({ children, variant, tagline, subtitle }: {
  children: React.ReactNode;
  variant: "login" | "signup";
  tagline: string;
  subtitle: string;
}) {
  const bgColor = variant === "login" ? "bg-charcoal" : "bg-sage";
  const textColor = variant === "login" ? "text-cream" : "text-warm-white";
  const taglineColor = variant === "login" ? "text-sage-light" : "text-cream";
  const subtitleColor = variant === "login" ? "text-stone-light" : "text-cream/80";
  const yearColor = variant === "login" ? "text-stone" : "text-cream/60";

  return (
    <div className="min-h-screen flex">
      <div className={`hidden lg:flex lg:w-1/2 ${bgColor} p-12 flex-col justify-between`}>
        <HomeLink className={`font-serif text-2xl font-semibold ${textColor}`}>mise</HomeLink>
        <div>
          <p className={`font-hand text-3xl ${taglineColor} mb-4`}>{tagline}</p>
          <p className={`${subtitleColor} text-lg max-w-md`}>{subtitle}</p>
        </div>
        <p className={`${yearColor} text-sm`}>© {new Date().getFullYear()} mise</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <HomeLink className="lg:hidden font-serif text-2xl font-semibold text-charcoal block mb-8">mise</HomeLink>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ErrorPage({ title, message, showHomeLink = true }: {
  title: string;
  message?: string;
  showHomeLink?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-8 text-center">
      <div>
        <h1 className="font-serif text-4xl font-medium text-charcoal mb-4">{title}</h1>
        {message && <p className="text-stone mb-6">{message}</p>}
        {showHomeLink && <HomeLink className="btn-primary">Back to recipes</HomeLink>}
      </div>
    </div>
  );
}
