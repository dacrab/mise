import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";
import { buildPageHead } from "@/lib/pageMeta";

export const Route = createFileRoute("/(auth)/login")({
  head: () => buildPageHead("Sign in | Mise", "Sign in to access your kitchen, recipes, and saved collections."),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout variant="login" tagline="welcome back, chef" subtitle="Your kitchen awaits.">
      <h1 className="font-serif text-3xl font-medium mb-2">Sign in</h1>
      <p className="text-stone mb-8">
        Don't have an account?{" "}
        <Link to="/signup" className="text-sage hover:underline">
          Create one
        </Link>
      </p>
      <LoginForm />
    </AuthLayout>
  );
}
