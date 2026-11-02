import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SignupForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PageLoader } from "@/components/ui/Primitives";
import { pageHead, redirectSearchSchema } from "@/lib/route";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/(auth)/signup")({
  validateSearch: redirectSearchSchema,
  head: () => pageHead("Create account", "Create your Mise account to save, share, and manage recipes.", "/signup"),
  component: SignupPage,
});

function SignupPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { redirect } = Route.useSearch();
  const safeTarget = safeRedirect(redirect);

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Navigate to={safeTarget ?? "/dashboard"} replace />;

  return (
    <AuthLayout
      heroHeading="Join the kitchen."
      heroDescription="Share your favourite recipes with home cooks who care."
    >
      <h1 className="text-3xl font-medium tracking-[-0.02em]">Create account</h1>
      <p className="mt-2 mb-8 text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" search={{ redirect }} className="link">
          Sign in
        </Link>
      </p>
      <SignupForm />
    </AuthLayout>
  );
}
