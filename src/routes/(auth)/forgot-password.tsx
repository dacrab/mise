import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";
import { buildPageHead } from "@/lib/pageMeta";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => buildPageHead("Reset password | Mise", "Request a password reset to get back into your kitchen."),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout variant="login" tagline="no worries" subtitle="We'll help you get back into your kitchen.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
