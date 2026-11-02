import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const selectedLabel = value ? (options.find((option) => option.value === value)?.label ?? value) : null;

  return (
    <BaseSelect.Root value={value} onValueChange={(next) => onChange(typeof next === "string" ? next : "")}>
      <BaseSelect.Trigger
        id={id}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-left text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15",
          className,
        )}
      >
        <span className={selectedLabel ? undefined : "text-muted"}>{selectedLabel ?? placeholder}</span>
        <BaseSelect.Icon>
          <ChevronUpDownIcon className="size-4 text-muted" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50" sideOffset={4}>
          <BaseSelect.Popup className="max-h-60 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-soft">
            {options.map((option) => (
              <BaseSelect.Item key={option.value} value={option.value} className="menu-item">
                <BaseSelect.ItemIndicator className="w-4">
                  <CheckIcon className="size-4 text-accent" />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
