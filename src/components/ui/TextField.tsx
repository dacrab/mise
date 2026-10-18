import { forwardRef } from "react";
import { FIELD_LABEL, FIELD_PLACEHOLDER, FLOATED_LABEL } from "./Field";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  prefix?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, prefix, hint, className = "", ...rest }, ref) => {
    const hintId = `${id}-hint`;

    return (
      <div className={className}>
        <div className="relative group">
          <input
            ref={ref}
            id={id}
            aria-describedby={hint ? hintId : undefined}
            className={`peer field-base ${prefix ? "pl-8" : ""} focus:field-focus ${FIELD_PLACEHOLDER}`}
            {...rest}
          />
          {prefix && (
            <span className="absolute left-3 top-3 text-sm text-stone pointer-events-none peer-focus:text-sage">
              {prefix}
            </span>
          )}
          {label && (
            <label
              htmlFor={id}
              className={`${FIELD_LABEL} transition-all duration-200 ${
                prefix ? "left-8 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3" : "left-3"
              } ${FLOATED_LABEL}`}
            >
              {label}
            </label>
          )}
        </div>
        {hint && (
          <p id={hintId} className="text-[11px] text-stone mt-1.5 ml-1">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";
