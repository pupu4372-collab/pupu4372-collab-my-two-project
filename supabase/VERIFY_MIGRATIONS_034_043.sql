-- Verify migrations 034-043 (read-only). Paste and run entire script in Supabase SQL Editor.

SELECT
  '034'::text AS migration,
  'public.pet_premium_unlocks table'::text AS check_target,
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pet_premium_unlocks'
  ) AS applied

UNION ALL

SELECT
  '035',
  'constraint pet_premium_unlocks_payment_id_key',
  EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE n.nspname = 'public'
      AND r.relname = 'pet_premium_unlocks'
      AND c.conname = 'pet_premium_unlocks_payment_id_key'
  )

UNION ALL

SELECT
  '036',
  'policy support_inquiries_insert_public',
  EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_inquiries'
      AND policyname = 'support_inquiries_insert_public'
  )

UNION ALL

SELECT
  '037',
  'public.human_premium_daily_extra_orders table',
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'human_premium_daily_extra_orders'
  )

UNION ALL

SELECT
  '038',
  'pet_species enum value reptile',
  EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'pet_species'
      AND e.enumlabel = 'reptile'
  )

UNION ALL

SELECT
  '039',
  'breed_guides.leopard-gecko animal_type = reptile',
  EXISTS (
    SELECT 1
    FROM public.breed_guides
    WHERE seo_slug = 'leopard-gecko'
      AND animal_type = 'reptile'
  )

UNION ALL

SELECT
  '040',
  'type public.pet_show_photo_category',
  EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'pet_show_photo_category'
  )

UNION ALL

SELECT
  '041',
  'human_premium_reports: no sentinel checkout_session_id rows',
  NOT EXISTS (
    SELECT 1
    FROM public.human_premium_reports
    WHERE checkout_session_id IN ('daily-free', 'daily-extra', '')
       OR checkout_session_id LIKE 'bundle:%'
  )

UNION ALL

SELECT
  '042',
  'constraint saju_llm_cache_cache_kind_check includes pet_premium',
  EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE n.nspname = 'public'
      AND r.relname = 'saju_llm_cache'
      AND c.conname = 'saju_llm_cache_cache_kind_check'
      AND pg_get_constraintdef(c.oid) LIKE '%pet_premium%'
  )

UNION ALL

SELECT
  '043',
  'saju_type enum value mbti',
  EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'saju_type'
      AND e.enumlabel = 'mbti'
  )

ORDER BY migration;
