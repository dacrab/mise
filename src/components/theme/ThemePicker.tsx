import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/hooks/useTheme";

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: ComputerDesktopIcon },
] as const;

export function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-sage bg-sage/5 dark:bg-sage/10"
          : "border-stone-light/40 hover:border-stone-light dark:border-d-border-strong dark:hover:border-d-border-hover"
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-sage" : "text-stone"}`} />
      <span className={`text-xs font-medium ${active ? "text-sage" : "text-stone"}`}>{label}</span>
    </button>
  );
}

export function ThemePicker() {
  const { preference, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map(({ value, label, icon }) => (
        <ThemeOption
          key={value}
          icon={icon}
          label={label}
          active={preference === value}
          onClick={() => setTheme(value)}
        />
      ))}
    </div>
  );
}
