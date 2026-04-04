import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Spinner } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_COLORS = ["bg-stone-light", "bg-terracotta", "bg-honey", "bg-sage", "bg-sage"];
const STRENGTH_LABELS = ["Too short", "Weak", "Good", "Strong", "Strong"];

function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}


function FormField({
  label, id, type = "text", value, onChange, placeholder, error, autoComplete,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string; autoComplete?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-light mb-2">{label}</label>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field w-full${error ? " border-terracotta" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete={autoComplete}
      />
      {error && <p id={errorId} className="text-xs text-terracotta mt-1">{error}</p>}
    </div>
  );
}

function PasswordField({
  label, id = "password", value, onChange, show, onToggleShow, autoComplete, strengthMeter,
}: {
  label: string; id?: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void; autoComplete?: string;
  strengthMeter?: { strength: number; colors: string[]; labels: string[] };
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-light mb-2">{label}</label>
      <div className="relative">
        <input
          id={id} type={show ? "text" : "password"} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-full pr-10" placeholder="••••••••"
          autoComplete={autoComplete ?? "current-password"}
          aria-describedby={strengthMeter ? `${id}-strength` : undefined}
        />
        <button type="button" onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>
      {strengthMeter && value && (
        <div id={`${id}-strength`} className="mt-3 space-y-1" aria-live="polite">
          <div className="flex gap-1 h-1" role="progressbar" aria-valuenow={strengthMeter.strength} aria-valuemin={0} aria-valuemax={4}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex-1 rounded-full ${i <= strengthMeter.strength ? strengthMeter.colors[strengthMeter.strength] ?? "bg-sage" : "bg-cream-dark"}`} />
            ))}
          </div>
          <p className="text-xs text-stone">{strengthMeter.labels[strengthMeter.strength]}</p>
        </div>
      )}
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div role="alert" className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-lg text-terracotta text-sm">
      {message}
    </div>
  );
}


const LOGIN_ERRORS: Record<string, string> = {
  InvalidAccountId: "No account found with this email. Please sign up first.",
  InvalidSecret: "Incorrect password. Please try again.",
  TooManyFailedAttempts: "Too many failed attempts. Please try again later.",
  default: "Could not sign in. Please check your credentials.",
};

const SIGNUP_ERRORS_MAP: Record<string, string> = {
  EmailAlreadyExists: "An account with this email already exists.",
  default: "Could not create account. Please try again.",
};

function mapAuthError(errors: Record<string, string>, error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  for (const [key, val] of Object.entries(errors)) {
    if (key !== "default" && msg.includes(key)) return val;
  }
  return errors["default"] ?? "An error occurred";
}

function GoogleButton({ isPending, onClick }: { isPending: boolean; onClick: () => void }) {
  return (
    <>
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-dark" /></div>
        <div className="relative flex justify-center"><span className="bg-cream px-3 text-xs text-stone">or</span></div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Spinner /> : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {isPending ? "Redirecting…" : "Continue with Google"}
      </button>
    </>
  );
}

export function LoginForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const { execute: handleSubmit, isPending } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;
      setFormError("");
      const result = await signIn("password", { email, password, flow: "signIn" });
      if (result.signingIn) {
        toast("Welcome back!", "success");
        await router.navigate({ to: "/dashboard", replace: true });
      }
    },
    { onError: (err) => setFormError(mapAuthError(LOGIN_ERRORS, err)) }
  );

  const { execute: executeGoogle, isPending: googlePending } = useAsyncAction(
    () => signIn("google"),
    { errorMessage: "Could not sign in with Google" }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <FormError message={formError} />}
      <FormField id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField
        id="login-password" label="Password" value={password} onChange={setPassword}
        show={showPassword} onToggleShow={() => setShowPassword((s) => !s)}
        autoComplete="current-password"
      />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm text-sage hover:text-sage-light">Forgot password?</Link>
      </div>
      <button type="submit" disabled={isPending || !email || !password} className="btn-primary w-full disabled:opacity-50">
        {isPending ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span> : "Sign in"}
      </button>
      <GoogleButton isPending={googlePending} onClick={() => void executeGoogle()} />
    </form>
  );
}

export function SignupForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const strength = calculatePasswordStrength(password);

  const { execute: handleSubmit, isPending } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !email || !password || password.length < MIN_PASSWORD_LENGTH) return;
      setFormError("");
      const result = await signIn("password", { email, password, name, flow: "signUp" });
      if (result.signingIn) {
        toast("Account created! Welcome to Mise.", "success");
        await router.navigate({ to: "/dashboard", replace: true });
      }
    },
    { onError: (err) => setFormError(mapAuthError(SIGNUP_ERRORS_MAP, err)) }
  );

  const { execute: executeGoogle, isPending: googlePending } = useAsyncAction(
    () => signIn("google"),
    { errorMessage: "Could not sign in with Google" }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <FormError message={formError} />}
      <FormField id="signup-name" label="Name" type="text" value={name} onChange={setName} placeholder="Your name" autoComplete="name" />
      <FormField id="signup-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
      <PasswordField
        id="signup-password" label="Password" value={password} onChange={setPassword}
        show={showPassword} onToggleShow={() => setShowPassword((s) => !s)}
        autoComplete="new-password"
        strengthMeter={{ strength, colors: STRENGTH_COLORS, labels: STRENGTH_LABELS }}
      />
      <button
        type="submit"
        disabled={isPending || !name || !email || password.length < MIN_PASSWORD_LENGTH}
        className="btn-primary w-full disabled:opacity-50"
      >
        {isPending ? <span className="flex items-center justify-center gap-2"><Spinner /> Creating…</span> : "Sign up"}
      </button>
      <GoogleButton isPending={googlePending} onClick={() => void executeGoogle()} />
    </form>
  );
}


export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { execute: handleRequestReset, isPending: sendingCode } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;
      setFormError("");
      const fd = new FormData();
      fd.set("email", email);
      fd.set("flow", "reset");
      await signIn("password", fd);
      setStep("code");
      toast("Reset code sent to your email", "success");
    },
    { onError: (err) => setFormError(err.message) }
  );

  const { execute: handleResetPassword, isPending: resetting } = useAsyncAction(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!code.trim() || newPassword.length < MIN_PASSWORD_LENGTH) return;
      setFormError("");
      const fd = new FormData();
      fd.set("email", email);
      fd.set("code", code);
      fd.set("newPassword", newPassword);
      fd.set("flow", "reset-verification");
      await signIn("password", fd);
      toast("Password reset successfully!", "success");
      await router.navigate({ to: "/login", replace: true });
    },
    { onError: (err) => setFormError(err.message) }
  );

  if (step === "code") {
    return (
      <div>
        <button onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-stone hover:text-charcoal mb-6">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <h1 className="font-serif text-2xl font-medium mb-2">Enter reset code</h1>
        <p className="text-stone mb-6">We sent a code to {email}</p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          {formError && <FormError message={formError} />}
          <FormField id="reset-code" label="Reset code" type="text" value={code} onChange={setCode} placeholder="Enter code" autoComplete="one-time-code" />
          <FormField id="reset-password" label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" autoComplete="new-password" />
          <button type="submit" disabled={resetting || !code.trim() || newPassword.length < MIN_PASSWORD_LENGTH} className="btn-primary w-full disabled:opacity-50">
            {resetting ? <span className="flex items-center justify-center gap-2"><Spinner /> Resetting…</span> : "Reset password"}
          </button>
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
        {formError && <FormError message={formError} />}
        <FormField id="forgot-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <button type="submit" disabled={sendingCode || !email.trim()} className="btn-primary w-full disabled:opacity-50">
          {sendingCode ? <span className="flex items-center justify-center gap-2"><Spinner /> Sending…</span> : "Send reset code"}
        </button>
      </form>
    </div>
  );
}
