import { Select as BaseSelect } from "@base-ui-components/react/select";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  name?: string | undefined;
  id?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select...", name, id, className = "" }: SelectProps) {
  const displayValue = value ? options.find((o) => o.value === value)?.label : placeholder;

  return (
    // value="" is a valid reset — don't coerce to undefined or the placeholder won't show
    <BaseSelect.Root value={value} onValueChange={(v) => onChange(v ?? "")} name={name}>
      <BaseSelect.Trigger
        id={id}
        className={`flex items-center justify-between gap-2 px-3 py-2.5 bg-cream-dark rounded-lg text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/20 cursor-pointer ${className}`}
      >
        <span className={!value ? "text-stone" : ""}>{displayValue}</span>
        <BaseSelect.Icon>
          <ChevronUpDownIcon className="w-4 h-4 text-stone" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50" sideOffset={4}>
          <BaseSelect.Popup className="max-h-60 overflow-y-auto bg-warm-white rounded-lg shadow-card border border-cream-dark py-1">
            {options.map((opt) => (
              <BaseSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal cursor-pointer outline-none data-[highlighted]:bg-cream-dark"
              >
                <BaseSelect.ItemIndicator className="w-4">
                  <CheckIcon className="w-4 h-4 text-sage" />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
