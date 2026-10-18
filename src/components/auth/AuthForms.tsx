import { useSignIn, useSignUp } from "@clerk/tanstack-react-start";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@tanstack/react-router";
import { forwardRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FieldError } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { asRecord } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH = [
  { color: "bg-stone-light", label: "Too short" },
  { color: "bg-terracotta", label: "Weak" },
  { color: "bg-honey", label: "Good" },
  { color: "bg-sage", label: "Strong" },
  { color: "bg-sage", label: "Very strong" },
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
    name: z.string().trim().min(1, "Enter your name"),
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
  InvalidAccountId: "No account found with this email. Please sign up first.",
  InvalidSecret: "Incorrect password. Please try again.",
  TooManyFailedAttempts: "Too many failed attempts. Please try again later.",
  default: "Could not sign in. Please check your credentials.",
};

const SIGNUP_ERRORS_MAP: Record<string, string> = {
  EmailAlreadyExists: "An account with this email already exists.",
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
  form_password_compromised__sign_in: "That password has appeared in a data breach. Please choose a different one.",
  form_new_password_matches_current: "New password must be different from your current password.",
  default: "Could not reset password. Please try again.",
};

const BACK_LINK_CLASS = "link-muted flex items-center gap-1 mb-6";

function getClerkErrorCode(error: unknown): string | undefined {
  const record = asRecord(error);
  if (!record) return undefined;
  const { code, errors } = record;
  const firstCode = asRecord(Array.isArray(errors) ? errors[0] : undefined)?.["code"];
  if (typeof firstCode === "string") return firstCode;
  if (typeof code === "string") return code;
  return undefined;
}

function mapAuthError(errors: Record<string, string>, error: unknown): string {
  const code = getClerkErrorCode(error);
  if (code && errors[code]) return errors[code];
  const msg = error instanceof Error ? error.message : String(error);
  return (
    Object.entries(errors).find(([key]) => key !== "default" && msg.includes(key))?.[1] ??
    errors["default"] ??
    "An error occurred"
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
    <button type="submit" disabled={disabled || pending} className="btn-primary w-full disabled:opacity-50">
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({ id, label, error, ...rest }, ref) => {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`input-field w-full${error ? " border-terracotta" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      <FieldError id={errorId} error={{ message: error }} />
    </div>
  );
});
FormField.displayName = "FormField";

type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
  show: boolean;
  onToggleShow: () => void;
  strength?: number;
  error?: string;
};

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, show, onToggleShow, strength, error, ...rest }, ref) => {
    const strengthEntry = strength != null ? STRENGTH[Math.min(strength, STRENGTH.length - 1)] : undefined;
    return (
      <div>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={show ? "text" : "password"}
            className={`input-field w-full pr-10${error ? " border-terracotta" : ""}`}
            placeholder="••••••••"
            aria-invalid={!!error}
            aria-describedby={strength != null ? `${id}-strength` : undefined}
            {...rest}
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-primary"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <FieldError id={`${id}-error`} error={{ message: error }} />
        {strength != null && (
          <div id={`${id}-strength`} className="mt-3 space-y-1" aria-live="polite">
            <div
              className="flex gap-1 h-1"
              role="progressbar"
              aria-valuenow={strength}
              aria-valuemin={0}
              aria-valuemax={4}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full ${i <= strength ? (strengthEntry?.color ?? "bg-sage") : "surface-raised"}`}
                />
              ))}
            </div>
            <p className="text-xs text-stone">{strengthEntry?.label}</p>
          </div>
        )}
      </div>
    );
  },
);
PasswordField.displayName = "PasswordField";

function StepHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <>
      <h1 className="font-serif text-2xl font-medium mb-2">{title}</h1>
      <p className="text-stone mb-6">{description}</p>
    </>
  );
}

