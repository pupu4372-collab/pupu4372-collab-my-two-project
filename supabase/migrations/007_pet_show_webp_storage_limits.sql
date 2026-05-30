-- Enforce cost-saving image uploads: WebP only, 1MB max.

update storage.buckets
set
  file_size_limit = 1048576,
  allowed_mime_types = array['image/webp']
where id = 'pet-show';
