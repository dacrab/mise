
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link } from "@tanstack/react-router";
import { FormField, FormError } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("flow", "reset");
      await signIn("password", formData);
      setStep("code");
      toast("Reset code sent to your email", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim()) return;
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", code);
      formData.set("newPassword", newPassword);
      formData.set("flow", "reset-verification");
      await signIn("password", formData);
      toast("Password reset successfully!", "success");
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code or could not reset password");
    } finally {
      setLoading(false);
    }
  };

  if (step === "code") {
    return (
      <div>
        <button onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-stone hover:text-charcoal mb-6">
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
        <h1 className="font-serif text-2xl font-medium mb-2">Enter reset code</h1>
        <p className="text-stone mb-6">We sent a code to {email}</p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <FormField label="Reset code" type="text" value={code} onChange={setCode} placeholder="Enter code" />
          <FormField label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="At least 8 characters" />
          {error && <FormError message={error} />}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="flex items-center gap-1 text-sm text-stone hover:text-charcoal mb-6">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to login
      </Link>
      <h1 className="font-serif text-2xl font-medium mb-2">Forgot password?</h1>
      <p className="text-stone mb-6">Enter your email and we'll send you a reset code.</p>
      <form onSubmit={handleRequestReset} className="space-y-4">
        <FormField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        {error && <FormError message={error} />}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending..." : "Send reset code"}
        </button>
      </form>
    </div>
  );
}
