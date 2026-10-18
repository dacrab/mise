import { useEffect, useRef } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  maxLength?: number;
}

// See TextField: the label float is driven purely by native focus state, and the
// caller's placeholder stays transparent until focus.
const FLOATED =
  "peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-medium peer-focus:floating-label-bg peer-focus:px-1 peer-focus:text-sage peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:floating-label-bg peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-sage";

export function TextArea({ id, label, maxLength, className = "", value = "", rows = 3, ...rest }: TextAreaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });

  const strValue = typeof value === "string" ? value : "";
  const charRatio = maxLength ? strValue.length / maxLength : 0;
  const counterColor = charRatio > 0.9 ? "text-terracotta" : charRatio > 0.7 ? "text-honey" : "text-stone";

  return (
    <div className={`relative group ${className}`}>
      <textarea
        ref={internalRef}
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        className="peer field-base resize-none leading-relaxed focus:field-focus placeholder:text-transparent! focus:placeholder:text-stone/50 dark:focus:placeholder:text-d-text-muted"
        {...rest}
      />
      {label && (
        <label htmlFor={id} className={`absolute left-3 top-3 text-sm text-stone pointer-events-none ${FLOATED}`}>
          {label}
        </label>
      )}
      {maxLength && (
        <div
          className={`absolute bottom-2 right-3 text-[11px] tabular-nums transition-opacity opacity-0 peer-focus:opacity-100 peer-[:not(:placeholder-shown)]:opacity-100 ${counterColor}`}
        >
          {strValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
