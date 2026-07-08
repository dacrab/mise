import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  id: string;
  label?: string;
  maxLength?: number;
  /** Convenience handler that receives the string value directly */
  onValueChange?: (value: string) => void;
  /** Native onChange handler (for react-hook-form register()) */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      maxLength,
      onValueChange,
      onChange,
      className = "",
      onFocus,
      onBlur,
      value = "",
      rows = 3,
      placeholder,
      ...rest
    },
    externalRef,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const [focused, setFocused] = useState(false);

    const setRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        internalRef.current = el;
        if (typeof externalRef === "function") externalRef(el);
        else if (externalRef) externalRef.current = el;
      },
      [externalRef],
    );

    const autoResize = useCallback(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    useEffect(() => {
      autoResize();
    }, [autoResize]);

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
          ref={setRef}
          id={id}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onChange?.(e);
            onValueChange?.(v);
          }}
          onFocus={(e) => {
            setFocused(true);
            (onFocus as React.FocusEventHandler<HTMLTextAreaElement>)?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            (onBlur as React.FocusEventHandler<HTMLTextAreaElement>)?.(e);
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
  },
);

TextArea.displayName = "TextArea";
