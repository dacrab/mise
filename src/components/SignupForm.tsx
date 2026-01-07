import { useState, useMemo } from "react";
import { authClient } from "../auth-client";
import { GoogleIcon, Label, Divider } from "../lib";

const STRENGTH = [
  { color: "bg-zinc-200", label: "Too weak" },
  { color: "bg-red-400", label: "Weak" },
  { color: "bg-orange-400", label: "Fair" },
  { color: "bg-yellow-400", label: "Good" },
  { color: "bg-green-500", label: "Strong" },
];

export default function SignupForm() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const strength = useMemo(() => {
    if (!form.password) return 0;
    let s = 0;
    if (form.password.length >= 8) s++;
    if (/[A-Z]/.test(form.password)) s++;
    if (/[0-9]/.test(form.password)) s++;
    if (/[^A-Za-z0-9]/.test(form.password)) s++;
    return s;
  }, [form.password]);

  const { color, label } = STRENGTH[strength];

  const handleSignup = async () => {
    if (!form.username.trim()) return alert("Please choose a username");
    if (strength < 2) return alert("Please use a stronger password");

    setLoading(true);
    await authClient.signUp.email({
      email: form.email, password: form.password, name: form.name, username: form.username, callbackURL: "/dashboard",
    } as any, {
      onSuccess: () => { window.location.href = "/dashboard"; },
      onError: (ctx) => { alert(ctx.error.message); setLoading(false); }
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
          <Label htmlFor="name">Display Name</Label>
          <input id="name" type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="Chef Gusteau" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username (@)</Label>
          <input id="username" type="text" value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="input-field" placeholder="chef_gusteau" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" placeholder="chef@mise.cooking" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <input id="password" type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input-field" placeholder="••••••••" />
          {form.password && (
            <div className="pt-2 space-y-2 px-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map(i => <div key={i} className={`flex-1 rounded-full transition-colors duration-500 ${i <= strength ? color : 'bg-zinc-100'}`} />)}
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-zinc-400">Strength</span>
                <span className={strength > 0 ? color.replace('bg-', 'text-') : 'text-zinc-400'}>{label}</span>
              </div>
            </div>
          )}
        </div>
        <button onClick={handleSignup} disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? "Creating account..." : "Join Community"}
        </button>
        <Divider text="Or join via" />
        <button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })} className="btn-outline w-full py-4 flex items-center justify-center gap-3">
          <GoogleIcon /> Google Account
        </button>
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account? <a href="/login" className="text-brand-primary font-bold hover:underline">Sign In</a>
      </p>
    </div>
  );
}
