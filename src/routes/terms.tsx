import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/layout/PageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service | Mise" }, { name: "description", content: "Mise terms of service." }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPage>
      <h1 className="font-serif text-4xl font-medium mb-4">Terms of Service</h1>
      <p className="text-stone mb-8">By using mise, you agree to these terms.</p>
      <div className="space-y-10 text-charcoal-light leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">1. Content Ownership</h2>
          <p>
            You retain ownership of the recipes and images you upload. By posting content, you grant mise a
            non-exclusive license to display it to other users.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">2. Prohibited Conduct</h2>
          <p>
            You agree not to upload content that is illegal, offensive, or infringes on the intellectual property of
            others.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">3. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>
      </div>
      <footer className="mt-16 pt-6 border-t border-cream-dark text-sm text-stone">Last updated: January 2026</footer>
    </StaticPage>
  );
}
