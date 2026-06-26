-- Unique PortOne payment id for idempotent verify upserts

do $constraint$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pet_premium_unlocks_payment_id_key'
      and conrelid = 'public.pet_premium_unlocks'::regclass
  ) then
    alter table public.pet_premium_unlocks
      add constraint pet_premium_unlocks_payment_id_key unique (payment_id);
  end if;
end
$constraint$;
