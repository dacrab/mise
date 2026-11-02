import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function MetaStat({
  icon: Icon,
  label,
  value,
  compact = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "gap-0.5" : "gap-1.5")}>
      <Icon className={cn("text-accent", compact ? "size-4" : "size-5")} />
      <span className={cn("text-muted", compact ? "text-[10px] uppercase tracking-wide" : "text-xs")}>{label}</span>
      <span className={cn("font-medium text-ink", compact ? "text-xs" : "text-sm")}>{value}</span>
    </div>
  );
}
