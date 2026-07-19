-- Home strip banner flag on notices (admin + HomeGateway).
-- No RLS / index changes. Writes remain service-role only.

alter table public.notices
  add column if not exists show_home_banner boolean not null default false;
