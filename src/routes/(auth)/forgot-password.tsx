import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => pageHead("Reset password", "Request a password reset to get back into your kitchen."),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout
      heroHeading="no worries"
      heroDescription="We'll help you get back into your kitchen."
      form={<ForgotPasswordForm />}
    />
  );
}
