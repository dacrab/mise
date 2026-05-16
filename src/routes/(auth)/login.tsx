import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { z } from "zod";
import { LoginForm } from "@/components/auth/AuthForms";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `Sign in${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Sign in to access your kitchen, recipes, and saved collections." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { redirect } = Route.useSearch();

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirect ?? "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal p-12 flex-col justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold text-cream">
          mise
        </Link>
        <div>
          <p className="font-hand text-3xl text-sage-light mb-4">welcome back, chef</p>
          <p className="text-cream/80 text-lg max-w-md">Your kitchen awaits.</p>
        </div>
        <p className="text-stone text-sm">© {new Date().getFullYear()} mise</p>
      </div>
      <div className="center flex-1 p-8 bg-cream dark:bg-d-bg">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-primary block mb-8">
            mise
          </Link>
          <h1 className="font-serif text-3xl font-medium mb-2">Sign in</h1>
          <p className="text-stone mb-8">
            Don't have an account?{" "}
            <Link to="/signup" search={{ redirect }} className="text-sage hover:underline">
              Create one
            </Link>
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
