export function validateLength(value: string, min: number, max: number, field: string) {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${field} must be ${min}-${max} characters`);
  }
  return trimmed;
}
