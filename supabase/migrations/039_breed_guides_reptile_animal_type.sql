-- Split reptile breed guides from other small pets / birds.

alter table public.breed_guides
  drop constraint if exists breed_guides_animal_type_check;

alter table public.breed_guides
  add constraint breed_guides_animal_type_check
    check (animal_type in ('dog', 'cat', 'reptile', 'other'));

update public.breed_guides
set animal_type = 'reptile', updated_at = now()
where seo_slug in (
  'leopard-gecko',
  'crested-gecko',
  'bearded-dragon',
  'semi-aquatic-turtle'
);
