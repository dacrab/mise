import { createFileRoute } from "@tanstack/react-router";
import { StaticPageLayout } from "@/components/StaticPageLayout";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms of Service", "Mise terms of service."),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPageLayout>
      <h1 className="page-title mb-4">Terms of Service</h1>
      <p className="text-stone mb-8">By using mise, you agree to these terms.</p>
      <div className="space-y-10 text-secondary leading-relaxed">
        <section>
          <h2 className="section-title mb-3">1. Content Ownership</h2>
          <p>
            You retain ownership of the recipes and images you upload. By posting content, you grant mise a
            non-exclusive license to display it to other users.
          </p>
        </section>
        <section>
          <h2 className="section-title mb-3">2. Prohibited Conduct</h2>
          <p>
            You agree not to upload content that is illegal, offensive, or infringes on the intellectual property of
            others.
          </p>
        </section>
        <section>
          <h2 className="section-title mb-3">3. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>
      </div>
      <footer className="mt-16 pt-6 border-t border-cream-dark text-sm text-stone">Last updated: January 2026</footer>
    </StaticPageLayout>
  );
}
