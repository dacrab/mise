import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/PageLayout";

export const Route = createFileRoute("/(auth)/login")({
  head: () => ({
    meta: [
      { title: `Sign in${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Sign in to access your kitchen, recipes, and saved collections." },
    ],
  }),
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
