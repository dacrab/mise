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
