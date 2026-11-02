import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const AUTH_IMAGE = "https://images.unsplash.com/photo-1556910103-1c02745a3002?q=80&w=1600&auto=format&fit=crop";

export function AuthLayout({
  children,
  heroHeading,
  heroDescription,
}: {
  children: ReactNode;
  heroHeading: string;
  heroDescription: string;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_0.95fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
            Mise
          </Link>
          <Link to="/" className="link-muted hidden sm:inline">
            Back to recipes
          </Link>
        </div>

        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>

        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Mise. Made for home cooks.</p>
      </div>

      <div className="relative hidden overflow-hidden bg-surface-2 lg:block">
        <img src={AUTH_IMAGE} alt="" className="absolute inset-0 size-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="absolute inset-6 rounded-2xl border border-white/10" aria-hidden="true" />
        <div className="absolute inset-x-14 bottom-14 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">Mise en place</p>
          <p className="mt-3 max-w-md font-display text-4xl font-medium leading-[1.05] text-balance">{heroHeading}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{heroDescription}</p>
        </div>
      </div>
    </div>
  );
}
