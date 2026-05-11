import type { FieldError as RHFFieldError } from "react-hook-form";

export function FieldError({ error }: { error?: RHFFieldError | { message?: string } }) {
  if (!error?.message) return null;
  return <p className="text-xs text-terracotta mt-1">{error.message}</p>;
}
