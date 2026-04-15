ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS owner_email TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tenants'
      AND column_name = 'owner_email'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS tenants_owner_email_unique_idx
      ON public.tenants (LOWER(owner_email))
      WHERE owner_email IS NOT NULL;
  END IF;
END $$;
