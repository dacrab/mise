"use client";

import { useState, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { FormField, FormError, Divider, GoogleIcon } from "@/components/ui/form";

const STRENGTH_COLORS = ["bg-stone-light", "bg-terracotta", "bg-honey", "bg-sage-light", "bg-sage"];
const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

export function SignupForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    if (!password) return 0;
    return [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (strength < 2) {
      setError("Please use a stronger password (8+ chars, uppercase, number)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      navigate({ to: "/dashboard" });
    } catch {
      setError("Could not create account. Email may already be in use.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      <FormField label="Name" type="text" value={name} onChange={setName} placeholder="Your name" />
      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <div>
        <label className="block text-sm font-medium text-charcoal-light mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          aria-describedby="password-strength"
        />
        {password && (
          <div id="password-strength" className="mt-3 space-y-2" aria-live="polite">
            <div className="flex gap-1 h-1" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4}>
              {[1,2,3,4].map((i) => <div key={i} className={`flex-1 rounded-full ${i <= strength ? STRENGTH_COLORS[strength] : "bg-cream-dark"}`} />)}
            </div>
            <p className="text-xs text-stone">{STRENGTH_LABELS[strength]}</p>
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Sign up"}</button>
      <Divider />
      <button type="button" onClick={() => signIn("google", { redirectTo: "/dashboard" })} className="btn-secondary w-full">
        <GoogleIcon /> Continue with Google
      </button>
    </form>
  );
}
