-- Ensure the weekly Pet Show ranking view respects caller RLS policies.

alter view public.pet_show_ranking_weekly
set (security_invoker = on);
