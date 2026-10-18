import { forwardRef } from "react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  prefix?: string;
  hint?: string;
}

// The label floats out of the field on focus or once the input has content,
// using the native :focus / :placeholder-shown states instead of React state.
// The caller's placeholder is kept transparent until focus so it never collides
// with the resting label it sits on top of.
const FLOATED =
  "peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-medium peer-focus:floating-label-bg peer-focus:px-1 peer-focus:text-sage peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:floating-label-bg peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-sage";

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
            className={`peer field-base ${prefix ? "pl-8" : ""} focus:field-focus placeholder:text-transparent! focus:placeholder:text-stone/50 dark:focus:placeholder:text-d-text-muted`}
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
              className={`absolute top-3 text-sm text-stone pointer-events-none transition-all duration-200 ${
                prefix ? "left-8 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3" : "left-3"
              } ${FLOATED}`}
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
