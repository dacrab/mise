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
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-brand-primary font-bold hover:underline">Sign In</a>
      </p>
    </div>
  );
}