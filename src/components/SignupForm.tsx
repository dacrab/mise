import { useState, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { withConvex } from "../convex";

const STRENGTH = [
  { color: "bg-stone-light", label: "Too weak" },
  { color: "bg-terracotta", label: "Weak" },
  { color: "bg-honey", label: "Fair" },
  { color: "bg-sage-light", label: "Good" },
  { color: "bg-sage", label: "Strong" },
];

function SignupFormInner() {
  const { signIn } = useAuthActions();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const strength = useMemo(() => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  }, [form.password]);

  const { color, label } = STRENGTH[strength];

  const handleSignup = async () => {
    if (strength < 2) return alert("Please use a stronger password");

    setLoading(true);
    setError("");
    try {
      await signIn("password", {
        email: form.email,
        password: form.password,
        name: form.name,
        flow: "signUp",
      });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { redirectTo: "/dashboard" });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-medium mb-2">Create an account</h1>
        <p className="text-stone text-sm">Start sharing your recipes</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg text-terracotta text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-charcoal-light mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input-field"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal-light mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-charcoal-light mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
          {form.password && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i <= strength ? color : "bg-cream-dark"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone">{label}</p>
            </div>
          )}
        </div>

        <button onClick={handleSignup} disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-cream-dark"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-cream px-3 text-xs text-stone">or</span>
          </div>
        </div>

        <button onClick={handleGoogleSignIn} className="btn-secondary w-full">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-stone">
        Already have an account? <a href="/login" className="text-sage hover:text-sage-light">Sign in</a>
      </p>
    </div>
  );
}

export default withConvex(SignupFormInner);
