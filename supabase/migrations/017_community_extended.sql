-- Q&A resolution, tips meta, SEO slugs, saves

alter table public.community_posts
  add column if not exists is_answered boolean not null default false,
  add column if not exists adopted_answer_id uuid references public.post_comments (id) on delete set null,
  add column if not exists seo_slug text,
  add column if not exists difficulty text,
  add column if not exists time_required text,
  add column if not exists save_count int not null default 0 check (save_count >= 0),
  add column if not exists share_count int not null default 0 check (share_count >= 0);

alter table public.community_posts
  drop constraint if exists community_posts_difficulty_check,
  add constraint community_posts_difficulty_check
    check (difficulty is null or difficulty in ('easy', 'medium', 'hard'));

create unique index if not exists community_posts_seo_slug_unique_idx
  on public.community_posts (seo_slug)
  where seo_slug is not null;

create index if not exists community_posts_qa_answered_idx
  on public.community_posts (post_type, is_answered, created_at desc)
  where post_type = 'qa';

-- Bookmarks (tips / qa)
create table if not exists public.post_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_saves_user_idx on public.post_saves (user_id, created_at desc);

alter table public.post_saves enable row level security;

drop policy if exists "post_saves_own" on public.post_saves;
create policy "post_saves_own" on public.post_saves
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.sync_post_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set save_count = save_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_posts
    set save_count = greatest(0, save_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_saves_count_sync on public.post_saves;
create trigger post_saves_count_sync
after insert or delete on public.post_saves
for each row execute function public.sync_post_save_count();
