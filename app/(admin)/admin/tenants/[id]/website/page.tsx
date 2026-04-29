import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { UploadInput } from "@/components/ui/UploadInput";
import { SITE_SECTIONS } from "@/config/plans";
import pool from "@/lib/db";
import { autoTitle, autoDescription } from "@/lib/seo/auto-meta";
import {
  WEBSITE_TEMPLATES,
  normalizeWebsiteTemplate,
} from "@/lib/website-templates";
import type { Tenant } from "@/types/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

type WebsiteTab =
  | "branding"
  | "content"
  | "copy"
  | "contact"
  | "hours"
  | "sections"
  | "seo";

const TABS: { id: WebsiteTab; label: string; description: string }[] = [
  { id: "branding", label: "Branding", description: "Template, color, logo" },
  { id: "content", label: "Content", description: "Tagline, about, hero" },
  {
    id: "copy",
    label: "Template copy",
    description: "Per-section headlines on the public site",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Phone, address, social links",
  },
  { id: "hours", label: "Hours", description: "Display string + opening hours" },
  {
    id: "sections",
    label: "Sections",
    description: "Toggle public website blocks",
  },
  { id: "seo", label: "SEO", description: "Title and meta description" },
];

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default async function TenantWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: WebsiteTab = (
    [
      "branding",
      "content",
      "copy",
      "contact",
      "hours",
      "sections",
      "seo",
    ] as const
  ).includes(tabParam as WebsiteTab)
    ? (tabParam as WebsiteTab)
    : "branding";

  const [tenantResult, hoursResult, flagsResult, servicesResult] =
    await Promise.all([
      pool.query(`SELECT * FROM tenants WHERE id = $1`, [id]),
      pool.query(
        `SELECT day_of_week, start_time, end_time, is_working
         FROM salon_working_hours WHERE tenant_id = $1
         ORDER BY day_of_week`,
        [id]
      ),
      pool.query(
        `SELECT feature, enabled FROM feature_flags WHERE tenant_id = $1`,
        [id]
      ),
      pool.query(
        `SELECT id, name, category FROM services WHERE tenant_id = $1`,
        [id]
      ),
    ]);

  const tenant = tenantResult.rows[0];
  if (!tenant) notFound();

  const flagMap: Record<string, boolean> = {};
  for (const row of flagsResult.rows) flagMap[row.feature] = row.enabled;

  const selectedTemplate = normalizeWebsiteTemplate(tenant.website_template);

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <Card variant="outlined" className="p-1.5">
        <ul className="flex flex-wrap gap-1">
          {TABS.map((entry) => {
            const isActive = entry.id === tab;
            return (
              <li key={entry.id}>
                <Link
                  href={`/admin/tenants/${id}/website?tab=${entry.id}`}
                  className={`inline-flex min-h-9 items-center rounded-md px-3 py-1.5 text-body-sm transition-colors ${
                    isActive
                      ? "bg-ink-900 font-semibold text-white"
                      : "text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {entry.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {tab === "branding" && (
        <BrandingTab id={id} tenant={tenant} selectedTemplate={selectedTemplate} />
      )}

      {tab === "content" && <ContentTab id={id} tenant={tenant} />}

      {tab === "copy" && <CopyTab id={id} tenant={tenant} />}

      {tab === "contact" && <ContactTab id={id} tenant={tenant} />}

      {tab === "hours" && (
        <HoursTab id={id} tenant={tenant} hours={hoursResult.rows} />
      )}

      {tab === "sections" && <SectionsTab id={id} flagMap={flagMap} />}

      {tab === "seo" && (
        <SeoTab id={id} tenant={tenant} services={servicesResult.rows} />
      )}
    </div>
  );
}

/* ─── Tab: Branding ──────────────────────────────────────────────────── */
function BrandingTab({
  id,
  tenant,
  selectedTemplate,
}: {
  id: string;
  tenant: Tenant;
  selectedTemplate: string;
}) {
  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Branding</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Choose a template, set the brand color, and upload a logo.
        </p>
      </div>
      <form
        action="/api/admin/tenants/branding"
        method="POST"
        className="space-y-5 p-4 sm:p-6"
      >
        <input type="hidden" name="tenant_id" value={id} />

        <Select
          id="tenant-website-template"
          name="website_template"
          label="Template"
          defaultValue={selectedTemplate}
          helperText="Determines which public-site layout this salon shows."
        >
          {WEBSITE_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Input
            id="tenant-primary-color"
            type="text"
            name="primary_color"
            label="Brand color (hex)"
            defaultValue={tenant.primary_color ?? ""}
            placeholder="#7c3aed"
            helperText="Used for buttons, accents, and the booking widget chrome."
          />
          <div
            className="h-11 w-11 shrink-0 rounded-md border border-ink-200"
            style={{
              backgroundColor:
                tenant.primary_color ?? "var(--color-brand-600)",
            }}
            aria-label="Current color preview"
          />
        </div>

        <UploadInput
          name="logo_url"
          defaultValue={tenant.logo_url ?? ""}
          label="Logo"
          hint="Shown in the public site header and emails."
        />

        <div className="flex justify-end">
          <Button type="submit" variant="dark" size="md">
            Save branding
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ─── Tab: Content ───────────────────────────────────────────────────── */
function ContentTab({ id, tenant }: { id: string; tenant: Tenant }) {
  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Site content</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          The narrative copy and imagery on the salon&apos;s public site.
        </p>
      </div>
      <form
        action="/api/admin/tenants/content"
        method="POST"
        className="space-y-4 p-4 sm:p-6"
      >
        <input type="hidden" name="tenant_id" value={id} />

        <Input
          id="tenant-content-tagline"
          type="text"
          name="tagline"
          label="Tagline"
          defaultValue={tenant.tagline ?? ""}
          placeholder="Where beauty meets craft"
          helperText="One-liner shown under the salon name. Also used as a fallback for SEO descriptions."
        />

        <Textarea
          id="tenant-content-about"
          name="about"
          label="About"
          defaultValue={tenant.about ?? ""}
          placeholder="Tell the salon's story…"
          rows={4}
        />

        <UploadInput
          name="hero_image_url"
          defaultValue={tenant.hero_image_url ?? ""}
          label="Hero image"
          hint="Banner image at the top of the salon's site."
        />

        <UploadInput
          name="about_image_url"
          defaultValue={tenant.about_image_url ?? ""}
          label="About image"
          hint="Optional companion image for the about section."
        />

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`https://${tenant.slug}.solohub.nl`}
            target="_blank"
            rel="noopener noreferrer"
            className="order-2 text-body-sm text-brand-600 hover:text-brand-700 sm:order-1"
          >
            Preview site →
          </Link>
          <Button
            type="submit"
            variant="dark"
            size="md"
            className="order-1 w-full sm:order-2 sm:w-auto"
          >
            Save content
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ─── Tab: Template copy ─────────────────────────────────────────────── */
/**
 * Per-section copy overrides for the Signature template (migration 019).
 * Each field is optional — empty values fall back to the template's
 * hard-coded default. The placeholders mirror those defaults so super-admin
 * can see exactly what they're replacing before they type.
 */
function CopyTab({ id, tenant }: { id: string; tenant: Tenant }) {
  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Template copy</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Section-level headlines and paragraphs on the Signature template.
          Leave a field blank to use the template default shown as
          placeholder.
        </p>
      </div>
      <form
        action="/api/admin/tenants/template-copy"
        method="POST"
        className="space-y-5 p-4 sm:p-6"
      >
        <input type="hidden" name="tenant_id" value={id} />

        <fieldset className="space-y-3">
          <legend className="text-label font-medium text-ink-700">
            Hero section
          </legend>
          <Input
            id="tpl-hero-eyebrow"
            type="text"
            name="tpl_hero_eyebrow"
            label="Eyebrow"
            defaultValue={tenant.tpl_hero_eyebrow ?? ""}
            placeholder="Premium Beauty Experience"
            helperText="Small label above the hero H1."
            optionalLabel="optional"
          />
          <Textarea
            id="tpl-hero-description"
            name="tpl_hero_description"
            label="Description"
            defaultValue={tenant.tpl_hero_description ?? ""}
            placeholder="Experience luxury treatments tailored to your unique style. Book your appointment seamlessly and discover the ultimate salon experience."
            optionalLabel="optional"
            rows={3}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-label font-medium text-ink-700">
            Services band
          </legend>
          <Input
            id="tpl-services-title"
            type="text"
            name="tpl_services_title"
            label="Title"
            defaultValue={tenant.tpl_services_title ?? ""}
            placeholder="Signature Services"
            optionalLabel="optional"
          />
          <Textarea
            id="tpl-services-description"
            name="tpl_services_description"
            label="Description"
            defaultValue={tenant.tpl_services_description ?? ""}
            placeholder="Tailored treatments designed to enhance your natural beauty and provide ultimate relaxation."
            optionalLabel="optional"
            rows={2}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-label font-medium text-ink-700">
            Booking CTA banner
          </legend>
          <Input
            id="tpl-cta-title"
            type="text"
            name="tpl_cta_title"
            label="Title"
            defaultValue={tenant.tpl_cta_title ?? ""}
            placeholder="Ready for your transformation?"
            optionalLabel="optional"
          />
          <Textarea
            id="tpl-cta-description"
            name="tpl_cta_description"
            label="Description"
            defaultValue={tenant.tpl_cta_description ?? ""}
            placeholder="Book your appointment today and let our expert team enhance your natural beauty in our luxurious, relaxing environment."
            optionalLabel="optional"
            rows={3}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-label font-medium text-ink-700">
            Footer
          </legend>
          <Textarea
            id="tpl-footer-about"
            name="tpl_footer_about"
            label="About paragraph"
            defaultValue={tenant.tpl_footer_about ?? ""}
            placeholder="Your premium destination for luxury beauty treatments. Experience the perfect blend of expertise and relaxation."
            optionalLabel="optional"
            rows={3}
          />
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" variant="dark" size="md">
            Save template copy
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ─── Tab: Contact ───────────────────────────────────────────────────── */
function ContactTab({ id, tenant }: { id: string; tenant: Tenant }) {
  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Contact & socials</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Phone, address, and social profiles. The address powers the
          LocalBusiness JSON-LD; socials populate <code>sameAs</code>.
        </p>
      </div>
      <form
        action="/api/admin/tenants/contact"
        method="POST"
        className="space-y-4 p-4 sm:p-6"
      >
        <input type="hidden" name="tenant_id" value={id} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="tenant-phone"
            type="text"
            name="phone"
            label="Phone"
            defaultValue={tenant.phone ?? ""}
            placeholder="+31 20 555 1234"
          />
          <Input
            id="tenant-address"
            type="text"
            name="address"
            label="Street address"
            defaultValue={tenant.address ?? ""}
            placeholder="123 Beauty Lane, Amsterdam"
          />
        </div>

        <fieldset className="space-y-4">
          <legend className="text-label font-medium text-ink-700">
            Social profiles
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="tenant-social-instagram"
              type="url"
              name="social_instagram"
              label="Instagram URL"
              defaultValue={tenant.social_instagram ?? ""}
              placeholder="https://instagram.com/handle"
              optionalLabel="optional"
            />
            <Input
              id="tenant-social-facebook"
              type="url"
              name="social_facebook"
              label="Facebook URL"
              defaultValue={tenant.social_facebook ?? ""}
              placeholder="https://facebook.com/page"
              optionalLabel="optional"
            />
            <Input
              id="tenant-social-tiktok"
              type="url"
              name="social_tiktok"
              label="TikTok URL"
              defaultValue={tenant.social_tiktok ?? ""}
              placeholder="https://tiktok.com/@handle"
              optionalLabel="optional"
            />
            <Input
              id="tenant-social-youtube"
              type="url"
              name="social_youtube"
              label="YouTube URL"
              defaultValue={tenant.social_youtube ?? ""}
              placeholder="https://youtube.com/@channel"
              optionalLabel="optional"
            />
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" variant="dark" size="md">
            Save contact
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ─── Tab: Hours ─────────────────────────────────────────────────────── */
function HoursTab({
  id,
  tenant,
  hours,
}: {
  id: string;
  tenant: Tenant;
  hours: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_working: boolean;
  }[];
}) {
  // Pre-fill missing days with closed defaults so the form always renders 7 rows.
  const byDay = new Map<number, (typeof hours)[number]>();
  for (const row of hours) byDay.set(row.day_of_week, row);

  return (
    <div className="space-y-4">
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Display string</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Free-text hours shown on the public site (e.g. <em>Mon–Sat 9am–7pm</em>).
            Independent of the structured opening hours below.
          </p>
        </div>
        <form
          action="/api/admin/tenants/content"
          method="POST"
          className="space-y-4 p-4 sm:p-6"
        >
          <input type="hidden" name="tenant_id" value={id} />
          {/* Re-post the other content fields so /content doesn't blank them. */}
          <input type="hidden" name="tagline" value={tenant.tagline ?? ""} />
          <input type="hidden" name="about" value={tenant.about ?? ""} />
          <input
            type="hidden"
            name="hero_image_url"
            value={tenant.hero_image_url ?? ""}
          />
          <input
            type="hidden"
            name="about_image_url"
            value={tenant.about_image_url ?? ""}
          />

          <Input
            id="tenant-content-hours"
            type="text"
            name="hours"
            label="Hours (display)"
            defaultValue={tenant.hours ?? ""}
            placeholder="Mon–Sat 9am–7pm"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="dark" size="md">
              Save display
            </Button>
          </div>
        </form>
      </Card>

      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Opening hours</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Structured per-day availability. Drives the booking widget and
            schema.org <code>OpeningHoursSpecification</code>.
          </p>
        </div>
        <form
          action="/api/admin/tenants/opening-hours"
          method="POST"
          className="divide-y divide-ink-50"
        >
          <input type="hidden" name="tenant_id" value={id} />
          {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
            const row = byDay.get(dayOfWeek);
            const start = row?.start_time?.slice(0, 5) ?? "09:00";
            const end = row?.end_time?.slice(0, 5) ?? "17:00";
            const open = row?.is_working ?? false;
            return (
              <div
                key={dayOfWeek}
                className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-[120px_auto_1fr_auto_1fr] sm:gap-4 sm:px-6"
              >
                <div className="text-body-sm font-medium text-ink-900">
                  {DAY_LABELS[dayOfWeek]}
                </div>
                <label className="inline-flex items-center gap-2 text-body-sm text-ink-700">
                  <input
                    type="checkbox"
                    name={`open_${dayOfWeek}`}
                    defaultChecked={open}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
                  />
                  Open
                </label>
                <input
                  type="time"
                  name={`start_${dayOfWeek}`}
                  defaultValue={start}
                  className="min-h-10 w-full rounded-sm border border-ink-200 px-3 py-2 text-body-sm focus:border-brand-600 focus:outline-none"
                />
                <span className="hidden text-caption text-ink-400 sm:inline">
                  to
                </span>
                <input
                  type="time"
                  name={`end_${dayOfWeek}`}
                  defaultValue={end}
                  className="min-h-10 w-full rounded-sm border border-ink-200 px-3 py-2 text-body-sm focus:border-brand-600 focus:outline-none"
                />
              </div>
            );
          })}
          <div className="flex justify-end p-4 sm:p-6">
            <Button type="submit" variant="dark" size="md">
              Save opening hours
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ─── Tab: Sections ──────────────────────────────────────────────────── */
function SectionsTab({
  id,
  flagMap,
}: {
  id: string;
  flagMap: Record<string, boolean>;
}) {
  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Public site sections</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Toggle which blocks appear on the salon&apos;s public site.
        </p>
      </div>
      <div className="divide-y divide-ink-50">
        {SITE_SECTIONS.map((section) => {
          const isEnabled = section.required
            ? true
            : (flagMap[section.key] ?? true);
          return (
            <div
              key={section.key}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 pr-0 sm:pr-4">
                <p className="text-body-sm font-medium text-ink-900">
                  {section.label}
                  {section.required ? (
                    <span className="ml-2 text-caption text-ink-400">
                      (always on)
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-caption text-ink-400">
                  {section.description}
                </p>
              </div>
              {section.required ? (
                <div
                  className="relative h-6 w-11 shrink-0 self-start rounded-full bg-brand-600 opacity-40 sm:self-center"
                  aria-hidden
                >
                  <span className="absolute left-[23px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
                </div>
              ) : (
                <form
                  action="/api/admin/sections"
                  method="POST"
                  className="shrink-0 self-start sm:self-center"
                >
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="feature" value={section.key} />
                  <input
                    type="hidden"
                    name="enabled"
                    value={isEnabled ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                    style={{
                      background: isEnabled
                        ? "var(--color-brand-600)"
                        : "#D1D5DB",
                    }}
                    aria-label={
                      isEnabled
                        ? `Disable ${section.label}`
                        : `Enable ${section.label}`
                    }
                  >
                    <span
                      className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                      style={{ left: isEnabled ? 23 : 3 }}
                    />
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ─── Tab: SEO ───────────────────────────────────────────────────────── */
function SeoTab({
  id,
  tenant,
  services,
}: {
  id: string;
  tenant: Tenant;
  services: { id: string; name: string; category: string | null }[];
}) {
  const previewTitle = autoTitle(tenant);
  const previewDescription = autoDescription(tenant, services);

  return (
    <div className="space-y-4">
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-ink-900">SEO overrides</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {tenant.seo_title ? (
                <Badge variant="warning">Title overridden</Badge>
              ) : (
                <Badge variant="neutral">Title auto</Badge>
              )}
              {tenant.meta_description ? (
                <Badge variant="warning">Description overridden</Badge>
              ) : (
                <Badge variant="neutral">Description auto</Badge>
              )}
            </div>
          </div>
          <p className="mt-1 text-caption text-ink-400">
            Leave blank to use the auto-generated values shown in the preview
            below. Use overrides only when the auto copy isn&apos;t a good fit.
          </p>
        </div>
        <form
          action="/api/admin/tenants/seo"
          method="POST"
          className="space-y-4 p-4 sm:p-6"
        >
          <input type="hidden" name="tenant_id" value={id} />

          <Input
            id="tenant-seo-title"
            type="text"
            name="seo_title"
            label="SEO title"
            defaultValue={tenant.seo_title ?? ""}
            placeholder={previewTitle}
            helperText="Recommended ≤ 60 characters."
            optionalLabel="optional"
          />

          <Textarea
            id="tenant-meta-description"
            name="meta_description"
            label="Meta description"
            defaultValue={tenant.meta_description ?? ""}
            placeholder={previewDescription}
            helperText="Recommended ≤ 160 characters."
            optionalLabel="optional"
            rows={3}
          />

          <div className="flex justify-end gap-2">
            <Button type="submit" variant="dark" size="md">
              Save SEO
            </Button>
          </div>
        </form>
      </Card>

      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Search preview</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Approximate Google snippet using the current title/description.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <p className="truncate text-body font-semibold text-brand-700">
            {previewTitle}
          </p>
          <p className="mt-0.5 truncate text-caption text-ink-500">
            https://{tenant.slug}.solohub.nl/
          </p>
          <p className="mt-1.5 text-body-sm leading-relaxed text-ink-700">
            {previewDescription}
          </p>
        </div>
      </Card>
    </div>
  );
}
