"use client";

import { useState, useEffect } from "react";

interface Timer {
  id: string;
  label: string;
  duration: number;
  remaining: number;
  running: boolean;
}

export function CookingTimers() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.running || t.remaining <= 0) return t;
          const remaining = t.remaining - 1;
          if (remaining === 0) {
            new Audio("/timer-done.mp3").play().catch(() => {});
            if (Notification.permission === "granted") {
              new Notification(`Timer done: ${t.label}`);
            }
          }
          return { ...t, remaining };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = () => {
    if (!newLabel.trim()) return;
    setTimers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: newLabel, duration: newMinutes * 60, remaining: newMinutes * 60, running: false },
    ]);
    setNewLabel("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card p-5">
      <h3 className="font-serif text-lg font-medium mb-4">Cooking Timers</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Timer name"
          className="input-field flex-1 py-2 text-sm"
        />
        <input
          type="number"
          value={newMinutes}
          onChange={(e) => setNewMinutes(Number(e.target.value))}
          min={1}
          max={180}
          className="input-field w-16 py-2 text-sm text-center"
        />
        <button onClick={addTimer} className="btn-primary text-sm py-2">Add</button>
      </div>

      <div className="space-y-2">
        {timers.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg ${t.remaining === 0 ? "bg-terracotta/10" : "bg-cream-dark"}`}>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{t.label}</p>
              <p className={`text-xl font-mono ${t.remaining === 0 ? "text-terracotta" : "text-charcoal"}`}>
                {formatTime(t.remaining)}
              </p>
            </div>
            <button 
              onClick={() => setTimers((prev) => prev.map((x) => x.id === t.id ? { ...x, running: !x.running } : x))} 
              className="btn-ghost p-2 text-sm"
            >
              {t.running ? "⏸" : "▶️"}
            </button>
            <button 
              onClick={() => setTimers((prev) => prev.map((x) => x.id === t.id ? { ...x, remaining: x.duration, running: false } : x))} 
              className="btn-ghost p-2 text-sm"
            >
              🔄
            </button>
            <button 
              onClick={() => setTimers((prev) => prev.filter((x) => x.id !== t.id))} 
              className="btn-ghost p-2 text-sm text-terracotta"
            >
              ✕
            </button>
          </div>
        ))}
        {timers.length === 0 && <p className="text-sm text-stone text-center py-4">No timers yet</p>}
      </div>
    </div>
  );
}
