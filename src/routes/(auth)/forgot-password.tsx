import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/(auth)/forgot-password")({
  head: () => pageHead("Reset password", "Request a password reset to get back into your kitchen.", "/forgot-password"),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthLayout heroHeading="No worries. We'll get you back in." heroDescription="A reset code is all you need.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
