
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { FormField, FormError, Divider, GoogleIcon, PasswordField } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

const ERROR_MESSAGES: Record<string, string> = {
  InvalidAccountId: "No account found with this email. Please sign up first.",
  InvalidSecret: "Incorrect password. Please try again.",
  TooManyFailedAttempts: "Too many failed attempts. Please try again later.",
  default: "Could not sign in. Please check your credentials.",
};

function getErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return value;
  }
  return ERROR_MESSAGES.default ?? "An error occurred";
}

export function LoginForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await signIn("password", { email, password, flow: "signIn" });
      if (result.signingIn) {
        toast("Welcome back!", "success");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        show={showPassword}
        onToggleShow={() => setShowPassword(!showPassword)}
        autoComplete="current-password"
      />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-sage hover:text-sage-light">
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <Divider />
      <button type="button" className="btn-secondary w-full" disabled>
        <GoogleIcon /> Continue with Google (Coming Soon)
      </button>
    </form>
  );
}
