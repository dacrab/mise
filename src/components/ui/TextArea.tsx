import { useEffect, useRef } from "react";
import { FIELD_LABEL, FIELD_PLACEHOLDER, FLOATED_LABEL } from "./Field";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  maxLength?: number;
}

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
        className={`peer field-base resize-none leading-relaxed focus:field-focus ${FIELD_PLACEHOLDER}`}
        {...rest}
      />
      {label && (
        <label htmlFor={id} className={`${FIELD_LABEL} left-3 ${FLOATED_LABEL}`}>
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
