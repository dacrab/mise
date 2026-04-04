import { createFileRoute } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";

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
    <AuthLayout variant="login" tagline="no worries" subtitle="We'll help you get back into your kitchen.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
