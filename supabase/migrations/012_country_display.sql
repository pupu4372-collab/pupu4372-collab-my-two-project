alter table public.profiles
  add column if not exists country_code text,
  add column if not exists show_country boolean not null default true;

alter table public.profiles
  drop constraint if exists profiles_country_code_format,
  add constraint profiles_country_code_format
    check (country_code is null or country_code ~ '^[A-Z]{2}$' or country_code = 'OTHER');

alter table public.community_posts
  add column if not exists country_code text;

alter table public.community_posts
  drop constraint if exists community_posts_country_code_format,
  add constraint community_posts_country_code_format
    check (country_code is null or country_code ~ '^[A-Z]{2}$' or country_code = 'OTHER');
