import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { SignupForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `Create account${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Create your Mise account to save, share, and manage recipes." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { redirect } = Route.useSearch();

  if (isLoaded && isSignedIn) {
    return <Navigate to={redirect ?? "/dashboard"} replace />;
  }

  return (
    <AuthLayout
      heroBg="bg-sage"
      heroHeading="join the kitchen"
      heroDescription="Share your favorite recipes with home cooks who care."
      heroFooterClass="text-cream/60"
      form={
        <>
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-primary block mb-8">
            mise
          </Link>
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
