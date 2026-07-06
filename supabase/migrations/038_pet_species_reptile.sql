-- Split reptile vs other friends at pet species level (legacy 'other' rows unchanged).

alter type public.pet_species add value if not exists 'reptile';

alter table public.community_posts
  drop constraint if exists community_posts_animal_type_check;

alter table public.community_posts
  add constraint community_posts_animal_type_check
  check (animal_type is null or animal_type in ('dog', 'cat', 'reptile', 'other'));
