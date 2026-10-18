import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";

export function StaticPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cream-dark/50">
        <div className="wrapper h-16 flex items-center">
          <Link to="/" className="link-muted">
            &larr; Back
          </Link>
        </div>
      </header>
      <main className="pt-20 pb-24">
        <article className="wrapper max-w-2xl py-12 md:py-16">{children}</article>
      </main>
      <Footer />
    </>
  );
}
