import { Link } from "@tanstack/react-router";

interface HeaderProps {
  variant?: "default" | "dashboard" | "minimal";
  backLink?: { href: string; label: string };
}

export function Header({ variant = "default", backLink }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 glass">
      <div className="wrapper h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-serif text-2xl font-semibold tracking-tight text-charcoal group-hover:text-sage transition-colors">
            mise
          </span>
          {variant === "dashboard" && (
            <span className="text-[10px] font-semibold bg-sage/15 text-sage px-2 py-0.5 rounded-full uppercase tracking-wide">
              Kitchen
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-2">
          {variant === "default" && !backLink && (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden sm:flex">
                Sign in
              </Link>
              <Link to="/dashboard/create" className="btn-primary text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Recipe
              </Link>
            </>
          )}

          {(variant === "minimal" || backLink) && (
            <Link to={backLink?.href ?? "/"} className="btn-ghost text-sm flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {backLink?.label ?? "Back"}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
