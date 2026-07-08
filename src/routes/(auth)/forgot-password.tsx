import { createFileRoute, Link } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => ({
    meta: [
      { title: `Reset password${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Request a password reset to get back into your kitchen." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout
      heroHeading="no worries"
      heroDescription="We'll help you get back into your kitchen."
      form={
        <>
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-primary block mb-8">
            mise
          </Link>
          <ForgotPasswordForm />
        </>
      }
    />
  );
}
