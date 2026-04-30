import { describe, expect, it } from "vitest";
import {
  normalizeWebsiteTemplate,
  WEBSITE_TEMPLATES,
} from "@/lib/website-templates";

/**
 * The website template id is "signuture" (typo). Renaming it to "signature"
 * without migrating the data would break every existing tenant's public
 * site. This file locks the contract so the typo can only be fixed
 * deliberately, with a matching DB migration.
 *
 * The normalizer also accepts "signature" and "minimal" as legacy aliases —
 * tested here so an aggressive cleanup doesn't silently drop them.
 */

describe("normalizeWebsiteTemplate", () => {
  it("maps the legacy 'signature' alias to 'signuture'", () => {
    expect(normalizeWebsiteTemplate("signature")).toBe("signuture");
  });

  it("maps the legacy 'minimal' alias to 'minimalist'", () => {
    expect(normalizeWebsiteTemplate("minimal")).toBe("minimalist");
  });

  it("preserves canonical ids round-trip", () => {
    for (const t of WEBSITE_TEMPLATES) {
      expect(normalizeWebsiteTemplate(t.id)).toBe(t.id);
    }
  });

  it("falls back to 'signuture' for unknown / null / undefined", () => {
    expect(normalizeWebsiteTemplate("nope")).toBe("signuture");
    expect(normalizeWebsiteTemplate(null)).toBe("signuture");
    expect(normalizeWebsiteTemplate(undefined)).toBe("signuture");
    expect(normalizeWebsiteTemplate("")).toBe("signuture");
  });
});

describe("WEBSITE_TEMPLATES", () => {
  it("has the expected six templates", () => {
    const ids = WEBSITE_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual([
      "signuture",
      "luxe",
      "minimalist",
      "urban",
      "professional",
      "playful",
    ]);
  });
});
