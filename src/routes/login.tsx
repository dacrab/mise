import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const delay = (s: number) => ({ "--delay": `${s}s` } as React.CSSProperties);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal p-12 flex-col justify-between fade-in" style={delay(0)}>
        <Link to="/" className="font-serif text-2xl font-semibold text-cream">mise</Link>
        <div className="fade-in" style={delay(0.1)}>
          <p className="font-hand text-3xl text-sage-light mb-4">welcome back, chef</p>
          <p className="text-stone-light text-lg max-w-md">
            Your kitchen awaits. Sign in to continue sharing recipes with the community.
          </p>
        </div>
        <p className="text-stone text-sm">© {new Date().getFullYear()} mise</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md fade-in" style={delay(0.15)}>
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-serif text-2xl font-semibold text-charcoal">mise</Link>
          </div>
          <h1 className="font-serif text-3xl font-medium mb-2">Sign in</h1>
          <p className="text-stone mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sage hover:underline">Create one</Link>
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
