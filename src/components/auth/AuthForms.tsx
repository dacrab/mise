import { useSignIn, useSignUp } from "@clerk/tanstack-react-start";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FieldError } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH = [
  { color: "bg-line-strong", label: "Too short" },
  { color: "bg-clay", label: "Weak" },
  { color: "bg-gold", label: "Good" },
  { color: "bg-accent", label: "Strong" },
  { color: "bg-accent", label: "Very strong" },
] as const;

function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80, "Name must be under 80 characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

const resetRequestSchema = z.object({ email: z.email("Enter a valid email address") });
const resetCodeSchema = z.object({ code: z.string().trim().min(1, "Enter the code from your email") });
const newPasswordSchema = z.object({
  newPassword: z.string().min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type ResetRequestValues = z.infer<typeof resetRequestSchema>;
type ResetCodeValues = z.infer<typeof resetCodeSchema>;
type NewPasswordValues = z.infer<typeof newPasswordSchema>;

const LOGIN_ERRORS: Record<string, string> = {
  form_identifier_not_found: "No account found with this email. Please sign up first.",
  form_password_incorrect: "Incorrect password. Please try again.",
  too_many_requests: "Too many attempts. Please try again later.",
  default: "Could not sign in. Please check your credentials.",
};

const SIGNUP_ERRORS_MAP: Record<string, string> = {
  form_identifier_exists: "An account with this email already exists.",
  default: "Could not create account. Please try again.",
};

const RESET_PASSWORD_ERRORS: Record<string, string> = {
  form_identifier_not_found: "No account found with this email. Please sign up first.",
  form_param_format_invalid__email_address: "Please enter a valid email address.",
  form_code_incorrect: "That code is incorrect. Please double-check and try again.",
  form_password_length_too_short: "Password must be at least 8 characters.",
  form_password_validation_failed: "Please choose a stronger password.",
  form_password_not_strong_enough: "Please choose a stronger password.",
  form_password_size_in_bytes_exceeded: "That password is too long. Please choose a shorter one.",
  form_password_pwned: "That password has appeared in a data breach. Please choose a different one.",
  form_new_password_matches_current: "New password must be different from your current password.",
  default: "Could not reset password. Please try again.",
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getClerkErrorCode(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  if (Array.isArray(error["errors"])) {
    for (const entry of error["errors"]) {
      if (!isRecord(entry)) continue;
      const code = getString(entry["code"]);
      if (code) return code;
    }
  }
  return getString(error["code"]);
}

function mapAuthError(errors: Record<string, string>, error: unknown): string {
  const code = getClerkErrorCode(error);
  if (code && errors[code]) return errors[code];
  const message = error instanceof Error ? error.message : String(error);
  const match = Object.entries(errors).find(([key]) => key !== "default" && message.includes(key));
  return match?.[1] ?? errors["default"] ?? "An error occurred";
}

function AuthField({
  id,
  label,
  error,
  ...props
}: React.ComponentPropsWithRef<"input"> & {
  id: string;
  label: string;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      <FieldError id={errorId} error={error ? { message: error } : undefined} />
    </div>
  );
}

function PasswordField({
  id,
  label,
  error,
  strength,
  ...props
}: Omit<React.ComponentPropsWithRef<"input">, "type"> & {
  id: string;
  label: string;
  error?: string;
  strength?: number;
}) {
  const [show, setShow] = useState(false);
  const errorId = `${id}-error`;
  const strengthId = `${id}-strength`;
  const strengthEntry = strength != null ? STRENGTH[Math.min(strength, STRENGTH.length - 1)] : undefined;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="input pr-11"
          placeholder="••••••••"
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error && errorId, strength != null && strengthId) || undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="icon-btn absolute right-1 top-1/2 size-9 -translate-y-1/2"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      </div>
      <FieldError id={errorId} error={error ? { message: error } : undefined} />
      {strength != null && strengthEntry && (
        <div id={strengthId} className="mt-3 space-y-1.5">
          <div
            className="flex h-1 gap-1"
            role="progressbar"
            aria-valuenow={strength}
            aria-valuemin={0}
            aria-valuemax={4}
          >
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn("flex-1 rounded-full", step <= strength ? strengthEntry.color : "bg-surface-2")}
              />
            ))}
          </div>
          <p className="text-xs text-muted">{strengthEntry.label}</p>
        </div>
      )}
    </div>
  );
}

function SubmitButton({
  pending,
  pendingLabel,
  label,
  disabled,
}: {
  pending: boolean;
  pendingLabel: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button type="submit" disabled={disabled || pending} className="btn-primary w-full">
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner className="size-4" />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-ink-soft">{description}</p>
    </>
  );
}

