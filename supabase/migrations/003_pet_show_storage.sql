-- Supabase Storage bucket for Pet Show photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-show',
  'pet-show',
  true,
  1048576,
  array['image/webp']
)
on conflict (id) do nothing;

create policy "pet_show_images_public_read"
on storage.objects for select
using (bucket_id = 'pet-show');

create policy "pet_show_images_auth_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-show'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "pet_show_images_auth_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-show'
  and (storage.foldername(name))[1] = auth.uid()::text
);
