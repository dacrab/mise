import { Link } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Standard page layout with Header + main + Footer
export function PageLayout({ children, headerVariant = "default", backLink }: {
  children: React.ReactNode;
  headerVariant?: "default" | "dashboard" | "minimal";
  backLink?: { href: string; label: string };
}) {
  return (
    <>
      <Header variant={headerVariant} backLink={backLink} />
      <main className="pt-20 pb-24">{children}</main>
      <Footer />
    </>
  );
}

// Auth page layout (login/signup)
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
        <p className={`${yearColor} text-sm`}>© 2026 mise</p>
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

// Home link with search params
export function HomeLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link to="/" search={{ q: "", category: "" }} className={className}>
      {children}
    </Link>
  );
}

// Error page component
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
