-- Already applied manually on live DB. Record only.
revoke update (role) on public.profiles from anon, authenticated;
