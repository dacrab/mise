import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-cream-dark/50">
        <div className="wrapper h-16 flex items-center">
          <Link to="/" className="text-sm text-stone hover:text-charcoal transition-colors">← Back</Link>
        </div>
      </header>

      <main className="pt-20 pb-24">
        <article className="wrapper max-w-2xl py-12 md:py-16">
          <h1 className="heading-1 text-3xl md:text-4xl mb-6">Terms of Service</h1>
          <p className="body-large mb-12">By using mise, you agree to these terms.</p>
          
          <div className="space-y-10 text-charcoal-light leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">1. Content Ownership</h2>
              <p>You retain ownership of the recipes and images you upload. By posting content, you grant mise a non-exclusive license to display it to other users.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">2. Prohibited Conduct</h2>
              <p>You agree not to upload content that is illegal, offensive, or infringes on the intellectual property of others.</p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-charcoal mb-3">3. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </section>
          </div>

          <footer className="mt-16 pt-6 border-t border-cream-dark text-sm text-stone">
            Last updated: January 2026
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}
