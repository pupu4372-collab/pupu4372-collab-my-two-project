-- Block anonymous auth sessions from uploading to pet-show (members only).
-- Rollback:
--   drop policy if exists "pet_show_images_auth_upload" on storage.objects;
--   create policy "pet_show_images_auth_upload"
--   on storage.objects for insert to authenticated
--   with check (
--     bucket_id = 'pet-show'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );

drop policy if exists "pet_show_images_auth_upload" on storage.objects;
create policy "pet_show_images_auth_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pet-show'
  and (storage.foldername(name))[1] = (auth.uid())::text
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is not true
);
