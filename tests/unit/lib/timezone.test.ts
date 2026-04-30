import { describe, expect, it } from "vitest";
import {
  dayOfWeekInZone,
  formatWithZoneLabel,
  getOffsetMinutes,
  isValidIanaTimezone,
  isoHasExplicitZone,
  assertIsoHasZoneOrThrow,
  salonLocalParts,
  todayInZone,
  wallClockToUtc,
} from "@/lib/timezone";

/**
 * lib/timezone.ts is the single source of truth for every timestamp the app
 * stores or displays. A bug here cascades into wrong booking times, missed
 * appointments, and broken availability — so this file gets the most careful
 * coverage in the suite.
 *
 * The DST cases at the bottom are non-negotiable: they regression-guard the
 * "spring forward" and "fall back" seams which were the original source of
 * the h23 / hourCycle fix in `getOffsetMinutes`.
 */

describe("isValidIanaTimezone", () => {
  it("accepts standard IANA zones", () => {
    expect(isValidIanaTimezone("Europe/Amsterdam")).toBe(true);
    expect(isValidIanaTimezone("America/New_York")).toBe(true);
    expect(isValidIanaTimezone("UTC")).toBe(true);
  });

  it("rejects garbage", () => {
    expect(isValidIanaTimezone("")).toBe(false);
    expect(isValidIanaTimezone("Not/A/Zone")).toBe(false);
    // @ts-expect-error — intentionally probing wrong type
    expect(isValidIanaTimezone(undefined)).toBe(false);
  });
});

describe("isoHasExplicitZone", () => {
  it("accepts Z and ±HH:MM suffixes", () => {
    expect(isoHasExplicitZone("2026-04-28T13:00:00Z")).toBe(true);
    expect(isoHasExplicitZone("2026-04-28T13:00:00+02:00")).toBe(true);
    expect(isoHasExplicitZone("2026-04-28T13:00:00-05:00")).toBe(true);
    // Compact offset without colon — accepted because some libraries emit it.
    expect(isoHasExplicitZone("2026-04-28T13:00:00+0200")).toBe(true);
  });

  it("rejects naked local time — the rule that catches the most bugs", () => {
    expect(isoHasExplicitZone("2026-04-28T13:00:00")).toBe(false);
    expect(isoHasExplicitZone("2026-04-28 13:00:00")).toBe(false);
    expect(isoHasExplicitZone("13:00")).toBe(false);
    expect(isoHasExplicitZone("")).toBe(false);
  });

  it("assertIsoHasZoneOrThrow throws with the field name in the message", () => {
    expect(() =>
      assertIsoHasZoneOrThrow("2026-04-28T13:00:00", "booked_at")
    ).toThrow(/booked_at/);
    expect(() =>
      assertIsoHasZoneOrThrow("2026-04-28T13:00:00Z", "booked_at")
    ).not.toThrow();
  });
});

describe("wallClockToUtc — Europe/Amsterdam", () => {
  it("converts a summer (CEST, +02:00) wall-clock to UTC", () => {
    // 2026-07-15 14:00 Amsterdam → 12:00:00Z
    const utc = wallClockToUtc("2026-07-15", "14:00", "Europe/Amsterdam");
    expect(utc.toISOString()).toBe("2026-07-15T12:00:00.000Z");
  });

  it("converts a winter (CET, +01:00) wall-clock to UTC", () => {
    // 2026-12-15 14:00 Amsterdam → 13:00:00Z
    const utc = wallClockToUtc("2026-12-15", "14:00", "Europe/Amsterdam");
    expect(utc.toISOString()).toBe("2026-12-15T13:00:00.000Z");
  });

  it("midnight does not roll into the previous day (h23 regression)", () => {
    // Documented regression in lib/timezone.ts: en-US hour12=false used to
    // emit hour=24 with the wrong calendar day on midnight, producing a
    // result one day earlier than expected. h23 hourCycle fixes it.
    // 2026-04-30 00:00 Amsterdam (CEST, +02:00) → 2026-04-29T22:00:00Z
    const utc = wallClockToUtc("2026-04-30", "00:00", "Europe/Amsterdam");
    expect(utc.toISOString()).toBe("2026-04-29T22:00:00.000Z");
  });

  it("rejects malformed dates", () => {
    expect(() =>
      wallClockToUtc("2026/04/30", "12:00", "Europe/Amsterdam")
    ).toThrow(/Invalid date/);
  });

  it("rejects malformed times", () => {
    expect(() =>
      wallClockToUtc("2026-04-30", "12-00", "Europe/Amsterdam")
    ).toThrow(/Invalid time/);
  });

  it("rejects invalid IANA zones", () => {
    expect(() =>
      wallClockToUtc("2026-04-30", "12:00", "Mars/Olympus")
    ).toThrow(/Invalid IANA timezone/);
  });
});

