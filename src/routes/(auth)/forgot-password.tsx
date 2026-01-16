import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/ui/Layout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

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
