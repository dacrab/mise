import { forwardRef, useState } from "react";

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label?: string;
  prefix?: string;
  hint?: string;
  /** Convenience handler that receives the string value directly */
  onValueChange?: (value: string) => void;
  /** Native onChange handler (for react-hook-form register()) */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { id, label, prefix, hint, onValueChange, onChange, className = "", onFocus, onBlur, value, placeholder, ...rest },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasValue = typeof value === "string" ? value.length > 0 : false;

    return (
      <div className={className}>
        <div className="relative group">
          {label && (
            <label
              htmlFor={id}
              className={`absolute transition-all duration-200 pointer-events-none ${prefix ? "left-8" : "left-3"} ${
                focused || hasValue
                  ? "-top-2.5 !left-3 text-[11px] font-medium floating-label-bg px-1 text-sage"
                  : "top-3 text-sm text-stone"
              }`}
            >
              {label}
            </label>
          )}
          {prefix && (
            <span className={`absolute left-3 top-3 text-sm transition-colors ${focused ? "text-sage" : "text-stone"}`}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            value={value}
            onChange={(e) => {
              onChange?.(e);
              onValueChange?.(e.target.value);
            }}
            onFocus={(e) => {
              setFocused(true);
              (onFocus as React.FocusEventHandler<HTMLInputElement>)?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              (onBlur as React.FocusEventHandler<HTMLInputElement>)?.(e);
            }}
            placeholder={focused ? placeholder : undefined}
            className={`field-base ${prefix ? "pl-8" : ""} ${focused ? "field-focus" : ""}`}
            {...rest}
          />
        </div>
        {hint && <p className="text-[11px] text-stone mt-1.5 ml-1">{hint}</p>}
      </div>
    );
  },
);

TextField.displayName = "TextField";
