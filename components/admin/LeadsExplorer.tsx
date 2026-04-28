"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import {
  Table,
  TableContainer,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
import type { PlaceLead } from "@/lib/google-places";
import { FormEvent, useMemo, useState } from "react";

type SortKey =
  | "name"
  | "primaryTypeDisplay"
  | "address"
  | "rating"
  | "reviewCount"
  | "website";
type SortDir = "asc" | "desc";

type Props = {
  placeTypes: { value: string; label: string }[];
};

type Mode = "text" | "nearby";

type SearchBody = {
  mode: Mode;
  query?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  includedTypes?: string[];
  hasWebsite?: boolean;
  ratingMin?: number;
  ratingMax?: number;
  reviewMin?: number;
  reviewMax?: number;
  operationalOnly?: boolean;
};

function compare(a: unknown, b: unknown, dir: SortDir): number {
  const dirMul = dir === "asc" ? 1 : -1;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * dirMul;
  }
  return String(a).localeCompare(String(b)) * dirMul;
}

export function LeadsExplorer({ placeTypes }: Props) {
  const [mode, setMode] = useState<Mode>("text");

  // Text Search inputs
  const [query, setQuery] = useState("hair salons in Amsterdam");

  // Nearby Search inputs
  const [lat, setLat] = useState("52.3676");
  const [lng, setLng] = useState("4.9041");
  const [radius, setRadius] = useState("5000");

  // Type select
  const [selectedType, setSelectedType] = useState<string>("");

  // Filters
  const [hasWebsite, setHasWebsite] = useState<"any" | "yes" | "no">("any");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  const [reviewMin, setReviewMin] = useState("");
  const [reviewMax, setReviewMax] = useState("");
  const [operationalOnly, setOperationalOnly] = useState(true);

  // Results
  const [leads, setLeads] = useState<PlaceLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function buildSearchBody(): SearchBody | null {
    const body: SearchBody = { mode };

    if (mode === "text") {
      if (!query.trim()) {
        setError("Enter a search query.");
        return null;
      }
      body.query = query.trim();
    } else {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
        setError("Enter valid latitude and longitude.");
        return null;
      }
      if (!Number.isFinite(radiusNum) || radiusNum <= 0) {
        setError("Enter a positive radius (meters).");
        return null;
      }
      body.lat = latNum;
      body.lng = lngNum;
      body.radius = radiusNum;
    }

    if (selectedType) {
      body.includedTypes = [selectedType];
    } else if (mode === "nearby") {
      setError("Select a business type for Nearby Search.");
      return null;
    }

    if (hasWebsite === "yes") body.hasWebsite = true;
    if (hasWebsite === "no") body.hasWebsite = false;

    const parseNum = (s: string) => {
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : undefined;
    };
    body.ratingMin = parseNum(ratingMin);
    body.ratingMax = parseNum(ratingMax);
    body.reviewMin = parseNum(reviewMin);
    body.reviewMax = parseNum(reviewMax);
    body.operationalOnly = operationalOnly;

    return body;
  }

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const body = buildSearchBody();
    if (!body) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { leads?: PlaceLead[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Search failed.");
      setLeads(json.leads ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setError(null);
    const body = buildSearchBody();
    if (!body) return;

    setExporting(true);
    try {
      const res = await fetch("/api/admin/leads/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? "Export failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fromHeader = res.headers
        .get("Content-Disposition")
        ?.match(/filename="?([^"]+)"?/i)?.[1];
      a.download = fromHeader ?? `leads-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  const sortedLeads = useMemo(() => {
    const copy = [...leads];
    copy.sort((a, b) => compare(a[sortKey], b[sortKey], sortDir));
    return copy;
  }, [leads, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "address" ? "asc" : "desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return <span aria-hidden> {sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card variant="outlined">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "text" ? "dark" : "secondary"}
              size="sm"
              onClick={() => setMode("text")}
            >
              Text Search
            </Button>
            <Button
              type="button"
              variant={mode === "nearby" ? "dark" : "secondary"}
              size="sm"
              onClick={() => setMode("nearby")}
            >
              Nearby Search
            </Button>
          </div>

          {mode === "text" ? (
            <Input
              id="leads-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              label="Search query"
              placeholder='e.g. "hair salons in Amsterdam"'
              helperText="Free-text query — Google parses location and intent."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                id="leads-lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                label="Latitude"
                placeholder="52.3676"
              />
              <Input
                id="leads-lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                label="Longitude"
                placeholder="4.9041"
              />
              <Input
                id="leads-radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                label="Radius (meters)"
                placeholder="5000"
                helperText="Max 50,000 m"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              id="leads-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Business type"
              helperText={
                mode === "nearby"
                  ? "Required for Nearby Search."
                  : "Optional — Text Search applies a single primary type."
              }
            >
              <option value="">— Any type —</option>
              {placeTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Select
              id="leads-website"
              value={hasWebsite}
              onChange={(e) =>
                setHasWebsite(e.target.value as "any" | "yes" | "no")
              }
              label="Has website"
              helperText="Filter by whether Google has a website on file."
            >
              <option value="any">Any</option>
              <option value="no">No website (best for prospecting)</option>
              <option value="yes">Has website</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Input
              id="leads-rating-min"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={ratingMin}
              onChange={(e) => setRatingMin(e.target.value)}
              label="Rating min"
              placeholder="0"
            />
            <Input
              id="leads-rating-max"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={ratingMax}
              onChange={(e) => setRatingMax(e.target.value)}
              label="Rating max"
              placeholder="5"
            />
            <Input
              id="leads-review-min"
              type="number"
              min="0"
              value={reviewMin}
              onChange={(e) => setReviewMin(e.target.value)}
              label="Reviews min"
              placeholder="0"
            />
            <Input
              id="leads-review-max"
              type="number"
              min="0"
              value={reviewMax}
              onChange={(e) => setReviewMax(e.target.value)}
              label="Reviews max"
              placeholder=""
            />
          </div>

          <label className="flex items-center gap-2 text-body-sm text-ink-700">
            <input
              type="checkbox"
              checked={operationalOnly}
              onChange={(e) => setOperationalOnly(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
            />
            Operational businesses only (skip closed / temporarily closed)
          </label>

          {error ? (
            <p className="text-body-sm font-medium text-danger-600">{error}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="dark" size="md" disabled={loading}>
              {loading ? "Searching…" : "Search leads"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleExport}
              disabled={exporting || loading}
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-body-sm text-ink-500">
            {searched
              ? `${leads.length} result${leads.length === 1 ? "" : "s"}`
              : "Run a search to see results."}
          </p>
        </div>
        <TableContainer>
          <Table>
            <thead>
              <THeadRow>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Name{sortIndicator("name")}
                  </button>
                </TH>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("primaryTypeDisplay")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Type{sortIndicator("primaryTypeDisplay")}
                  </button>
                </TH>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("address")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Address{sortIndicator("address")}
                  </button>
                </TH>
                <TH>Phone</TH>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("website")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Website{sortIndicator("website")}
                  </button>
                </TH>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("rating")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Rating{sortIndicator("rating")}
                  </button>
                </TH>
                <TH>
                  <button
                    type="button"
                    onClick={() => toggleSort("reviewCount")}
                    className="text-left font-semibold hover:text-ink-900"
                  >
                    Reviews{sortIndicator("reviewCount")}
                  </button>
                </TH>
                <TH>Maps</TH>
              </THeadRow>
            </thead>
            <tbody>
              {sortedLeads.length === 0 ? (
                <TBodyRow interactive={false}>
                  <TD colSpan={8} className="py-8 text-center text-ink-500">
                    {loading
                      ? "Loading…"
                      : searched
                        ? "No leads match these filters."
                        : "Awaiting search."}
                  </TD>
                </TBodyRow>
              ) : (
                sortedLeads.map((lead) => (
                  <TBodyRow key={lead.placeId}>
                    <TD className="font-medium text-ink-900">{lead.name}</TD>
                    <TD>{lead.primaryTypeDisplay ?? lead.primaryType ?? "—"}</TD>
                    <TD className="max-w-[260px] truncate" title={lead.address ?? ""}>
                      {lead.address ?? "—"}
                    </TD>
                    <TD>
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-brand-700 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD className="max-w-[200px] truncate">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-700 hover:underline"
                          title={lead.website}
                        >
                          {new URL(lead.website).hostname.replace(/^www\./, "")}
                        </a>
                      ) : (
                        <span className="text-ink-400">No website</span>
                      )}
                    </TD>
                    <TD>{lead.rating?.toFixed(1) ?? "—"}</TD>
                    <TD>{lead.reviewCount ?? "—"}</TD>
                    <TD>
                      {lead.googleMapsUrl ? (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-700 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </TD>
                  </TBodyRow>
                ))
              )}
            </tbody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