export function LoginForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoaded = fetchStatus === "idle";

  const onSubmit = handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.create({ identifier: values.email, password: values.password });
      if (result?.error) throw result.error;
      toast("Welcome back!", "success");
    } catch (err) {
      toast(mapAuthError(LOGIN_ERRORS, err), "error");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
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
        show={showPassword}
        onToggleShow={() => setShowPassword((s) => !s)}
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="text-right">
        <Link to="/forgot-password" className="text-sm link-sage">
          Forgot password?
        </Link>
      </div>
      <SubmitButton pending={isSubmitting} pendingLabel="Signing in…" label="Sign in" disabled={!isLoaded} />
    </form>
  );
}

export function SignupForm() {
  const { signUp, fetchStatus } = useSignUp();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordInput = useWatch({ control, name: "password" }) ?? "";
  const isLoaded = fetchStatus === "idle";

  const onSubmit = handleSubmit(async (values) => {
    if (!signUp) return;
    try {
      const result = await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: values.name,
      });
      if (result?.error) throw result.error;
      toast("Account created! Welcome to Mise", "success");
    } catch (err) {
      toast(mapAuthError(SIGNUP_ERRORS_MAP, err), "error");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField
        id="signup-name"
        label="Name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <FormField
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
        show={showPassword}
        onToggleShow={() => setShowPassword((s) => !s)}
        autoComplete="new-password"
        strength={passwordInput ? calculatePasswordStrength(passwordInput) : undefined}
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        id="signup-confirm"
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <SubmitButton pending={isSubmitting} pendingLabel="Creating…" label="Sign up" disabled={!isLoaded} />
    </form>
  );
}

export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [showPassword, setShowPassword] = useState(false);

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
  const isLoaded = fetchStatus === "idle";

  const handleRequestReset = emailForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.create({ identifier: values.email });
      if (result?.error) throw result.error;
      const sendResult = await signIn.resetPasswordEmailCode.sendCode();
      if (sendResult?.error) throw sendResult.error;
      setStep("code");
      toast("Reset code sent to your email", "success");
    } catch (err) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, err), "error");
    }
  });

  const handleVerifyCode = codeForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.resetPasswordEmailCode.verifyCode({ code: values.code });
      if (result?.error) throw result.error;
      setStep("password");
    } catch (err) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, err), "error");
    }
  });

  const handleSetNewPassword = passwordForm.handleSubmit(async (values) => {
    if (!signIn) return;
    try {
      const result = await signIn.resetPasswordEmailCode.submitPassword({ password: values.newPassword });
      if (result?.error) throw result.error;
      await signIn.finalize();
      toast("Password reset successfully! Please sign in.", "success");
      await router.navigate({ to: "/login", replace: true });
    } catch (err) {
      toast(mapAuthError(RESET_PASSWORD_ERRORS, err), "error");
    }
  });

  if (step === "code") {
    return (
      <div>
        <button type="button" onClick={() => setStep("email")} className={BACK_LINK_CLASS}>
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <StepHeader title="Enter reset code" description={`We sent a code to ${email}`} />
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <FormField
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
            disabled={!isLoaded}
          />
        </form>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div>
        <button type="button" onClick={() => setStep("code")} className={BACK_LINK_CLASS}>
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <StepHeader title="Set new password" description="Choose a new password for your account." />
        <form onSubmit={handleSetNewPassword} className="space-y-4">
          <PasswordField
            id="reset-password"
            label="New password"
            show={showPassword}
            onToggleShow={() => setShowPassword((s) => !s)}
            autoComplete="new-password"
            strength={newPassword ? calculatePasswordStrength(newPassword) : undefined}
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword")}
          />
          <SubmitButton
            pending={passwordForm.formState.isSubmitting}
            pendingLabel="Resetting…"
            label="Reset password"
            disabled={!isLoaded}
          />
        </form>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className={BACK_LINK_CLASS}>
        <ArrowLeftIcon className="w-4 h-4" /> Back to login
      </Link>
      <StepHeader title="Forgot password?" description="Enter your email and we'll send you a reset code." />
      <form onSubmit={handleRequestReset} className="space-y-4">
        <FormField
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
          disabled={!isLoaded}
        />
      </form>
    </div>
  );
}
