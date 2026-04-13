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
  created_at: string;
}