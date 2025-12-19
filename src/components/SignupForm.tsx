import { useState, useMemo } from "react";
import { authClient } from "../lib/auth-client";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, [password]);

  const strengthColor = useMemo(() => {
    switch (passwordStrength) {
      case 0: return "bg-zinc-200";
      case 1: return "bg-red-400";
      case 2: return "bg-orange-400";
      case 3: return "bg-yellow-400";
      case 4: return "bg-green-500";
      default: return "bg-zinc-200";
    }
  }, [passwordStrength]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0: return "Too weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "Too weak";
    }
  }, [passwordStrength]);

  const handleSignup = async () => {
    if (!username.trim()) {
        alert("Please choose a username");
        return;
    }
    if (passwordStrength < 2) {
        alert("Please use a stronger password");
        return;
    }

    setLoading(true);
    await authClient.signUp.email({
      email,
      password,
      name,
      username,
      callbackURL: "/dashboard",
    } as any, {
        onSuccess: () => {
            window.location.href = "/dashboard";
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setLoading(false);
        }
    });
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl shadow-black/5 border border-brand-border animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 font-serif">Join the Kitchen</h1>
        <p className="text-gray-500 text-sm">Create an account to start sharing recipes.</p>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="display-name" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Display Name</label>
          <input 
            id="display-name"
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Chef Gusteau"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Username (@)</label>
          <input 
            id="username"
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="input-field"
            placeholder="chef_gusteau"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
          <input 
            id="email"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="chef@recipeswap.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Password</label>
          <input 
            id="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
          />
          
          {password && (
            <div className="pt-2 space-y-2 px-1">
                <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-full transition-colors duration-500 ${i <= passwordStrength ? strengthColor : 'bg-zinc-100'}`}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-zinc-400">Strength</span>
                    <span className={passwordStrength > 0 ? strengthColor.replace('bg-', 'text-') : 'text-zinc-400'}>
                        {strengthLabel}
                    </span>
                </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSignup}
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? "Creating account..." : "Join Community"}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">Or join via</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="btn-outline w-full py-4 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google Account
        </button>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-brand-primary font-bold hover:underline">Sign In</a>
      </p>
    </div>
  );
}
