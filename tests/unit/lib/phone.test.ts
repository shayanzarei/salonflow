import { describe, expect, it } from "vitest";
import { isValidPhone, normalizePhoneInput, PHONE_INPUT_PATTERN } from "@/lib/phone";

/**
 * Phone validation lives at the customer-booking boundary. A bug here either
 * (a) rejects valid customers — bad UX, lost bookings — or (b) lets through
 * malformed numbers that break SMS notifications later. Both are visible
 * customer impact, so the rules need lock-in.
 */

describe("normalizePhoneInput", () => {
  it("strips spaces, parens, and dashes", () => {
    expect(normalizePhoneInput("+31 (6) 12-34-56-78")).toBe("+31612345678");
  });

  it("converts a leading 00 to a + prefix", () => {
    expect(normalizePhoneInput("0031612345678")).toBe("+31612345678");
  });

  it("returns null for empty / whitespace input", () => {
    expect(normalizePhoneInput("")).toBeNull();
    expect(normalizePhoneInput("   ")).toBeNull();
    expect(normalizePhoneInput(null)).toBeNull();
    expect(normalizePhoneInput(undefined)).toBeNull();
  });

  it("preserves a number that's already normalized", () => {
    expect(normalizePhoneInput("+31612345678")).toBe("+31612345678");
  });
});

describe("isValidPhone", () => {
  it("accepts a typical Dutch mobile (+31)", () => {
    expect(isValidPhone("+31 6 12 34 56 78")).toBe(true);
  });

  it("accepts a US number (+1)", () => {
    expect(isValidPhone("+1 (555) 123-4567")).toBe(true);
  });

  it("accepts a number with no country code, ≥7 digits", () => {
    expect(isValidPhone("0612345678")).toBe(true);
    expect(isValidPhone("1234567")).toBe(true);
  });

  it("treats empty / null / undefined as valid (the field is optional)", () => {
    // The booking widget's phone field is optional; an empty value must pass
    // validation rather than block the booking.
    expect(isValidPhone(null)).toBe(true);
    expect(isValidPhone(undefined)).toBe(true);
    expect(isValidPhone("")).toBe(true);
    expect(isValidPhone("   ")).toBe(true);
  });

  it("rejects too-short numbers", () => {
    expect(isValidPhone("+1 234")).toBe(false);
    expect(isValidPhone("12345")).toBe(false);
  });

  it("rejects numbers starting with +0", () => {
    // Country code can't be 0 — the regex enforces ^\+[1-9].
    expect(isValidPhone("+0123456789")).toBe(false);
  });

  it("rejects a number with letters", () => {
    expect(isValidPhone("+31 6 ABCDEFGH")).toBe(false);
  });

  it("rejects too-long numbers (>15 digits per E.164)", () => {
    expect(isValidPhone("+1234567890123456")).toBe(false);
  });
});

describe("PHONE_INPUT_PATTERN", () => {
  it("matches what the form's HTML pattern attribute should accept", () => {
    const re = new RegExp(PHONE_INPUT_PATTERN);
    expect(re.test("+31 6 12 34 56 78")).toBe(true);
    expect(re.test("0612345678")).toBe(true);
    // Too short (< 7 chars):
    expect(re.test("12345")).toBe(false);
    // Letters:
    expect(re.test("ABCDEFG")).toBe(false);
  });
});
