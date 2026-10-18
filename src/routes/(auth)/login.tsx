import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PageLoader } from "@/components/ui/Primitives";
import { pageHead, redirectSearchSchema } from "@/lib/route";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: redirectSearchSchema,
  head: () => pageHead("Sign in", "Sign in to access your kitchen, recipes, and saved collections."),
  component: LoginPage,
});

function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { redirect } = Route.useSearch();
  const safeTarget = safeRedirect(redirect);

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (isSignedIn) {
    return <Navigate to={safeTarget ?? "/dashboard"} replace />;
  }

  return (
    <AuthLayout
      heroHeading="welcome back, chef"
      heroDescription="Your kitchen awaits."
      form={
        <>
          <h1 className="font-serif text-3xl font-medium mb-2">Sign in</h1>
          <p className="text-stone mb-8">
            Don't have an account?{" "}
            <Link to="/signup" search={{ redirect }} className="text-sage hover:underline">
              Create one
            </Link>
          </p>
          <LoginForm />
        </>
      }
    />
  );
}
