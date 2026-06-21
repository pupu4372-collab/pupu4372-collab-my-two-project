-- Server-side LLM interpretation cache (service role only)

create table public.saju_llm_cache (
  cache_key text primary key,
  cache_kind text not null check (
    cache_kind in ('interpret_pet', 'interpret_human', 'human_premium_section')
  ),
  locale text not null check (locale in ('ko', 'en')),
  provider text not null,
  model text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index idx_saju_llm_cache_kind_created
  on public.saju_llm_cache (cache_kind, created_at desc);

create index idx_saju_llm_cache_expires
  on public.saju_llm_cache (expires_at)
  where expires_at is not null;

alter table public.saju_llm_cache enable row level security;
