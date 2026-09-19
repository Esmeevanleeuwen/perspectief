-- Public search is SECURITY DEFINER, so RLS alone cannot protect article drafts.
-- Preserve the existing search response and Dutch ranking, but use released
-- Meridian snapshots for every article field and every matching section.
create or replace function public.search_meridian(search_query text, content_filter text default null)
returns table(id uuid, slug text, title text, summary text, content_type text, eyebrow text,
  matched_section text, excerpt text, match_count bigint, rank real)
language sql stable security definer set search_path = '' as $$
  with public_documents as (
    select e.content_id as id, e.slug, r.document->>'title' as title,
      r.document->>'summary' as summary, r.document->>'content_type' as content_type,
      r.document->>'eyebrow' as eyebrow,
      case when jsonb_typeof(r.document->'content_sections') = 'array'
        then r.document->'content_sections' else '[]'::jsonb end as sections,
      ''::text as central_question, ''::text as method, ''::text as boundaries
    from public.publishing_editions e
    join public.publishing_revisions r on r.id=e.revision_id and r.content_id=e.content_id
    where e.platform='meridian' and e.state='published'
      and r.document->>'content_type' in ('article','analysis','case')
    union all
    select ci.id, ci.slug, ci.title, ci.summary, ci.content_type, ci.eyebrow,
      coalesce((select jsonb_agg(jsonb_build_object('title',cs.title,'body',cs.body,'position',cs.position)
        order by cs.position,cs.id) from public.content_sections cs where cs.content_id=ci.id),'[]'::jsonb),
      coalesce(rd.central_question,''), coalesce(rd.method,''), coalesce(rd.boundaries,'')
    from public.content_items ci
    left join public.research_dossiers rd on rd.content_id=ci.id
    where ci.content_type='research' and ci.status='published'
  ), documents as (
    select d.*,
      coalesce((select string_agg(distinct s->>'title',' ') from jsonb_array_elements(d.sections) s),'') as section_titles,
      coalesce((select string_agg(s->>'body',' ' order by (s->>'position')::integer)
        from jsonb_array_elements(d.sections) s),'') as section_bodies
    from public_documents d
    where content_filter is null or content_filter='all'
      or (content_filter='research' and d.content_type='research')
      or (content_filter='article' and d.content_type in ('article','analysis','case'))
  ), prepared as (
    select d.*,
      setweight(to_tsvector('pg_catalog.dutch',coalesce(d.title,'')),'A') ||
      setweight(to_tsvector('pg_catalog.dutch',concat_ws(' ',d.summary,d.section_titles,d.central_question)),'B') ||
      setweight(to_tsvector('pg_catalog.dutch',concat_ws(' ',d.section_bodies,d.method,d.boundaries)),'C') as search_vector,
      concat_ws(' ',d.title,d.summary,d.section_titles,d.central_question,d.section_bodies,d.method,d.boundaries) as full_text
    from documents d
  ), query_data as (
    select websearch_to_tsquery('pg_catalog.dutch',left(btrim(coalesce(search_query,'')),1000)) as query
  ), matches as (
    select p.*,q.query,ts_rank_cd(p.search_vector,q.query) as result_rank
    from prepared p cross join query_data q
    where length(btrim(coalesce(search_query,''))) between 1 and 1000 and p.search_vector @@ q.query
  )
  select m.id,m.slug,m.title,m.summary,m.content_type,m.eyebrow,
    (select s->>'title' from jsonb_array_elements(m.sections) s
      where to_tsvector('pg_catalog.dutch',concat_ws(' ',s->>'title',s->>'body')) @@ m.query
      order by (s->>'position')::integer limit 1) as matched_section,
    ts_headline('pg_catalog.dutch',m.full_text,m.query,
      'StartSel=<<<, StopSel=>>>, MaxWords=34, MinWords=14, ShortWord=3, MaxFragments=1') as excerpt,
    greatest((select count(*) from jsonb_array_elements(m.sections) s
      where to_tsvector('pg_catalog.dutch',concat_ws(' ',s->>'title',s->>'body')) @@ m.query),1::bigint) as match_count,
    m.result_rank::real as rank
  from matches m order by m.result_rank desc,m.title asc limit 50;
$$;
revoke all on function public.search_meridian(text,text) from public,anon,authenticated;
grant execute on function public.search_meridian(text,text) to anon,authenticated;
