import { useCallback, useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemePreference | null;
    const pref = stored ?? "system";
    const res = pref === "system" ? getSystemTheme() : pref;
    setPreferenceState(pref);
    setResolved(res);
    applyTheme(res);

    // Listen for system changes when in system mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        const sys = getSystemTheme();
        setResolved(sys);
        applyTheme(sys);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    if (pref === "system") {
      localStorage.removeItem("theme");
      const sys = getSystemTheme();
      setResolved(sys);
      applyTheme(sys);
    } else {
      localStorage.setItem("theme", pref);
      setResolved(pref);
      applyTheme(pref);
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return { theme: resolved, preference, setTheme, toggle };
}
