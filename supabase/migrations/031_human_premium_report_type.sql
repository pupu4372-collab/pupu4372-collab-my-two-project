-- Human premium reports: report type (daily, weekly, lifetime, etc.)

alter table public.human_premium_reports
  add column if not exists report_type text not null default 'lifetime';

create index if not exists human_premium_reports_report_type_idx
  on public.human_premium_reports (report_type);

comment on column public.human_premium_reports.report_type is
  'Report product type: daily, weekly, monthly, yearly, mental, love, career, business, lifetime';
