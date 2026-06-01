-- Community participation categories for breed/species experience stories.

insert into public.content_categories (
  channel,
  slug,
  name_ko,
  name_en,
  theme_color,
  emoji,
  sort_order,
  is_active,
  is_coming_soon
) values
  ('community', 'community-experience', '품종별 경험담', 'Breed Experiences', '#22C55E', '🧬', 5, true, false),
  ('community', 'community-other-animals', '다른동물 경험담', 'Other Animal Stories', '#22C55E', '🐾', 6, true, false)
on conflict (slug) do update set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  theme_color = excluded.theme_color,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  is_active = true,
  is_coming_soon = false;
