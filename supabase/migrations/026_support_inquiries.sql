-- Customer support inquiries submitted from /support

create type public.support_inquiry_status as enum (
  'pending',
  'reviewing',
  'resolved',
  'closed'
);

create table public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text,
  email text not null,
  category text not null default 'general'
    check (category in ('guide', 'account', 'payment_report', 'community', 'partnership', 'general')),
  title text not null,
  message text not null,
  status public.support_inquiry_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_support_inquiries_status
  on public.support_inquiries (status, created_at desc);

create index idx_support_inquiries_user_id
  on public.support_inquiries (user_id, created_at desc)
  where user_id is not null;

create index idx_support_inquiries_email
  on public.support_inquiries (lower(email), created_at desc);

create trigger support_inquiries_updated_at
before update on public.support_inquiries
for each row execute function public.set_updated_at();

alter table public.support_inquiries enable row level security;

create policy "support_inquiries_select_own" on public.support_inquiries
  for select using (auth.uid() = user_id);

create policy "support_inquiries_admin_all" on public.support_inquiries
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
