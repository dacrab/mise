import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { z } from "zod";
import { SignupForm } from "@/components/auth/AuthForms";
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
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { redirect } = Route.useSearch();

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirect ?? "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sage p-12 flex-col justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold text-warm-white">
          mise
        </Link>
        <div>
          <p className="font-hand text-3xl text-cream mb-4">join the kitchen</p>
          <p className="text-cream/80 text-lg max-w-md">Share your favorite recipes with home cooks who care.</p>
        </div>
        <p className="text-cream/60 text-sm">© {new Date().getFullYear()} mise</p>
      </div>
      <div className="center flex-1 p-8 bg-cream dark:bg-d-bg">
        <div className="w-full max-w-md">
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
        </div>
      </div>
    </div>
  );
}
