import { useEffect, useRef, useState } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label?: string;
  maxLength?: number;
}

export function TextArea({
  id,
  label,
  maxLength,
  className = "",
  onFocus,
  onBlur,
  value = "",
  rows = 3,
  placeholder,
  ...rest
}: TextAreaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  });

  const strValue = typeof value === "string" ? value : "";
  const charRatio = maxLength ? strValue.length / maxLength : 0;
  const counterColor = charRatio > 0.9 ? "text-terracotta" : charRatio > 0.7 ? "text-honey" : "text-stone";
  const hasValue = strValue.length > 0;

  return (
    <div className={`relative group ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`absolute left-3 transition-all duration-200 pointer-events-none z-10 ${
            focused || hasValue
              ? "-top-2.5 text-[11px] font-medium floating-label-bg px-1 text-sage"
              : "top-3 text-sm text-stone"
          }`}
        >
          {label}
        </label>
      )}
      <textarea
        ref={internalRef}
        id={id}
        value={value}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholder={label ? (focused ? placeholder : undefined) : placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`field-base resize-none leading-relaxed ${focused ? "field-focus" : ""}`}
        {...rest}
      />
      {maxLength && (
        <div
          className={`absolute bottom-2 right-3 text-[11px] tabular-nums transition-opacity ${
            focused || hasValue ? "opacity-100" : "opacity-0"
          } ${counterColor}`}
        >
          {strValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
