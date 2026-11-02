import type { FieldError as RHFFieldError } from "react-hook-form";

export function FieldError({ id, error }: { id: string; error?: RHFFieldError | { message?: string } }) {
  if (!error?.message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      {error.message}
    </p>
  );
}
