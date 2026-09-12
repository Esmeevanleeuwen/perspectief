-- The initial Meridian CMS seed stored two paragraph breaks as literal \\n text.
-- Normalize those values to actual line breaks so the public block renderer
-- and the admin textareas both work with normal editorial text.
update public.content_sections
set body = replace(body, E'\\n', E'\n'),
    updated_at = now()
where content_id = (
  select id from public.content_items where slug = 'tegenspraak'
)
  and body like '%\\n%';
