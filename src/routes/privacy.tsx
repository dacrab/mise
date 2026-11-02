import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Policy", "How Mise handles your personal data."),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageLayout>
      <article className="container-prose py-16 md:py-24">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.02em] sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-ink-soft">
          We respect your privacy and are committed to protecting your personal data.
        </p>

        <div className="prose-editorial mt-12">
          <section>
            <h2>1. Information we collect</h2>
            <p>
              We collect the information you provide when you create an account, such as your name, email address, and
              the recipes and images you choose to upload.
            </p>
          </section>

          <section>
            <h2>2. How we use your information</h2>
            <p>
              We use your information to provide and improve Mise, including personalizing your experience, showing your
              recipes to other visitors, and managing your collection.
            </p>
          </section>

          <section>
            <h2>3. Where your data lives</h2>
            <p>
              Your data is stored securely using Convex, a real-time backend platform with built-in file storage.
              Authentication is handled by Clerk.
            </p>
          </section>

          <section>
            <h2>4. Your choices</h2>
            <p>
              You can edit your profile and recipes at any time. You may also permanently delete your account from
              settings, which removes your recipes, bookmarks, and uploaded images.
            </p>
          </section>

          <section>
            <h2>5. Contact</h2>
            <p>
              Questions about this policy can be sent to the maintainers through the{" "}
              <a href="https://github.com/dacrab/mise" className="link">
                project repository
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-line pt-6 text-sm text-muted">Last updated: November 2026</footer>
      </article>
    </PageLayout>
  );
}
