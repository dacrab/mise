import { Progress } from "@base-ui-components/react/progress";

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" } as const;

export function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-sage/20 text-sage-dark flex items-center justify-center font-medium shrink-0 ${className}`}
    >
      {src ? <img src={src} alt={name ?? "Avatar"} className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

export function Spinner({ className = "w-5 h-5 text-sage" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function ProgressBar({ value, label, className = "" }: { value: number; label?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <Progress.Root value={pct} className={`space-y-1 ${className}`}>
      {label && <Progress.Label className="text-xs text-stone">{label}</Progress.Label>}
      <Progress.Track className="h-1.5 rounded-full surface-raised overflow-hidden">
        <Progress.Indicator className="h-full bg-sage rounded-full transition-all duration-300" />
      </Progress.Track>
    </Progress.Root>
  );
}
