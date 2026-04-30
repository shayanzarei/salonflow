import { describe, expect, it } from "vitest";
import { bookingConfirmationEmail } from "@/lib/emails/booking-confirmation";

/**
 * Booking confirmation email is the most-sent transactional email in the
 * product. Two reasons it deserves dedicated unit tests:
 *
 *   1. XSS surface — every customer-supplied string (clientName, salonName,
 *      serviceName, staffName, salonAddress) is interpolated into HTML. The
 *      function does manual `replaceAll` escaping; if anyone refactors it to
 *      "use a templating library" without preserving the escapes we get a
 *      stored-XSS vector triggered by anyone who can create a salon or book
 *      an appointment.
 *
 *   2. Cancel URL construction — wrong host, wrong query string, or unescaped
 *      `&` in the URL silently breaks self-service cancellation. Customer
 *      can't cancel → calls the salon → owner is mad.
 *
 * We don't pin the entire HTML body (would break on every legitimate visual
 * tweak). Instead we assert specific invariants that match each risk above.
 */

const validBookedAt = new Date("2026-04-30T12:00:00Z"); // 14:00 in Amsterdam (CEST)

const baseInput = {
  clientName: "Sara",
  salonName: "Sara Cuts",
  serviceName: "Haircut",
  staffName: "Lena",
  bookedAt: validBookedAt,
  price: 45,
  salonAddress: "Damrak 1, Amsterdam",
  cancellationToken: "tok_abc123",
  bookingId: "bk_42",
  salonSlug: "sara-cuts",
  salonTimezone: "Europe/Amsterdam",
};

describe("bookingConfirmationEmail — subject", () => {
  it("includes service and salon name", () => {
    const { subject } = bookingConfirmationEmail(baseInput);
    expect(subject).toBe("Booking confirmed — Haircut at Sara Cuts");
  });
});

describe("bookingConfirmationEmail — XSS escaping", () => {
  it("escapes &, <, > in salonName, clientName, serviceName, staffName", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonName: 'Salon "X" & <script>alert(1)</script>',
      clientName: "<b>Sara</b>",
      serviceName: "Cut & Color",
      staffName: "<img src=x>",
    });

    // No raw <script>, <b>, or <img> from the user-supplied fields. (The
    // template itself contains plenty of legitimate HTML — we're only
    // asserting that the *injected payloads* are neutralized.)
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<b>Sara</b>");
    expect(html).not.toContain("<img src=x>");

    // The escapes are present.
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;Sara&lt;/b&gt;");
    expect(html).toContain("Cut &amp; Color");
  });

  it("escapes salonAddress when present", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonAddress: "<svg onload=alert(1)>",
    });
    expect(html).not.toContain("<svg onload=alert(1)>");
    expect(html).toContain("&lt;svg onload=alert(1)&gt;");
  });

  it("subject line does NOT escape — Resend treats subject as plain text", () => {
    // The subject is set as a header, not rendered as HTML. Pre-escaping it
    // would cause `&amp;` to literally appear in the recipient's inbox.
    // This test pins the current behavior so a well-meaning refactor doesn't
    // regress to "let's escape everything".
    const { subject } = bookingConfirmationEmail({
      ...baseInput,
      salonName: "A & B",
      serviceName: "Cut & Color",
    });
    expect(subject).toBe("Booking confirmed — Cut & Color at A & B");
  });
});

describe("bookingConfirmationEmail — cancel URL", () => {
  it("uses salonSlug-based URL when cancelBaseUrl is not provided", () => {
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html).toContain(
      "https://sara-cuts.solohub.nl/book/cancel?booking=bk_42&amp;token=tok_abc123"
    );
  });

  it("respects cancelBaseUrl override", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      cancelBaseUrl: "https://custom.example.com/",
    });
    expect(html).toContain(
      "https://custom.example.com/book/cancel?booking=bk_42&amp;token=tok_abc123"
    );
    // Trailing slash on the base URL should be stripped before concatenation.
    expect(html).not.toContain("custom.example.com//book");
  });

  it("HTML-escapes ampersands in the cancel URL inside href attribute", () => {
    // The href value must use `&amp;` not `&` so it parses as a single
    // URL with two query params, not as an HTML entity boundary.
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html).toMatch(
      /href="https:\/\/sara-cuts\.solohub\.nl\/book\/cancel\?booking=bk_42&amp;token=tok_abc123"/
    );
  });
});

