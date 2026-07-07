-- Migration 043: verify public.saju_type enum includes 'mbti' (schema object, read-only)

SELECT
  '043'::text AS migration,
  'pg_catalog: public.saju_type enum label mbti'::text AS check_target,
  EXISTS (
    SELECT 1
    FROM pg_catalog.pg_enum e
    INNER JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    INNER JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'saju_type'
      AND e.enumlabel = 'mbti'
  ) AS applied;
