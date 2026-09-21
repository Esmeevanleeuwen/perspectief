-- Presentation is saved per site, released with the existing versioned publication.
-- No content, report membership, role, old revision, or existing edition is changed.

alter table public.publishing_configs add constraint publishing_configs_show_chapters_boolean
check (
  (not ((config->'sites'->'meridian') ? 'show_chapters') or jsonb_typeof(config->'sites'->'meridian'->'show_chapters') = 'boolean')
  and (not ((config->'sites'->'avera') ? 'show_chapters') or jsonb_typeof(config->'sites'->'avera'->'show_chapters') = 'boolean')
);

create or replace function public.publishing_public_settings(s jsonb)
returns jsonb language sql immutable set search_path = '' as $$
 select jsonb_build_object('slug',s->'slug','seo_title',s->'seo_title','description',s->'description',
   'indexable',s->'indexable','canonical',s->'canonical','featured',s->'featured','position',s->'position',
   'show_chapters',s->'show_chapters' is distinct from 'false'::jsonb);
$$;

create or replace function public.publishing_public_report(p_platform text, p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('id',r.report_id,'title',r.title,'slug',r.slug,'updated_at',r.updated_at,'origin',s.origin,
 'indexable',exists(select 1 from public.publishing_editions e where e.platform=r.platform and e.state='published'
   and e.content_id=any(r.chapters) and e.settings->'show_chapters' is distinct from 'false'::jsonb
   and coalesce((e.settings->>'indexable')::boolean,false)),
 'chapters',(select jsonb_agg(jsonb_build_object('id',e.content_id,'title',v.document->>'title','slug',e.slug,'position',c.n,'href','/artikelen/'||e.slug) order by c.n)
 from unnest(r.chapters) with ordinality c(id,n)
 join public.publishing_editions e on e.content_id=c.id and e.platform=r.platform and e.state='published'
 join public.publishing_revisions v on v.id=e.revision_id
 where e.settings->'show_chapters' is distinct from 'false'::jsonb))
 from public.publishing_report_editions r join public.publishing_sites s on s.id=r.platform
 where r.platform=p_platform and r.slug=p_slug
 and exists(select 1 from public.publishing_editions e where e.platform=r.platform and e.state='published'
   and e.content_id=any(r.chapters) and e.settings->'show_chapters' is distinct from 'false'::jsonb);
$$;

-- Preserve the existing resolver and its exact regex, permissions, and fixed search_path.
-- Fail closed if its expected return contract has changed since this migration was written.
do $migration$
declare definition text;
  expected text := 'return doc||jsonb_build_object(''targets'',targets,''report'',report);';
begin
  definition := pg_get_functiondef('public.publishing_article(text,text)'::regprocedure);
  if position(expected in definition) = 0 then
    raise exception 'Unexpected publishing_article definition; review before applying article_display';
  end if;
  execute replace(definition, expected,
    'if doc->''seo''->''show_chapters'' = ''false''::jsonb then report := null; end if; ' || expected);
end $migration$;
