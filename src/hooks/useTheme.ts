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

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const pref: ThemePreference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const res = pref === "system" ? getSystemTheme() : pref;
    setPreferenceState(pref);
    applyTheme(res);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        applyTheme(getSystemTheme());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    if (pref === "system") {
      localStorage.removeItem("theme");
      applyTheme(getSystemTheme());
    } else {
      localStorage.setItem("theme", pref);
      applyTheme(pref);
    }
  }, []);

  return { preference, setTheme };
}
