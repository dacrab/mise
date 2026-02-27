import { useState, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useRouter } from "@tanstack/react-router";
import { FormField, FormError, Divider, PasswordField } from "@/components/ui/form";
import { Spinner } from "@/components/ui/Spinner";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
import { useToast } from "@/components/ui/toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// ─── Shared ──────────────────────────────────────────────────────────────────

function GoogleSignInButton() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not sign in with Google", "error");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleGoogleSignIn()}
      disabled={loading}
      className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? <Spinner /> : <GoogleIcon />}
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function authError(map: Record<string, string>, error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return map["default"] ?? "An error occurred";
}

// ─── LoginForm ────────────────────────────────────────────────────────────────

const LOGIN_ERRORS: Record<string, string> = {
  InvalidAccountId: "No account found with this email. Please sign up first.",
  InvalidSecret: "Incorrect password. Please try again.",
  TooManyFailedAttempts: "Too many failed attempts. Please try again later.",
  default: "Could not sign in. Please check your credentials.",
};

export function LoginForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError(""); setLoading(true);
    try {
      const result = await signIn("password", { email, password, flow: "signIn" });
      if (result.signingIn) {
        toast("Welcome back!", "success");
        await router.navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const message = authError(LOGIN_ERRORS, err);
      setError(message); toast(message, "error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      <FormField id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword(!showPassword)} autoComplete="current-password" />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-sage hover:text-sage-light">Forgot password?</Link>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Signing in…" : "Sign in"}</button>
      <Divider />
      <GoogleSignInButton />
    </form>
  );
}

// ─── SignupForm ───────────────────────────────────────────────────────────────

const STRENGTH_COLORS = ["bg-stone-light", "bg-terracotta", "bg-honey", "bg-sage"];
const STRENGTH_LABELS = ["Too short", "Weak", "Good", "Strong"];

const SIGNUP_ERRORS: Record<string, string> = {
  AccountAlreadyExists: "An account with this email already exists. Please sign in.",
  InvalidEmail: "Please enter a valid email address.",
  default: "Could not create account. Please try again.",
};

export function SignupForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
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
    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setLoading(true);
    try {
      const result = await signIn("password", { email, password, name, flow: "signUp" });
      if (result.signingIn) {
        toast("Account created! Welcome to Mise.", "success");
        await router.navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      const message = authError(SIGNUP_ERRORS, err);
      setError(message); toast(message, "error");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormError message={error} />}
      <FormField id="signup-name" label="Name" type="text" value={name} onChange={setName} placeholder="Your name" autoComplete="name" />
      <FormField id="signup-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} onToggleShow={() => setShowPassword(!showPassword)} autoComplete="new-password" strengthMeter={{ strength, colors: STRENGTH_COLORS, labels: STRENGTH_LABELS }} />
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating…" : "Sign up"}</button>
      <Divider />
      <GoogleSignInButton />
    </form>
  );
}

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────

export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.set("email", email); fd.set("flow", "reset");
      await signIn("password", fd);
      setStep("code");
      toast("Reset code sent to your email", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset code");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim()) return;
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.set("email", email); fd.set("code", code);
      fd.set("newPassword", newPassword); fd.set("flow", "reset-verification");
      await signIn("password", fd);
      toast("Password reset successfully!", "success");
      await router.navigate({ to: "/login", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code or could not reset password");
    } finally { setLoading(false); }
  };

  if (step === "code") {
    return (
      <div>
        <button onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-stone hover:text-charcoal mb-6">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <h1 className="font-serif text-2xl font-medium mb-2">Enter reset code</h1>
        <p className="text-stone mb-6">We sent a code to {email}</p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <FormField id="reset-code" label="Reset code" type="text" value={code} onChange={setCode} placeholder="Enter code" autoComplete="one-time-code" />
          <FormField id="reset-password" label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" />
          {error && <FormError message={error} />}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Resetting…" : "Reset password"}</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="flex items-center gap-1 text-sm text-stone hover:text-charcoal mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to login
      </Link>
      <h1 className="font-serif text-2xl font-medium mb-2">Forgot password?</h1>
      <p className="text-stone mb-6">Enter your email and we'll send you a reset code.</p>
      <form onSubmit={handleRequestReset} className="space-y-4">
        <FormField id="forgot-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        {error && <FormError message={error} />}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Sending…" : "Send reset code"}</button>
      </form>
    </div>
  );
}