describe("bookingConfirmationEmail — brand color validation", () => {
  it("uses default brand color when none provided", () => {
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html).toContain("#7C3AED");
  });

  it("accepts a valid 6-digit hex color", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      brandColor: "#FF0066",
    });
    expect(html).toContain("#FF0066");
  });

  it("rejects an invalid brand color (CSS injection guard)", () => {
    // The brand color is interpolated into inline `style="..."`. A bad
    // value like 'red;background:url(javascript:...)' could break out of
    // the property. The regex /^#[0-9A-Fa-f]{6}$/ is the only thing
    // standing between user input and CSS injection — pin it.
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      brandColor: "red;background:url(javascript:alert(1))",
    });
    expect(html).not.toContain("javascript:alert(1)");
    expect(html).toContain("#7C3AED"); // fell back to default
  });

  it("rejects a 3-digit hex shorthand (the regex requires exactly 6)", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      brandColor: "#F06",
    });
    expect(html).toContain("#7C3AED");
  });
});

describe("bookingConfirmationEmail — address & directions", () => {
  it("renders the Location section when address is set", () => {
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html).toContain("Damrak 1, Amsterdam");
    expect(html).toContain("Get directions");
    expect(html).toContain(
      "https://www.google.com/maps/search/?api=1&amp;query="
    );
  });

  it("omits the Location section when address is null", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonAddress: null,
    });
    expect(html).not.toContain("Get directions");
    expect(html).not.toContain("google.com/maps");
  });

  it("URL-encodes the address in the maps query string", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonAddress: "Prinsengracht 123, 1015 LD Amsterdam",
    });
    // Spaces become %20, commas become %2C — encodeURIComponent's behavior.
    expect(html).toContain("Prinsengracht%20123%2C%201015%20LD%20Amsterdam");
  });
});

describe("bookingConfirmationEmail — timezone handling", () => {
  it("renders time in the salon's zone with a zone label", () => {
    // 12:00Z = 14:00 in Amsterdam (CEST in April). The label should
    // reflect that, not the server's local time.
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html).toContain("14:00");
  });

  it("falls back to Europe/Amsterdam if salonTimezone is missing", () => {
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonTimezone: null,
    });
    expect(html).toContain("14:00"); // same fallback zone, same wall clock
  });

  it("falls back to Europe/Amsterdam if salonTimezone is invalid", () => {
    // Defense-in-depth: a bad value in the DB shouldn't crash the email.
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonTimezone: "Mars/Olympus",
    });
    expect(html).toContain("14:00");
  });

  it("respects a different valid IANA zone", () => {
    // 12:00Z = 08:00 in New York (EDT in April).
    const { html } = bookingConfirmationEmail({
      ...baseInput,
      salonTimezone: "America/New_York",
    });
    expect(html).toContain("08:00");
  });
});

describe("bookingConfirmationEmail — price formatting", () => {
  it("formats price as EUR using nl-NL conventions", () => {
    const { html } = bookingConfirmationEmail({ ...baseInput, price: 45 });
    // nl-NL uses €<nbsp>45,00 — both digits and the currency symbol must be present.
    expect(html).toMatch(/€[^\d]*45,00/);
  });

  it("handles zero-price bookings", () => {
    const { html } = bookingConfirmationEmail({ ...baseInput, price: 0 });
    expect(html).toMatch(/€[^\d]*0,00/);
  });

  it("handles fractional prices", () => {
    const { html } = bookingConfirmationEmail({ ...baseInput, price: 12.5 });
    expect(html).toMatch(/€[^\d]*12,50/);
  });
});

describe("bookingConfirmationEmail — output shape", () => {
  it("returns { subject, html } strings", () => {
    const out = bookingConfirmationEmail(baseInput);
    expect(typeof out.subject).toBe("string");
    expect(typeof out.html).toBe("string");
    expect(out.subject.length).toBeGreaterThan(0);
    expect(out.html.length).toBeGreaterThan(0);
  });

  it("html starts with a DOCTYPE declaration", () => {
    const { html } = bookingConfirmationEmail(baseInput);
    expect(html.trimStart().startsWith("<!DOCTYPE html>")).toBe(true);
  });
});
