import { describe, expect, it } from "vitest";
import { isMainSiteHost, slugFromHost } from "@/lib/main-site";

/**
 * Host-based tenant resolution. Bugs here are catastrophic (every anonymous
 * subdomain visit 404s) and silent (signed-in owners on the dashboard never
 * notice — their session.slug fallback masks it).
 *
 * Pinning the cases we care about so a regex tweak can't accidentally
 * unship the public site again.
 */

describe("isMainSiteHost", () => {
  it("recognizes the marketing apex variants", () => {
    expect(isMainSiteHost("solohub.nl")).toBe(true);
    expect(isMainSiteHost("www.solohub.nl")).toBe(true);
    expect(isMainSiteHost("SOLOHUB.NL")).toBe(true);
    expect(isMainSiteHost("localhost")).toBe(true);
    expect(isMainSiteHost("localhost:3000")).toBe(true);
  });

  it("does NOT match tenant subdomains", () => {
    expect(isMainSiteHost("sara.solohub.nl")).toBe(false);
    expect(isMainSiteHost("no-company.solohub.nl")).toBe(false);
  });

  it("returns false for null / empty", () => {
    expect(isMainSiteHost(null)).toBe(false);
    expect(isMainSiteHost(undefined)).toBe(false);
    expect(isMainSiteHost("")).toBe(false);
  });
});

describe("slugFromHost", () => {
  it("extracts a tenant slug from a single-label subdomain", () => {
    expect(slugFromHost("sara.solohub.nl")).toBe("sara");
    expect(slugFromHost("no-company.solohub.nl")).toBe("no-company");
    expect(slugFromHost("a1b2.solohub.nl")).toBe("a1b2");
  });

  it("is case-insensitive on the host", () => {
    expect(slugFromHost("Sara-Cuts.SoloHub.NL")).toBe("sara-cuts");
  });

  it("strips a port if present", () => {
    expect(slugFromHost("sara.solohub.nl:3000")).toBe("sara");
  });

  it("returns null for the marketing apex", () => {
    expect(slugFromHost("solohub.nl")).toBeNull();
    expect(slugFromHost("www.solohub.nl")).toBeNull();
  });

  it("returns null for localhost and dev hosts", () => {
    expect(slugFromHost("localhost")).toBeNull();
    expect(slugFromHost("localhost:3000")).toBeNull();
  });

  it("returns null for null / empty / whitespace", () => {
    expect(slugFromHost(null)).toBeNull();
    expect(slugFromHost(undefined)).toBeNull();
    expect(slugFromHost("")).toBeNull();
  });

  it("returns null for hosts that aren't *.solohub.nl", () => {
    expect(slugFromHost("solohub.com")).toBeNull();
    expect(slugFromHost("sara.solohub.com")).toBeNull();
    expect(slugFromHost("evil.example.com")).toBeNull();
  });

  it("returns null for nested subdomains (only one label allowed in front)", () => {
    // We don't support `staff.sara.solohub.nl` etc. — that would be an
    // ambiguous routing target. Stay strict.
    expect(slugFromHost("staff.sara.solohub.nl")).toBeNull();
  });

  it("rejects slugs that begin or end with a hyphen (DNS rule)", () => {
    expect(slugFromHost("-sara.solohub.nl")).toBeNull();
    expect(slugFromHost("sara-.solohub.nl")).toBeNull();
  });
});
