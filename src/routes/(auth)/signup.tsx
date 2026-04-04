import { useConvexAuth } from "convex/react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { SignupForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";

export const Route = createFileRoute("/(auth)/signup")({
  head: () => ({
    meta: [
      { title: `Create account${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Create your Mise account to save, share, and manage recipes." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      variant="signup"
      tagline="join the kitchen"
      subtitle="Share your favorite recipes with home cooks who care."
    >
      <h1 className="font-serif text-3xl font-medium mb-2">Create account</h1>
      <p className="text-stone mb-8">
        Already have an account?{" "}
        <Link to="/login" className="text-sage hover:underline">Sign in</Link>
      </p>
      <SignupForm />
    </AuthLayout>
  );
}