describe("wallClockToUtc — DST seams (the non-negotiable cases)", () => {
  // Europe/Amsterdam DST 2026:
  //   spring forward: 2026-03-29 02:00 local → jumps to 03:00. 02:30 doesn't exist.
  //   fall back:      2026-10-25 03:00 local → falls back to 02:00. 02:30 happens twice.

  it("spring-forward 'gap' time (02:30 on 2026-03-29) is deterministic and valid", () => {
    // 02:30 local doesn't exist on this day, but the function must still
    // return *some* deterministic UTC instant rather than crashing or
    // returning Invalid Date. We assert it round-trips to a real instant.
    const utc = wallClockToUtc("2026-03-29", "02:30", "Europe/Amsterdam");
    expect(Number.isFinite(utc.getTime())).toBe(true);
    // Either right before the jump (CET, 01:30Z) or right after (CEST, 00:30Z).
    // Both are defensible; we just need non-NaN and stable.
    expect(["2026-03-29T01:30:00.000Z", "2026-03-29T00:30:00.000Z"]).toContain(
      utc.toISOString()
    );
  });

  it("fall-back 'ambiguous' time (02:30 on 2026-10-25) is deterministic", () => {
    // 02:30 local happens twice this day. We require *one* deterministic
    // answer, not Invalid Date, and not a different answer on every call.
    const a = wallClockToUtc("2026-10-25", "02:30", "Europe/Amsterdam");
    const b = wallClockToUtc("2026-10-25", "02:30", "Europe/Amsterdam");
    expect(a.toISOString()).toBe(b.toISOString());
    // Acceptable answers: 00:30Z (first 02:30 CEST) or 01:30Z (second 02:30 CET).
    expect(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"]).toContain(
      a.toISOString()
    );
  });

  it("just before and just after spring-forward differ by an hour of UTC", () => {
    // 01:30 local on the spring-forward day is unambiguously CET (+01:00).
    // 03:30 local is unambiguously CEST (+02:00). One hour of wall-clock
    // separates them but only one hour of *UTC* — they should be 1h apart.
    const before = wallClockToUtc("2026-03-29", "01:30", "Europe/Amsterdam");
    const after = wallClockToUtc("2026-03-29", "03:30", "Europe/Amsterdam");
    const diffHours = (after.getTime() - before.getTime()) / 3_600_000;
    expect(diffHours).toBe(1);
  });
});

describe("getOffsetMinutes", () => {
  it("Europe/Amsterdam in summer is +120", () => {
    const summer = new Date("2026-07-15T12:00:00Z");
    expect(getOffsetMinutes(summer, "Europe/Amsterdam")).toBe(120);
  });

  it("Europe/Amsterdam in winter is +60", () => {
    const winter = new Date("2026-12-15T12:00:00Z");
    expect(getOffsetMinutes(winter, "Europe/Amsterdam")).toBe(60);
  });

  it("America/New_York in winter is -300", () => {
    const winter = new Date("2026-12-15T17:00:00Z");
    expect(getOffsetMinutes(winter, "America/New_York")).toBe(-300);
  });

  it("UTC is always 0", () => {
    expect(getOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "UTC")).toBe(0);
    expect(getOffsetMinutes(new Date("2026-12-15T12:00:00Z"), "UTC")).toBe(0);
  });
});

describe("salonLocalParts", () => {
  it("decomposes a UTC instant into Amsterdam wall-clock parts", () => {
    // 2026-07-15T12:00:00Z = 14:00 CEST on Wed
    const parts = salonLocalParts(
      new Date("2026-07-15T12:00:00Z"),
      "Europe/Amsterdam"
    );
    expect(parts).toEqual({
      year: 2026,
      month: 7,
      day: 15,
      weekday: 3, // Wednesday
      hour: 14,
      minute: 0,
    });
  });

  it("handles the midnight boundary correctly (h23 regression)", () => {
    // 2026-04-29T22:00:00Z is exactly 2026-04-30 00:00 in Amsterdam (CEST).
    // The bug we're guarding against returned 2026-04-29 24:00 with the
    // wrong calendar day. h23 forces 00:00 with the correct date.
    const parts = salonLocalParts(
      new Date("2026-04-29T22:00:00Z"),
      "Europe/Amsterdam"
    );
    expect(parts.day).toBe(30);
    expect(parts.hour).toBe(0);
    expect(parts.minute).toBe(0);
  });

  it("month is 1-indexed (not 0-indexed like Date#getMonth)", () => {
    const parts = salonLocalParts(
      new Date("2026-01-15T12:00:00Z"),
      "Europe/Amsterdam"
    );
    expect(parts.month).toBe(1);
  });
});

describe("dayOfWeekInZone", () => {
  it("returns the right weekday in the salon's zone, not the server's", () => {
    // 2026-04-30 is a Thursday everywhere. Sunday=0, ..., Sat=6.
    expect(dayOfWeekInZone("2026-04-30", "Europe/Amsterdam")).toBe(4);
    expect(dayOfWeekInZone("2026-04-30", "America/New_York")).toBe(4);
  });

  it("midday probe means negative-offset zones don't roll back a day", () => {
    // A Sunday in Amsterdam stays Sunday when interpreted in NY (despite the
    // -5 offset) because dayOfWeekInZone uses 12:00 UTC as the probe point.
    expect(dayOfWeekInZone("2026-05-03", "America/New_York")).toBe(0);
  });
});

describe("todayInZone", () => {
  it("returns a YYYY-MM-DD string", () => {
    const today = todayInZone("Europe/Amsterdam");
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatWithZoneLabel", () => {
  it("appends the short zone abbreviation in summer", () => {
    const summer = new Date("2026-07-15T12:00:00Z");
    const out = formatWithZoneLabel(summer, "Europe/Amsterdam");
    expect(out).toMatch(/^14:00 /);
    // Don't pin the exact abbrev — ICU on different runtimes may emit
    // "CEST" or "GMT+2". Both are acceptable. We just want a non-empty label.
    expect(out.length).toBeGreaterThan("14:00 ".length);
  });
});
