import { useUser } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "@/components/auth/AuthForms";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { safeRedirect } from "@/lib/utils";

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
  const { isSignedIn, isLoaded } = useUser();
  const { redirect } = Route.useSearch();
  const safeTarget = safeRedirect(redirect);

  if (isLoaded && isSignedIn) {
    return <Navigate to={safeTarget ?? "/dashboard"} replace />;
  }

  return (
    <AuthLayout
      heroHeading="welcome back, chef"
      heroDescription="Your kitchen awaits."
      form={
        <>
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
        </>
      }
    />
  );
}
