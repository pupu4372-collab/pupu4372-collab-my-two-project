-- Unique: at most one daily_lucky_free coupon per user (used or unused).
-- Apply AFTER cleaning duplicates (see Phase 1). Fails if duplicates remain.
--
-- Rollback:
--   drop index if exists public.coupons_user_daily_lucky_free_uidx;

-- Partial unique: only daily_lucky_free is lifetime-1× today.
-- Other coupon_type values may later allow multiple rows (e.g. re-grant after use),
-- so do NOT use a table-wide UNIQUE (user_id, coupon_type).
create unique index if not exists coupons_user_daily_lucky_free_uidx
  on public.coupons (user_id, coupon_type)
  where coupon_type = 'daily_lucky_free';

comment on index public.coupons_user_daily_lucky_free_uidx is
  'Lifetime one daily_lucky_free per user; concurrent grantCoupon races raise 23505.';

-- Keep idx_coupons_user_type_used (user_id, coupon_type, used_at):
-- it serves unused lookups (used_at IS NULL) for all types and is not redundant
-- with this partial unique index.
