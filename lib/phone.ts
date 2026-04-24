export function normalizePhoneInput(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let normalized = trimmed.replace(/[\s()-]/g, "");
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }
  return normalized;
}

export function isValidPhone(value: string | null | undefined): boolean {
  if (!value) return true;
  const normalized = normalizePhoneInput(value);
  if (!normalized) return true;

  if (normalized.startsWith("+")) {
    return /^\+[1-9]\d{6,14}$/.test(normalized);
  }
  return /^[0-9]{7,15}$/.test(normalized);
}

export const PHONE_INPUT_PATTERN = "^\\+?[0-9\\s()\\-]{7,20}$";
