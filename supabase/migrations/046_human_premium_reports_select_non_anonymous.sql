-- Harden human_premium_reports owner SELECT: exclude anonymous JWTs.
-- Rollback (previous policy from 025_human_premium_reports.sql):
--   drop policy if exists "human_premium_reports_select_own" on public.human_premium_reports;
--   create policy "human_premium_reports_select_own" on public.human_premium_reports
--     for select using (auth.uid() = user_id);

drop policy if exists "human_premium_reports_select_own" on public.human_premium_reports;
create policy "human_premium_reports_select_own" on public.human_premium_reports
  for select using (
    auth.uid() = user_id
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
