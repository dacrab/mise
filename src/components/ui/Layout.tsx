import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback } from "react";
import { api } from "convex/_generated/api";
import { NotificationBell } from "@/components/social/Notifications";
import { Menu } from "@base-ui-components/react/menu";
import { HomeIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    await router.navigate({ to: "/", replace: true });
  }, [signOut, router]);

  return (
    <header className="fixed top-0 w-full z-50 glass">
      <div className="wrapper h-16 flex items-center justify-between">
        <HomeLink className="font-serif text-2xl font-semibold tracking-tight text-charcoal hover:text-sage transition-colors">mise</HomeLink>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Menu.Root>
                <Menu.Trigger className="btn-ghost text-sm flex items-center gap-2">
                  {user.profileImageUrl || user.image
                    ? <img src={user.profileImageUrl || user.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                    : <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xs font-medium">{user.name?.charAt(0).toUpperCase() ?? "?"}</div>
                  }
                  <span className="hidden sm:inline">{user.name?.split(" ")[0] ?? "Menu"}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner className="z-50" sideOffset={8} align="end">
                    <Menu.Popup className="min-w-[180px] bg-warm-white rounded-lg shadow-card border border-cream-dark py-1">
                      <Menu.Item className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark" render={<Link to="/dashboard" />}>
                        <HomeIcon className="w-4 h-4" /> Dashboard
                      </Menu.Item>
                      <Menu.Item className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark" render={<Link to="/settings" />}>
                        <Cog6ToothIcon className="w-4 h-4" /> Settings
                      </Menu.Item>
                      <Menu.Separator className="h-px bg-cream-dark my-1" />
                      <Menu.Item onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm text-terracotta hover:bg-cream-dark outline-none cursor-pointer data-[highlighted]:bg-cream-dark">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign out
                      </Menu.Item>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </>
          ) : user === null ? (
            <Link to="/login" className="btn-ghost text-sm hidden sm:flex">Sign in</Link>
          ) : null}
          <Link to="/dashboard/create" className="btn-primary text-sm">
            <PlusIcon className="w-4 h-4" /> New Recipe
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

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
            <Link to="/about" className="text-stone hover:text-charcoal transition-colors">About</Link>
            <Link to="/privacy" className="text-stone hover:text-charcoal transition-colors">Privacy</Link>
            <Link to="/terms" className="text-stone hover:text-charcoal transition-colors">Terms</Link>
            <a href="https://github.com/dacrab/mise" className="text-stone hover:text-charcoal transition-colors">GitHub</a>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-cream-dark">
          <p className="text-xs text-stone-light">© {new Date().getFullYear()} mise. Made with care.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isPending?: boolean;
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

export function ActionButton({ onClick, isActive = false, isPending = false, activeClass = "bg-sage/10 border-sage/30 text-sage", inactiveClass = "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage", children, ariaLabel, disabled = false }: ActionButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled || isPending} aria-label={ariaLabel} aria-pressed={isActive}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}

// ─── Layouts ──────────────────────────────────────────────────────────────────

// Standard page layout with Header + main + Footer
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20 pb-24">{children}</main>
      <Footer />
    </>
  );
}

// Simple layout for legal/info pages — minimal header with a back link + footer
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

// Home link without search params
export function HomeLink({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link to="/" className={className}>
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
