-- Free reports must not use sentinel checkout_session_id values (unique constraint).
-- Column is already nullable; clear legacy fixed values.

update public.human_premium_reports
set checkout_session_id = null
where checkout_session_id in ('daily-free', 'daily-extra', '')
   or checkout_session_id like 'bundle:%';

comment on column public.human_premium_reports.checkout_session_id is
  'Unique paid checkout session id for idempotent fulfillment; NULL for free reports.';
