-- Pet daily-fortune Insta card photo (manual apply in Supabase SQL Editor only).
-- Also create a public-read storage bucket "pet-photos" with owner write RLS.

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS photo_consent_secondary_use boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS photo_uploaded_at timestamptz;

COMMENT ON COLUMN public.pets.photo_url IS 'EXIF-stripped photo for daily fortune Insta share cards.';
COMMENT ON COLUMN public.pets.photo_consent_secondary_use IS 'Optional consent for AI training and content production.';
COMMENT ON COLUMN public.pets.photo_uploaded_at IS 'When photo_url was last uploaded.';
