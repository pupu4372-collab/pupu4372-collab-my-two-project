-- Human Premium lifetime reports (web-first delivery, optional PDF)

create type public.human_premium_report_status as enum (
  'draft',
  'payment_pending',
  'paid',
  'generating',
  'ready',
  'email_sent',
  'failed',
  'email_failed'
);

create type public.human_premium_calendar_type as enum ('solar', 'lunar');

create type public.human_premium_payment_provider as enum ('paypal', 'card_pg', 'demo');

create table public.human_premium_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,

  person_name text not null,
  email text not null,
  birth_date date not null,
  birth_time time,
  birth_time_unknown boolean not null default false,
  birth_timezone text not null,
  calendar_type public.human_premium_calendar_type not null default 'solar',
  locale text not null default 'ko' check (locale in ('ko', 'en')),
  privacy_consent boolean not null default false,
  birth_basis jsonb not null default '{}',

  payment_provider public.human_premium_payment_provider,
  pg_provider text,
  payment_order_id text unique,
  checkout_session_id text unique,
  payment_capture_id text,
  amount_original numeric(10, 2) not null default 50,
  amount_paid numeric(10, 2) not null default 0,
  currency text not null default 'USD',

  status public.human_premium_report_status not null default 'draft',
  report_payload jsonb,
  failure_stage text,
  failure_message text,
  retry_allowed boolean not null default true,

  web_access_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  web_access_expires_at timestamptz,
  web_access_view_count int not null default 0 check (web_access_view_count >= 0),

  pdf_storage_path text,
  pdf_generated_at timestamptz,
  download_token text unique,
  download_expires_at timestamptz,

  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_sent_at timestamptz,
  email_error text,
  resend_message_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_human_premium_reports_user_id
  on public.human_premium_reports (user_id, created_at desc);

create index idx_human_premium_reports_email
  on public.human_premium_reports (lower(email), created_at desc);

create index idx_human_premium_reports_status
  on public.human_premium_reports (status, created_at desc);

create index idx_human_premium_reports_payment_order
  on public.human_premium_reports (payment_order_id)
  where payment_order_id is not null;

create trigger human_premium_reports_updated_at
before update on public.human_premium_reports
for each row execute function public.set_updated_at();

alter table public.human_premium_reports enable row level security;

create policy "human_premium_reports_select_own" on public.human_premium_reports
  for select using (auth.uid() = user_id);

create policy "human_premium_reports_admin_all" on public.human_premium_reports
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

alter table public.payments
  add column if not exists human_premium_report_id uuid
    references public.human_premium_reports (id) on delete set null;

create index if not exists idx_payments_human_premium_report_id
  on public.payments (human_premium_report_id)
  where human_premium_report_id is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'human-premium-reports',
  'human-premium-reports',
  false,
  52428800,
  array['application/pdf']
)
on conflict (id) do nothing;
