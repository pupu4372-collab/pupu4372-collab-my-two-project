-- Daily lucky routine: per-account KST daily quota + paid extra checkout ledger

create table if not exists public.human_premium_daily_extra_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_order_id text not null unique,
  locale text not null check (locale in ('ko', 'en')),
  currency text not null check (currency in ('KRW', 'USD')),
  amount_paid numeric(10, 2) not null,
  payment_provider text not null check (payment_provider in ('portone', 'paypal_link', 'demo')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'consumed')),
  consumed_report_id uuid references public.human_premium_reports (id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_human_premium_daily_extra_orders_user
  on public.human_premium_daily_extra_orders (user_id, created_at desc);

create index if not exists idx_human_premium_reports_daily_quota
  on public.human_premium_reports (user_id, report_type, created_at desc)
  where report_type = 'daily';

create trigger human_premium_daily_extra_orders_updated_at
before update on public.human_premium_daily_extra_orders
for each row execute function public.set_updated_at();

alter table public.human_premium_daily_extra_orders enable row level security;

create policy "human_premium_daily_extra_orders_select_own"
  on public.human_premium_daily_extra_orders
  for select using (auth.uid() = user_id);

comment on table public.human_premium_daily_extra_orders is
  'Paid daily-extra checkout orders (1 payment → 1 additional daily report generation).';
