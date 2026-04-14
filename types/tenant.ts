export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan_tier: 'starter' | 'pro' | 'enterprise';
  logo_url: string | null;
  primary_color: string | null;
  tagline: string | null;
  about: string | null;
  address: string | null;
  hours: string | null;
  phone?: string | null;
  hero_image_url: string | null;
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
  created_at: string;
}