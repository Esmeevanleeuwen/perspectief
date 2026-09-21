-- Public editorial images only. Existing private buckets are not modified.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-images', 'article-images', true, 6291456, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- The browser uses the current user session, never a service-role key.
-- Immutable UUID filenames keep replacements from changing earlier live revisions.
create policy article_images_insert_editorial
on storage.objects for insert to authenticated
with check (
  bucket_id = 'article-images'
  and (select public.is_editorial())
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
);
-- No update/delete policy: removing an image in the UI only clears the draft URL.
-- Public bucket reads are deliberate. Do not upload confidential sources here.
