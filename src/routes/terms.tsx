import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms of Service", "Mise terms of service.", "/terms"),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageLayout>
      <article className="container-prose py-16 md:py-24">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.02em] sm:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-ink-soft">By using Mise, you agree to these terms.</p>

        <div className="prose-editorial mt-12">
          <section>
            <h2>1. Content ownership</h2>
            <p>
              You retain ownership of the recipes and images you upload. By posting content, you grant Mise a
              non-exclusive license to display it to other users.
            </p>
          </section>

          <section>
            <h2>2. Prohibited conduct</h2>
            <p>
              You agree not to upload content that is illegal, offensive, or infringes on the intellectual property of
              others.
            </p>
          </section>

          <section>
            <h2>3. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2>4. Changes</h2>
            <p>
              We may update these terms as Mise evolves. Continued use of the service after a change means you accept
              the revised terms.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">Last updated: November 2026</footer>
      </article>
    </PageLayout>
  );
}
