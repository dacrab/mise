import type { FieldError as RHFFieldError } from "react-hook-form";

// Drives the floating label used by TextField/TextArea purely from native
// focus and :placeholder-shown state, so no React state is needed.
export const FLOATED_LABEL =
  "peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:font-medium peer-focus:floating-label-bg peer-focus:px-1 peer-focus:text-sage peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:floating-label-bg peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-sage";

/** Resting position shared by the floating labels of TextField/TextArea. */
export const FIELD_LABEL = "absolute top-3 text-sm text-stone pointer-events-none";

// Keeps the native placeholder invisible until focus so it never collides with
// the resting label sitting on top of it.
export const FIELD_PLACEHOLDER =
  "placeholder:text-transparent! focus:placeholder:text-stone/50 dark:focus:placeholder:text-d-text-muted";

/** Inline validation message shown under a form control. */
export function FieldError({ id, error }: { id: string; error?: RHFFieldError | { message?: string } }) {
  if (!error?.message) return null;
  return (
    <p id={id} className="field-error">
      {error.message}
    </p>
  );
}
