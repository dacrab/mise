import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/login")({
  component: () => (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal p-12 flex-col justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold text-cream">mise</Link>
        <div>
          <p className="font-hand text-3xl text-sage-light mb-4">welcome back, chef</p>
          <p className="text-stone-light text-lg max-w-md">Your kitchen awaits.</p>
        </div>
        <p className="text-stone text-sm">© 2026 mise</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden font-serif text-2xl font-semibold text-charcoal block mb-8">mise</Link>
          <h1 className="font-serif text-3xl font-medium mb-2">Sign in</h1>
          <p className="text-stone mb-8">
            Don't have an account? <Link to="/signup" className="text-sage hover:underline">Create one</Link>
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  ),
});
