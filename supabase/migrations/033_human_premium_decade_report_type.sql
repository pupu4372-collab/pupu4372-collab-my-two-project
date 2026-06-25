-- Rename human premium report type: weekly → decade (10년 인생 청사진)

update public.human_premium_reports
set report_type = 'decade'
where report_type = 'weekly';

comment on column public.human_premium_reports.report_type is
  'Report product type: daily, decade, monthly, yearly, mental, love, career, business, wealth, lifetime';
