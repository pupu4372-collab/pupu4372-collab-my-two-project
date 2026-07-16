-- Exact email lookup for signup-confirm UI (replaces auth.admin.listUsers pagination).
-- Callable only with service_role.

create or replace function public.auth_email_signup_status(p_email text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_id uuid;
  confirmed_at timestamptz;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return json_build_object('exists', false, 'confirmed', false);
  end if;

  select u.id, u.email_confirmed_at
  into found_id, confirmed_at
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  if found_id is null then
    return json_build_object('exists', false, 'confirmed', false);
  end if;

  return json_build_object(
    'exists', true,
    'confirmed', confirmed_at is not null
  );
end;
$$;

revoke all on function public.auth_email_signup_status(text) from public;
revoke all on function public.auth_email_signup_status(text) from anon, authenticated;
grant execute on function public.auth_email_signup_status(text) to service_role;

comment on function public.auth_email_signup_status(text) is
  'Service-role only: signup confirm check (exists + email_confirmed_at).';
