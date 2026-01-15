import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@/components/auth/SignupForm";
import { AuthLayout } from "@/components/ui/Layout";

export const Route = createFileRoute("/(auth)/signup")({
  component: () => (
    <AuthLayout variant="signup" tagline="join the kitchen" subtitle="Share your favorite recipes with home cooks who care.">
      <h1 className="font-serif text-3xl font-medium mb-2">Create account</h1>
      <p className="text-stone mb-8">
        Already have an account? <Link to="/login" className="text-sage hover:underline">Sign in</Link>
      </p>
      <SignupForm />
    </AuthLayout>
  ),
});
