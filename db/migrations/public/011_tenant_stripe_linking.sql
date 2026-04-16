ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS tenants_stripe_customer_id_unique_idx
  ON public.tenants (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
