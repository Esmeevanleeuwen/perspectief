-- Public research links must use released editions, never editable article rows.
-- This additive reader does not publish content or change existing access policies.
create or replace function public.publishing_research_links(p_research_id uuid)
returns table(id uuid, slug text, title text, summary text, content_type text, relation text, position integer)
language sql stable security definer set search_path = '' as $$
  select e.content_id, e.slug, r.document->>'title', r.document->>'summary',
         r.document->>'content_type', c.relation, c.position
  from public.content_items parent
  join public.research_children c on c.research_content_id = parent.id
  join public.publishing_editions e on e.content_id = c.child_content_id
    and e.platform = 'meridian' and e.state = 'published'
  join public.publishing_revisions r on r.id = e.revision_id and r.content_id = e.content_id
  where parent.id = p_research_id and parent.content_type = 'research' and parent.status = 'published'
    and r.document->>'content_type' in ('article','analysis','case')
  union all
  select child.id, child.slug, child.title, child.summary, child.content_type, c.relation, c.position
  from public.content_items parent
  join public.research_children c on c.research_content_id = parent.id
  join public.content_items child on child.id = c.child_content_id
  where parent.id = p_research_id and parent.content_type = 'research' and parent.status = 'published'
    and child.content_type = 'research' and child.status = 'published'
  order by position, id;
$$;
revoke all on function public.publishing_research_links(uuid) from public, anon, authenticated;
grant execute on function public.publishing_research_links(uuid) to anon, authenticated;
