ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS about_image_url TEXT;
