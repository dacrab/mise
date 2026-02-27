// Recipe page widgets: CookingNow presence indicator, CookingTimers, TrendingRecipes, RecommendedRecipes
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { PlayIcon, PauseIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function CookingNow({ recipeId }: { recipeId: Id<"recipes"> }) {
  const cooking = useQuery(api.presence.getCooking, { recipeId });
  const heartbeatMutation = useMutation(api.presence.heartbeat);
  const leaveMutation = useMutation(api.presence.leave);
  const heartbeatRef = useRef(heartbeatMutation);
  const leaveRef = useRef(leaveMutation);
  heartbeatRef.current = heartbeatMutation;
  leaveRef.current = leaveMutation;

  useEffect(() => {
    heartbeatRef.current({ recipeId });
    const interval = setInterval(() => heartbeatRef.current({ recipeId }), 10_000);
    return () => { clearInterval(interval); leaveRef.current({ recipeId }); };
  }, [recipeId]);

  if (!cooking || cooking.count <= 1) return null;
  const others = cooking.count - 1;
  const names = cooking.users.map((u: { name?: string } | null) => u?.name ?? "Someone").slice(0, 2);
  const label = names.length > 0
    ? `${names.join(", ")}${others > names.length ? ` +${others - names.length}` : ""}`
    : `${others} ${others === 1 ? "person" : "people"}`;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-sage/10 rounded-full text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
      </span>
      <span className="text-sage-dark">{label} cooking now</span>
    </div>
  );
}

interface Timer { id: string; label: string; duration: number; remaining: number; running: boolean; }

export function CookingTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => prev.map((t) => {
        if (!t.running || t.remaining <= 0) return t;
        const remaining = t.remaining - 1;
        if (remaining === 0) {
          new Audio("/timer-done.mp3").play().catch(() => {});
          if (typeof Notification !== "undefined" && Notification.permission === "granted") new Notification(`Timer done: ${t.label}`);
        }
        return { ...t, remaining };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = () => {
    if (!newLabel.trim()) return;
    setTimers((prev) => [...prev, { id: crypto.randomUUID(), label: newLabel, duration: newMinutes * 60, remaining: newMinutes * 60, running: false }]);
    setNewLabel("");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="card p-5">
      <h3 className="font-serif text-lg font-medium mb-4">Cooking Timers</h3>
      <div className="flex gap-2 mb-4">
        <label htmlFor="timer-label" className="sr-only">Timer name</label>
        <input id="timer-label" type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTimer()} placeholder="Timer name" className="input-field flex-1 py-2 text-sm" />
        <label htmlFor="timer-minutes" className="sr-only">Minutes</label>
        <input id="timer-minutes" type="number" value={newMinutes} onChange={(e) => setNewMinutes(Number(e.target.value))} min={1} max={180} className="input-field w-16 py-2 text-sm text-center" aria-label="Minutes" />
        <button onClick={addTimer} disabled={!newLabel.trim()} className="btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed">Add</button>
      </div>
      <div className="space-y-2">
        {timers.length === 0 && <p className="text-sm text-stone text-center py-4">No timers yet</p>}
        {timers.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg ${t.remaining === 0 ? "bg-terracotta/10" : "bg-cream-dark"}`}>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{t.label}</p>
              <p className={`text-xl font-mono ${t.remaining === 0 ? "text-terracotta" : "text-charcoal"}`}>{fmt(t.remaining)}</p>
            </div>
            <button onClick={() => setTimers((prev) => prev.map((x) => x.id === t.id ? { ...x, running: !x.running } : x))} className="btn-ghost p-2" aria-label={t.running ? `Pause ${t.label}` : `Start ${t.label}`}>
              {t.running ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <button onClick={() => setTimers((prev) => prev.map((x) => x.id === t.id ? { ...x, remaining: x.duration, running: false } : x))} className="btn-ghost p-2" aria-label={`Reset ${t.label}`}><ArrowPathIcon className="w-5 h-5" /></button>
            <button onClick={() => setTimers((prev) => prev.filter((x) => x.id !== t.id))} className="btn-ghost p-2 text-terracotta" aria-label={`Remove ${t.label}`}><XMarkIcon className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendingRecipes() {
  const recipes = useQuery(api.discovery.trending, { limit: 6 }) ?? [];
  if (recipes.length === 0) return null;
  return (
    <section>
      <h2 className="font-serif text-2xl font-medium mb-6">Trending this week</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, i) => (
          <RecipeCard key={recipe._id} recipeId={recipe._id} slug={recipe.slug} title={recipe.title} category={recipe.category} coverImageUrl={recipe.coverImageUrl} badge={i < 3 ? String(i + 1) : undefined} meta={<span className="text-xs text-stone">{recipe.trendingScore} likes this week</span>} />
        ))}
      </div>
    </section>
  );
}

export function RecommendedRecipes() {
  const recipes = useQuery(api.discovery.recommendations, { limit: 6 }) ?? [];
  if (recipes.length === 0) return null;
  return (
    <section>
      <h2 className="font-serif text-2xl font-medium mb-6">Recommended for you</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipeId={recipe._id} slug={recipe.slug} title={recipe.title} category={recipe.category} coverImageUrl={recipe.coverImageUrl ?? null} />
        ))}
      </div>
    </section>
  );
}
