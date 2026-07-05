-- Allow public inquiry submission via server API (anon or service role)

drop policy if exists "support_inquiries_insert_public" on public.support_inquiries;

create policy "support_inquiries_insert_public" on public.support_inquiries
  for insert with check (true);
