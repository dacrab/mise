const AVATAR_SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };

export function Avatar({
  src,
  name,
  size = "sm",
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = AVATAR_SIZES[size];
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <div className={`${sizeClass} rounded-full bg-sage/15 overflow-hidden shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name ?? ""} className="w-full h-full object-cover" />
      ) : (
        <div className="center w-full h-full text-sage font-medium">
          {initial}
        </div>
      )}
    </div>
  );
}

export function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function ProgressBar({
  value,
  label,
  className = "",
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <p className="text-xs text-stone">{label}</p>}
      <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-sage rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
