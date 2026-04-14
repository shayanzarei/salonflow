export const WEBSITE_TEMPLATES = [
  { id: "signuture", label: "Signuture (current)" },
  { id: "luxe", label: "Luxe" },
  { id: "minimalist", label: "Minimalist" },
  { id: "urban", label: "Urban" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
] as const;

export type WebsiteTemplateId = (typeof WEBSITE_TEMPLATES)[number]["id"];

export function normalizeWebsiteTemplate(value: string | null | undefined): WebsiteTemplateId {
  if (value === "signature") return "signuture";
  if (value === "minimal") return "minimalist";

  return WEBSITE_TEMPLATES.some((template) => template.id === value)
    ? (value as WebsiteTemplateId)
    : "signuture";
}
