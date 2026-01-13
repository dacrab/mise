import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { GoogleIcon, Divider } from "../lib";
import { withConvex } from "../convex";

function LoginFormInner() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn("password", { email, password, flow: "signIn" });
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { redirectTo: "/dashboard" });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl shadow-black/5 border border-brand-border animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 font-serif">Welcome Back</h1>
        <p className="text-gray-500 text-sm">Sign in to manage your culinary collection</p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="chef@mise.cooking"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
        </div>
        <button onClick={handleSignIn} disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? "Verifying..." : "Sign in to Dashboard"}
        </button>
        <Divider text="Or continue with" />
        <button onClick={handleGoogleSignIn} className="btn-outline w-full py-4 flex items-center justify-center gap-3">
          <GoogleIcon /> Google Account
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-gray-400">
        By signing in, you agree to our community guidelines.
      </p>
    </div>
  );
}

export default withConvex(LoginFormInner);
