-- Allow daily-extra orders to claim a paid seat as `generating` before report persist.
-- Rollback:
--   update public.human_premium_daily_extra_orders set status = 'paid' where status = 'generating';
--   alter table public.human_premium_daily_extra_orders drop constraint human_premium_daily_extra_orders_status_check;
--   alter table public.human_premium_daily_extra_orders
--     add constraint human_premium_daily_extra_orders_status_check
--     check (status in ('pending', 'paid', 'consumed'));

alter table public.human_premium_daily_extra_orders
  drop constraint if exists human_premium_daily_extra_orders_status_check;

alter table public.human_premium_daily_extra_orders
  add constraint human_premium_daily_extra_orders_status_check
  check (status in ('pending', 'paid', 'generating', 'consumed'));

comment on column public.human_premium_daily_extra_orders.status is
  'pending → paid (verified) → generating (claimed for one report) → consumed';
