import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PageLoader } from "@/components/ui/Primitives";
import { pageHead, redirectSearchSchema } from "@/lib/route";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: redirectSearchSchema,
  head: () => pageHead("Sign in", "Sign in to access your kitchen, recipes, and saved collections.", "/login"),
  component: LoginPage,
});

function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { redirect } = Route.useSearch();
  const safeTarget = safeRedirect(redirect);

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Navigate to={safeTarget ?? "/dashboard"} replace />;

  return (
    <AuthLayout heroHeading="Welcome back to your kitchen." heroDescription="Pick up where you left off.">
      <h1 className="text-3xl font-medium tracking-[-0.02em]">Sign in</h1>
      <p className="mt-2 mb-8 text-ink-soft">
        Don't have an account?{" "}
        <Link to="/signup" search={{ redirect }} className="link">
          Create one
        </Link>
      </p>
      <LoginForm />
    </AuthLayout>
  );
}
