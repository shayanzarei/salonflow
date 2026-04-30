import { describe, expect, it } from "vitest";
import {
  autoDescription,
  autoTitle,
  extractCityFromAddress,
} from "@/lib/seo/auto-meta";
import type { Tenant } from "@/types/tenant";

/**
 * SEO auto-generation. Bugs here are silent — they don't crash anything,
 * they just produce poor titles/descriptions that hurt ranking. Worth
 * locking down because nobody will notice the regression for weeks.
 *
 * The `Pick`-shaped inputs let us pass minimal fixtures without constructing
 * a full Tenant — autoTitle/autoDescription only read the fields they need.
 */

type TitleTenant = Pick<Tenant, "name" | "address" | "seo_title">;
type DescTenant = Pick<
  Tenant,
  "name" | "address" | "about" | "tagline" | "meta_description"
>;

const tenantBase: TitleTenant & DescTenant = {
  name: "Sara Cuts",
  address: null,
  seo_title: null,
  about: null,
  tagline: null,
  meta_description: null,
};

describe("extractCityFromAddress", () => {
  it("pulls the city from the last comma-separated chunk", () => {
    expect(extractCityFromAddress("Prinsengracht 123, 1015 LD Amsterdam")).toBe(
      "Amsterdam"
    );
  });

  it("strips a country suffix appended to the city without a comma", () => {
    // The function takes the last comma-separated chunk and then strips a
    // trailing 'NL' / 'Netherlands' / 'Nederland'. So a country *appended*
    // to the city ("Amsterdam NL") is correctly stripped.
    expect(extractCityFromAddress("Damrak 1, Amsterdam NL")).toBe("Amsterdam");
    expect(
      extractCityFromAddress("Damrak 1, Amsterdam Netherlands")
    ).toBe("Amsterdam");
  });

  it("a country in its OWN trailing comma chunk is treated as the 'city' and dropped", () => {
    // Documented quirk: "Damrak 1, Amsterdam, NL" → last chunk is "NL",
    // which gets stripped to "" and rejected as too short → returns null.
    // This is a known limitation, not a bug — the owner can override
    // with seo_title/meta_description if their address shape doesn't fit.
    expect(extractCityFromAddress("Damrak 1, Amsterdam, NL")).toBeNull();
  });

  it("strips Dutch postal codes", () => {
    expect(extractCityFromAddress("Prinsengracht 123, 1015LD Amsterdam")).toBe(
      "Amsterdam"
    );
    expect(extractCityFromAddress("Prinsengracht 123, 1015 LD Amsterdam")).toBe(
      "Amsterdam"
    );
  });

  it("strips a leading numeric postal code in generic addresses", () => {
    expect(extractCityFromAddress("Some Street, 75001 Paris")).toBe("Paris");
  });

  it("returns null for empty / null input", () => {
    expect(extractCityFromAddress(null)).toBeNull();
    expect(extractCityFromAddress("")).toBeNull();
    expect(extractCityFromAddress("   ")).toBeNull();
  });

  it("rejects implausibly short or long candidates", () => {
    expect(extractCityFromAddress("X")).toBeNull();
    expect(
      extractCityFromAddress("Some address, " + "a".repeat(100))
    ).toBeNull();
  });
});

describe("autoTitle", () => {
  it("uses the seo_title override when set", () => {
    expect(
      autoTitle({ ...tenantBase, seo_title: "Custom Override" })
    ).toBe("Custom Override");
  });

  it("trims an override but does not truncate it (operator's choice)", () => {
    expect(
      autoTitle({ ...tenantBase, seo_title: "  Custom  " })
    ).toBe("Custom");
  });

  it("with city → 'Name — Book online in City'", () => {
    expect(
      autoTitle({
        ...tenantBase,
        address: "Prinsengracht 123, Amsterdam",
      })
    ).toBe("Sara Cuts — Book online in Amsterdam");
  });

  it("without city → falls back to the city-less template", () => {
    expect(autoTitle(tenantBase)).toBe(
      "Sara Cuts — Book your appointment online"
    );
  });

  it("respects the 60-char title budget with an ellipsis", () => {
    const longName = "A".repeat(70);
    const out = autoTitle({ ...tenantBase, name: longName });
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("autoDescription", () => {
  it("uses the meta_description override when set", () => {
    const out = autoDescription(
      { ...tenantBase, meta_description: "Custom hand-written description." },
      []
    );
    expect(out).toBe("Custom hand-written description.");
  });

  it("service-aware path: uses up to 3 unique categories", () => {
    const out = autoDescription({ ...tenantBase, address: "X, Amsterdam" }, [
      { name: "Cut", category_name: "Haircut" },
      { name: "Bob", category_name: "Haircut" }, // duplicate, dedup
      { name: "Color", category_name: "Color" },
      { name: "Updo", category_name: "Styling" },
      { name: "Mask", category_name: "Treatment" }, // beyond 3, dropped
    ]);
    expect(out).toContain("haircut");
    expect(out).toContain("color");
    expect(out).toContain("styling");
    expect(out).not.toContain("treatment");
    expect(out).toContain("Sara Cuts");
    expect(out).toContain("Amsterdam");
  });

  it("falls back to service names when no categories are set", () => {
    const out = autoDescription(tenantBase, [
      { name: "Signature Cut", category_name: null },
      { name: "Balayage", category_name: null },
    ]);
    expect(out.toLowerCase()).toContain("signature cut");
    expect(out.toLowerCase()).toContain("balayage");
  });

  it("dedupe is case-insensitive on categories", () => {
    const out = autoDescription(tenantBase, [
      { name: "A", category_name: "Haircut" },
      { name: "B", category_name: "haircut" },
    ]);
    // Should appear once, not twice.
    const matches = out.toLowerCase().match(/haircut/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it("falls back to tagline when there are no services", () => {
    const out = autoDescription(
      { ...tenantBase, tagline: "Where beauty meets craft." },
      []
    );
    expect(out).toContain("Where beauty meets craft.");
    expect(out).toContain("Sara Cuts");
  });

  it("falls back to about-text when there are no services and no tagline", () => {
    const out = autoDescription(
      { ...tenantBase, about: "We specialize in modern cuts and color." },
      []
    );
    expect(out.startsWith("We specialize")).toBe(true);
  });

  it("bare fallback when nothing is set", () => {
    const out = autoDescription(tenantBase, []);
    expect(out).toBe("Book your appointment online with Sara Cuts.");
  });

  it("respects the 160-char description budget", () => {
    const longAbout = "Cut and color. ".repeat(50); // ~750 chars
    const out = autoDescription({ ...tenantBase, about: longAbout }, []);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith("…")).toBe(true);
  });
});
