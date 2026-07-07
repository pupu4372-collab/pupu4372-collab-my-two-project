-- Allow pet premium LLM cache rows in saju_llm_cache

alter table public.saju_llm_cache
  drop constraint if exists saju_llm_cache_cache_kind_check;

alter table public.saju_llm_cache
  add constraint saju_llm_cache_cache_kind_check check (
    cache_kind in (
      'interpret_pet',
      'interpret_human',
      'human_premium_section',
      'pet_premium'
    )
  );

comment on column public.saju_llm_cache.cache_kind is
  'interpret_pet | interpret_human | human_premium_section | pet_premium';
