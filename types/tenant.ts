export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_email?: string | null;
  owner_first_name?: string | null;
  owner_last_name?: string | null;
  owner_role?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan_tier: 'solo' | 'hub' | 'agency';
  logo_url: string | null;
  primary_color: string | null;
  tagline: string | null;
  about: string | null;
  address: string | null;
  hours: string | null;
  /**
   * IANA time-zone identifier for the salon (e.g. "Europe/Amsterdam",
   * "America/New_York"). Backed by the tenants.iana_timezone column added in
   * migration 016. Backfilled to "Europe/Amsterdam" for pre-migration rows.
   * NOT NULL at the DB layer; modelled here as required.
   */
  iana_timezone: string;
  phone?: string | null;
  hero_image_url: string | null;
  about_image_url: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  business_started_at: string | null;
  tenant_status:
    | "trial"
    | "active"
    | "suspended";
  website_status:
    | "draft"
    | "pending_approval"
    | "published";
  trial_started_at: string | null;
  trial_ends_at: string | null;
  website_review_submitted_at: string | null;
  website_published_at: string | null;
  website_review_note: string | null;
  website_template:
    | "signuture"
    | "luxe"
    | "minimalist"
    | "urban"
    | "professional"
    | "playful";
  /**
   * Optional SEO override fields. NULL means "use the auto-generated value
   * from lib/seo/auto-meta.ts" — that's the default path for new tenants and
   * it's good enough that we never force the owner to think about SEO.
   * Super-admin can set these for tenants who need bespoke copy. See
   * migration 018_tenant_seo_fields.sql.
   */
  seo_title: string | null;
  meta_description: string | null;
  /**
   * Optional Signature-template copy overrides. NULL means "use the
   * template's hard-coded default". See migration
   * 019_tenant_template_copy.sql. The `tpl_` prefix groups these visually
   * in `\d tenants` and in editor UIs, separately from the editorial
   * columns (tagline, about, etc.) which are shared across templates.
   */
  tpl_hero_eyebrow: string | null;
  tpl_hero_description: string | null;
  tpl_services_title: string | null;
  tpl_services_description: string | null;
  tpl_cta_title: string | null;
  tpl_cta_description: string | null;
  tpl_footer_about: string | null;
  created_at: string;
}