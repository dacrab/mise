import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SignupForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PageLoader } from "@/components/ui/Primitives";
import { pageHead, redirectSearchSchema } from "@/lib/route";
import { safeRedirect } from "@/lib/utils";

export const Route = createFileRoute("/(auth)/signup")({
  validateSearch: redirectSearchSchema,
  head: () => pageHead("Create account", "Create your Mise account to save, share, and manage recipes."),
  component: SignupPage,
});

function SignupPage() {
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
      heroBg="bg-sage"
      heroHeading="join the kitchen"
      heroDescription="Share your favorite recipes with home cooks who care."
      heroFooterClass="text-cream/60"
      form={
        <>
          <h1 className="font-serif text-3xl font-medium mb-2">Create account</h1>
          <p className="text-stone mb-8">
            Already have an account?{" "}
            <Link to="/login" search={{ redirect }} className="text-sage hover:underline">
              Sign in
            </Link>
          </p>
          <SignupForm />
        </>
      }
    />
  );
}
