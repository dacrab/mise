import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "@/components/SignupForm";

export const Route = createFileRoute("/signup")({
  component: () => (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sage p-12 flex-col justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold text-warm-white">mise</Link>
        <div>
          <p className="font-hand text-3xl text-cream mb-4">join the kitchen</p>
          <p className="text-cream/80 text-lg max-w-md">Share your favorite recipes with home cooks who care.</p>
        </div>
        <p className="text-cream/60 text-sm">© 2026 mise</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-charcoal block mb-8">mise</Link>
          <h1 className="font-serif text-3xl font-medium mb-2">Create account</h1>
          <p className="text-stone mb-8">
            Already have an account? <Link to="/login" className="text-sage hover:underline">Sign in</Link>
          </p>
          <SignupForm />
        </div>
      </div>
    </div>
  ),
});
