export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan_tier: 'starter' | 'pro' | 'enterprise';
  logo_url: string | null;
  primary_color: string | null;
  created_at: string;
}