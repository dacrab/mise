import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout variant="login" tagline="no worries" subtitle="We'll help you get back into your kitchen.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
