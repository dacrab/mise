"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { FormField, FormError, Divider, GoogleIcon } from "@/components/ui/form";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      navigate({ to: "/dashboard" });
    } catch {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <FormField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Signing in..." : "Sign in"}</button>
      <Divider />
      <button type="button" onClick={() => signIn("google", { redirectTo: "/dashboard" })} className="btn-secondary w-full">
        <GoogleIcon /> Continue with Google
      </button>
    </form>
  );
}
