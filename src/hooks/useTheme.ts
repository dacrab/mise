import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

/** Selectable themes, in cycle order. Shared by the header toggle and settings. */
export const THEME_OPTIONS = [
  { value: "light", label: "Light", ariaLabel: "Light mode", icon: SunIcon },
  { value: "dark", label: "Dark", ariaLabel: "Dark mode", icon: MoonIcon },
  { value: "system", label: "System", ariaLabel: "System theme", icon: ComputerDesktopIcon },
] as const;

export function themeOption(preference: ThemePreference) {
  return THEME_OPTIONS.find((option) => option.value === preference) ?? THEME_OPTIONS[0];
}

export function nextTheme(preference: ThemePreference): ThemePreference {
  const index = THEME_OPTIONS.findIndex((option) => option.value === preference);
  return THEME_OPTIONS[(index + 1) % THEME_OPTIONS.length]?.value ?? "light";
}

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

function readPreference(): ThemePreference {
  try {
    return parsePreference(localStorage.getItem(THEME_KEY));
  } catch {
    // Storage can throw when cookies/site data are blocked (e.g. private mode).
    return "system";
  }
}

function writePreference(pref: ThemePreference) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Ignore: the in-memory store still updates for this session.
  }
}

function getSnapshot(): ThemePreference {
  return readPreference();
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
      if (readPreference() === "system") {
        applyTheme(getSystemTheme());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((pref: ThemePreference) => {
    writePreference(pref);
    applyTheme(resolveTheme(pref));
    for (const listener of listeners) listener();
  }, []);

  return { preference, setTheme };
}
