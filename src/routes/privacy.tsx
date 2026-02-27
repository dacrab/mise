import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/ui/StaticPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Mise" },
      { name: "description", content: "How Mise handles your personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" description="We respect your privacy and are committed to protecting your personal data.">
      <div className="space-y-10 text-charcoal-light leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly when you create an account, such as your name and email address.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">2. How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve our services, including personalizing your experience and managing your recipe collection.</p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-charcoal mb-3">3. Data Storage</h2>
          <p>Your data is stored securely using Convex, a real-time backend platform with built-in file storage.</p>
        </section>
      </div>

      <footer className="mt-16 pt-6 border-t border-cream-dark text-sm text-stone">
        Last updated: January 2026
      </footer>
    </StaticPage>
  );
}
