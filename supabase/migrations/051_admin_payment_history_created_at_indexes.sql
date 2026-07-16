-- 051: indexes for admin payment history date-range + newest-first scans
-- Apply manually when ready (not auto-applied by this change).
--
-- Findings before this migration:
--   pet_premium_unlocks: indexes on user_id, pet_id, (pet_id, product_code), payment_id UNIQUE
--     — no standalone created_at index
--   human_premium_reports: (user_id, created_at desc), (lower(email), created_at desc),
--     (status, created_at desc), payment_order_id
--     — no standalone created_at index for admin range scans without user/status

create index if not exists idx_pet_premium_unlocks_created_at
  on public.pet_premium_unlocks (created_at desc);

create index if not exists idx_human_premium_reports_created_at
  on public.human_premium_reports (created_at desc);
