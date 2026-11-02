import { Link } from "@tanstack/react-router";
import { FOOTER_LINKS } from "@/lib/constants";

const EXPLORE_LINKS = [
  { to: "/", label: "Browse recipes" },
  { to: "/about", label: "About Mise" },
  { to: "/dashboard", label: "Your kitchen" },
] as const;

const LEGAL_LINKS = FOOTER_LINKS.filter((link) => link.to !== "/about");

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
              Mise
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              A quiet corner of the internet for the recipes you actually make.
            </p>
            <a
              href="https://github.com/dacrab/mise"
              className="link-muted mt-5 inline-flex items-center gap-1.5"
              target="_blank"
              rel="noreferrer"
            >
              View the source <span aria-hidden="true">↗</span>
            </a>
          </div>

          <nav aria-label="Explore">
            <h2 className="eyebrow">Explore</h2>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-muted">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="eyebrow">Legal</h2>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-muted">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Mise. Made for home cooks.</p>
          <p>No ads. No algorithms. Just recipes.</p>
        </div>
      </div>
    </footer>
  );
}
