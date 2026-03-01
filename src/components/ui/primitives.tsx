interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function Avatar({ src, name, size = "sm", className = "" }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const initial = name?.charAt(0).toUpperCase() ?? "?";

  if (src) {
    return (
      <img src={src} alt={name ?? ""} className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`} />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-sage/20 flex items-center justify-center text-sage font-medium shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = "w-4 h-4" }: SpinnerProps) {
  return (
    <svg className={`${className} animate-spin shrink-0`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-sage rounded-full transition-all duration-200"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? "Progress"}
        />
      </div>
      {label && <p className="text-xs text-sage text-center mt-1">{value}%</p>}
    </div>
  );
}
