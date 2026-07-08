-- Supabase Storage bucket for daily-fortune Insta card pet photos.
-- Path shape (see upload-pet-fortune-photo.ts): {auth.uid()}/{pet_id}.{ext}
-- Manual apply in SQL Editor only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "pet_photos_public_read"
on storage.objects for select
using (bucket_id = 'pet-photos');

create policy "pet_photos_auth_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "pet_photos_auth_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "pet_photos_auth_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
