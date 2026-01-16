
import { useState, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { FormField, FormError, Divider, GoogleIcon, PasswordField } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

const STRENGTH_COLORS = ["bg-stone-light", "bg-terracotta", "bg-honey", "bg-sage"];
const STRENGTH_LABELS = ["Too short", "Weak", "Good", "Strong"];

const ERROR_MESSAGES: Record<string, string> = {
  AccountAlreadyExists: "An account with this email already exists. Please sign in.",
  InvalidEmail: "Please enter a valid email address.",
  default: "Could not create account. Please try again.",
};

function getErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return value;
  }
  return ERROR_MESSAGES.default ?? "An error occurred";
}

export function SignupForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    if (!password || password.length < 6) return 0;
    if (password.length < 8) return 1;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (hasUpper && hasNumber) return 3;
    if (hasUpper || hasNumber) return 2;
    return 1;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const result = await signIn("password", { email, password, name, flow: "signUp" });
      if (result.signingIn) {
        toast("Account created! Welcome to Mise.", "success");
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
      <FormField label="Name" type="text" value={name} onChange={setName} placeholder="Your name" />
      <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        show={showPassword}
        onToggleShow={() => setShowPassword(!showPassword)}
        autoComplete="new-password"
        strengthMeter={{ strength, colors: STRENGTH_COLORS, labels: STRENGTH_LABELS }}
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creating..." : "Sign up"}
      </button>
      <Divider />
      <button type="button" className="btn-secondary w-full" disabled>
        <GoogleIcon /> Continue with Google (Coming Soon)
      </button>
    </form>
  );
}
