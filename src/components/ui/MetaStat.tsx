import type { ComponentType } from "react";

export function MetaStat({
  icon: Icon,
  label,
  value,
  className = "flex flex-col items-center gap-1 min-w-[70px]",
  iconClassName = "w-5 h-5 text-sage",
  labelClassName = "text-xs text-stone",
  valueClassName = "text-sm font-semibold text-primary",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <Icon className={iconClassName} />
      <span className={labelClassName}>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