export function LoginForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.create({ identifier: values.email, password: values.password });
      if (result?.error) throw result.error;
      toast("Welcome back", "success");
    } catch (error) {
      toast(mapAuthError(LOGIN_ERRORS, error), "error");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField
        id="login-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="login-password"
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="text-right">
        <Link to="/forgot-password" className="link text-sm">
          Forgot password?
        </Link>
      </div>
      <SubmitButton
        pending={isSubmitting}
        pendingLabel="Signing in…"
        label="Sign in"
        disabled={fetchStatus === "fetching"}
      />
    </form>
  );
}

export function SignupForm() {
  const { signUp, fetchStatus } = useSignUp();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = handleSubmit(async (values) => {
    if (!signUp) return;
    try {
      const result = await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: values.name,
      });
      if (result?.error) throw result.error;
      toast("Welcome to Mise", "success");
    } catch (error) {
      toast(mapAuthError(SIGNUP_ERRORS_MAP, error), "error");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField
        id="signup-name"
        label="Name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <AuthField
        id="signup-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        id="signup-password"
        label="Password"
        autoComplete="new-password"
        strength={password ? calculatePasswordStrength(password) : undefined}
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        id="signup-confirm"
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <SubmitButton
        pending={isSubmitting}
        pendingLabel="Creating account…"
        label="Create account"
        disabled={fetchStatus === "fetching"}
      />
      <p className="text-center text-xs leading-relaxed text-muted">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="link">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="link">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");

  const emailForm = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<ResetCodeValues>({
    resolver: zodResolver(resetCodeSchema),
    defaultValues: { code: "" },
  });
  const passwordForm = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "" },
  });

  const email = useWatch({ control: emailForm.control, name: "email" }) ?? "";
  const newPassword = useWatch({ control: passwordForm.control, name: "newPassword" }) ?? "";

  const handleRequestReset = emailForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.create({ identifier: values.email });
      if (result?.error) throw result.error;
      const sendResult = await signIn.resetPasswordEmailCode.sendCode();
      if (sendResult?.error) throw sendResult.error;
      setStep("code");
      toast("Reset code sent", "success");
    } catch (error) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, error), "error");
    }
  });

  const handleVerifyCode = codeForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.resetPasswordEmailCode.verifyCode({ code: values.code });
      if (result?.error) throw result.error;
      setStep("password");
    } catch (error) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, error), "error");
    }
  });

  const handleSetNewPassword = passwordForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.resetPasswordEmailCode.submitPassword({ password: values.newPassword });
      if (result?.error) throw result.error;
      await signIn.finalize();
      toast("Password reset. Please sign in.", "success");
      await router.navigate({ to: "/login", replace: true });
    } catch (error) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, error), "error");
    }
  });

  if (step === "code") {
    return (
      <div>
        <button type="button" onClick={() => setStep("email")} className="link-muted mb-6 flex items-center gap-1.5">
          <ArrowLeftIcon className="size-4" /> Back
        </button>
        <StepHeader title="Enter reset code" description={`We sent a code to ${email}.`} />
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <AuthField
            id="reset-code"
            label="Reset code"
            type="text"
            placeholder="Enter code"
            autoComplete="one-time-code"
            error={codeForm.formState.errors.code?.message}
            {...codeForm.register("code")}
          />
          <SubmitButton
            pending={codeForm.formState.isSubmitting}
            pendingLabel="Verifying…"
            label="Verify code"
            disabled={fetchStatus === "fetching"}
          />
        </form>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div>
        <button type="button" onClick={() => setStep("code")} className="link-muted mb-6 flex items-center gap-1.5">
          <ArrowLeftIcon className="size-4" /> Back
        </button>
        <StepHeader title="Set a new password" description="Choose a new password for your account." />
        <form onSubmit={handleSetNewPassword} className="space-y-4">
          <PasswordField
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            strength={newPassword ? calculatePasswordStrength(newPassword) : undefined}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <SubmitButton
            pending={passwordForm.formState.isSubmitting}
            pendingLabel="Resetting…"
            label="Reset password"
            disabled={fetchStatus === "fetching"}
          />
        </form>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="link-muted mb-6 flex items-center gap-1.5">
        <ArrowLeftIcon className="size-4" /> Back to sign in
      </Link>
      <StepHeader title="Forgot your password?" description="Enter your email and we'll send you a reset code." />
      <form onSubmit={handleRequestReset} className="space-y-4">
        <AuthField
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register("email")}
        />
        <SubmitButton
          pending={emailForm.formState.isSubmitting}
          pendingLabel="Sending…"
          label="Send reset code"
          disabled={fetchStatus === "fetching"}
        />
      </form>
    </div>
  );
}
