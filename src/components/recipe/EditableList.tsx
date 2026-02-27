interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  ariaLabel: (i: number) => string;
  numbered?: boolean;
}

function setAt(arr: string[], i: number, val: string): string[] {
  return arr.map((x, j) => (j === i ? val : x));
}

export function EditableList({ items, onChange, placeholder, addLabel, ariaLabel, numbered = false }: EditableListProps) {
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`flex gap-${numbered ? "3" : "2"}`}>
          {numbered && (
            <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0 mt-2">
              {i + 1}
            </span>
          )}
          <div className="flex-1">
            {numbered ? (
              <textarea
                className="textarea-field h-20"
                value={item}
                placeholder={placeholder}
                onChange={(e) => onChange(setAt(items, i, e.target.value))}
                aria-label={ariaLabel(i + 1)}
              />
            ) : (
              <input
                type="text"
                className="input-field"
                value={item}
                placeholder={placeholder}
                onChange={(e) => onChange(setAt(items, i, e.target.value))}
                aria-label={ariaLabel(i + 1)}
              />
            )}
            {numbered && (
              <button onClick={() => remove(i)} className="text-xs text-stone hover:text-terracotta mt-1" aria-label={`Remove item ${i + 1}`}>
                Remove
              </button>
            )}
          </div>
          {!numbered && (
            <button onClick={() => remove(i)} className="btn-ghost px-3 text-stone hover:text-terracotta" aria-label={`Remove item ${i + 1}`}>×</button>
          )}
        </div>
      ))}
      <button onClick={add} className="text-sm font-medium text-sage hover:text-sage-light">
        {addLabel}
      </button>
    </div>
  );
}
