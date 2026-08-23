import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function parsePreference(raw: string | null): ThemePreference {
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

// Module-level store keeps every useTheme() instance (Header toggle, Settings
// options) in sync; the storage event covers cross-tab changes.
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): ThemePreference {
  return parsePreference(localStorage.getItem(THEME_KEY));
}

function getServerSnapshot(): ThemePreference {
  return "system";
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(resolveTheme(preference));
  }, [preference]);

  useEffect(() => {
    const mq = window.matchMedia(MEDIA_QUERY);
    const handler = () => {
      if (parsePreference(localStorage.getItem(THEME_KEY)) === "system") {
        applyTheme(getSystemTheme());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((pref: ThemePreference) => {
    if (pref === "system") {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, pref);
    }
    applyTheme(resolveTheme(pref));
    for (const listener of listeners) listener();
  }, []);

  return { preference, setTheme };
}
