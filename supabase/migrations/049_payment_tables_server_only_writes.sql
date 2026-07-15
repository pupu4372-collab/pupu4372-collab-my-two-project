-- CAUTION: Apply on live only AFTER the payment verify route writes unlocks
-- via service role (getSupabaseServiceRoleClient). See src/app/api/payment/verify/route.ts.
drop policy if exists "pet_premium_unlocks_insert_own" on public.pet_premium_unlocks;
drop policy if exists "pet_premium_unlocks_update_own" on public.pet_premium_unlocks;
drop policy if exists "pet_premium_unlocks_delete_own" on public.pet_premium_unlocks;
drop policy if exists "payments_insert_own" on public.payments;
-- select policies (pet_premium_unlocks_select_own, payments_select_own) remain.
-- After this, writes require service role.
