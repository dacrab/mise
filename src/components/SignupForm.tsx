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
          onClick={async () => {
            await authClient.signIn.social({
              provider: "github",
              callbackURL: "/dashboard",
            });
          }}
          className="btn-outline w-full py-4 flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Join with GitHub
        </button>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-brand-primary font-bold hover:underline">Sign In</a>
      </p>
    </div>
  );
}