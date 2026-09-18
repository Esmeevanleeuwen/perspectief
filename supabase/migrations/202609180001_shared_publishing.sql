-- Shared articles; draft content is never a public release.
-- Additive migration. Raw-content shielding is enabled after the new reader deploys.
create table if not exists public.publishing_sites (
  id text primary key check (id in ('meridian','avera')),
  label text not null,
  origin text check (origin is null or origin ~ '^https://[a-z0-9.-]+(:[0-9]+)?$')
);
insert into public.publishing_sites(id,label,origin) values
  ('meridian','Meridian','https://meridiancollective.nl'),('avera','Avera',null)
on conflict (id) do nothing;
create table if not exists public.publishing_configs (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  version bigint not null default 1,
  config jsonb not null check(jsonb_typeof(config)='object'),
  updated_at timestamptz not null default now()
);
create table if not exists public.publishing_revisions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  document jsonb not null,
  created_at timestamptz not null default now(),
  unique(id,content_id)
);
create table if not exists public.publishing_editions (
  content_id uuid not null references public.content_items(id) on delete cascade,
  platform text not null references public.publishing_sites(id),
  revision_id uuid not null,
  slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=180),
  state text not null default 'published' check(state in ('published','withdrawn')),
  settings jsonb not null,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(content_id,platform), unique(platform,slug),
  foreign key(revision_id,content_id) references public.publishing_revisions(id,content_id)
);
create table if not exists public.publishing_slug_history (
  platform text not null references public.publishing_sites(id),
  slug text not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  primary key(platform,slug)
);
create table if not exists public.publishing_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check(length(btrim(title)) between 1 and 200),
  slug text not null unique,
  chapters uuid[] not null default '{}',
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);
create table if not exists public.publishing_report_editions (
  report_id uuid not null references public.publishing_reports(id) on delete cascade,
  platform text not null references public.publishing_sites(id),
  title text not null, slug text not null, chapters uuid[] not null,
  updated_at timestamptz not null default now(),
  primary key(report_id,platform), unique(platform,slug)
);
create index if not exists publishing_reports_chapters on public.publishing_reports using gin(chapters);
create index if not exists publishing_report_live_chapters on public.publishing_report_editions using gin(chapters);
create index if not exists publishing_editions_listing on public.publishing_editions(platform,state,published_at desc,content_id);
create index if not exists publishing_revisions_content on public.publishing_revisions(content_id,created_at desc);

-- No direct public access, not even to old revisions, report drafts or internal tags.
do $$ declare t text; begin
  foreach t in array array['publishing_sites','publishing_configs','publishing_revisions','publishing_editions','publishing_slug_history','publishing_reports','publishing_report_editions'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
  end loop;
end $$;

create or replace function public.publishing_default(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('tags','[]'::jsonb,'relations','[]'::jsonb,'sites',jsonb_build_object(
   'meridian',jsonb_build_object('selected',true,'slug',c.slug,'seo_title','','description','','indexable',true,'canonical','self','featured',c.featured,'position',coalesce(c.featured_position,'side')),
   'avera',jsonb_build_object('selected',false,'slug',c.slug,'seo_title','','description','','indexable',true,'canonical','self','featured',false,'position','side')),
   'hero_image',coalesce(c.hero_image,''),'image_alt',coalesce(c.image_alt,''))
 from public.content_items c where c.id=p_id and c.content_type in ('article','analysis','case');
$$;
create or replace function public.publishing_document(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',c.id,'slug',c.slug,'content_type',c.content_type,'title',c.title,
 'eyebrow',c.eyebrow,'subtitle',c.subtitle,'summary',c.summary,'hero_image',c.hero_image,'image_alt',c.image_alt,
 'status','published','featured',c.featured,'featured_position',c.featured_position,
 'published_at',coalesce(c.published_at,now()),'updated_at',c.updated_at,
 'metadata',jsonb_strip_nulls(jsonb_build_object('experiences',c.metadata->'experiences','experts',c.metadata->'experts','provinces',c.metadata->'provinces','display_date',c.metadata->'display_date')),
 'content_sections',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'content_id',s.content_id,'section_type',s.section_type,'position',s.position,'title',s.title,'body',s.body,
 'data',jsonb_strip_nulls(jsonb_build_object('points',s.data->'points','eyebrow',s.data->'eyebrow'))) order by s.position,s.id) from public.content_sections s where s.content_id=c.id),'[]'::jsonb))
 from public.content_items c where c.id=p_id and c.content_type in ('article','analysis','case');
$$;

create or replace function public.publishing_context(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare c public.content_items%rowtype; cfg public.publishing_configs%rowtype;
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Editorial access required' using errcode='42501'; end if;
 select * into c from public.content_items where id=p_id and content_type in ('article','analysis','case');
 if not found then raise exception 'Article unavailable' using errcode='P0002'; end if;
 select * into cfg from public.publishing_configs where content_id=p_id;
 return jsonb_build_object('content_id',p_id,'version',coalesce(cfg.version,0),'config',coalesce(cfg.config,public.publishing_default(p_id)),
 'sites',(select jsonb_agg(to_jsonb(s) order by id) from public.publishing_sites s),
 'can_set_origin',public.current_role()='owner',
 'reports',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'title',r.title,'slug',r.slug,'version',r.version,'chapters',coalesce((select jsonb_agg(jsonb_build_object('id',c2.id,'title',c2.title) order by a.n) from unnest(r.chapters) with ordinality a(id,n) join public.content_items c2 on c2.id=a.id),'[]'::jsonb)) order by r.updated_at desc) from public.publishing_reports r),'[]'::jsonb),
 'editions',coalesce((select jsonb_agg(jsonb_build_object('platform',e.platform,'slug',e.slug,'state',e.state,'published_at',e.published_at,'updated_at',e.updated_at,'revision_id',e.revision_id)) from public.publishing_editions e where e.content_id=p_id),'[]'::jsonb),
 'backlinks',coalesce((select jsonb_agg(jsonb_build_object('id',c2.id,'title',c2.title,'inline',exists(select 1 from public.content_sections s where s.content_id=c2.id and position('](content:'||p_id::text in coalesce(s.body,''))>0))) from public.content_items c2 where c2.content_type in ('article','analysis','case') and c2.id<>p_id and
 (exists(select 1 from public.content_sections s where s.content_id=c2.id and position('](content:'||p_id::text in coalesce(s.body,''))>0) or exists(select 1 from public.publishing_configs pc, jsonb_array_elements(pc.config->'relations') rel where pc.content_id=c2.id and rel->>'target'=p_id::text))),'[]'::jsonb));
end $$;

create or replace function public.publishing_search(p_query text default '') returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare pattern text; result jsonb;
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Editorial access required' using errcode='42501'; end if;
 if p_query is null or length(p_query)>100 then raise exception 'Invalid query' using errcode='22023'; end if;
 pattern:='%'||replace(replace(replace(p_query,E'\\',E'\\\\'),'%',E'\\%'),'_',E'\\_')||'%';
 select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into result from (
 select c.id,c.title,c.content_type,
 coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'title',coalesce(nullif(s.title,''),'Onderdeel '||(s.position+1)::text)) order by s.position,s.id) from public.content_sections s where s.content_id=c.id),'[]'::jsonb) as sections
 from public.content_items c where c.content_type in ('article','analysis','case') and
 (p_query='' or c.title ilike pattern or c.summary ilike pattern or exists(select 1 from public.publishing_configs pc,jsonb_array_elements_text(pc.config->'tags') tag where pc.content_id=c.id and tag ilike pattern))
 order by c.updated_at desc,c.id limit 30) x;
 return result;
end $$;

create or replace function public.publishing_save(p_id uuid,p_version bigint,p_config jsonb) returns bigint
language plpgsql security definer set search_path='' as $$
declare current_version bigint; site text; s jsonb; rel jsonb; t text;
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Editing not permitted' using errcode='42501'; end if;
 perform 1 from public.content_items where id=p_id and content_type in ('article','analysis','case') for update;
 if not found then raise exception 'Article unavailable' using errcode='P0002'; end if;
 if exists(select 1 from jsonb_array_elements(case when jsonb_typeof(p_config->'tags')='array' then p_config->'tags' else '[]'::jsonb end) x where jsonb_typeof(x)<>'string') then raise exception 'Invalid tag' using errcode='22023'; end if;
 if p_config is null or jsonb_typeof(p_config)<>'object' or octet_length(p_config::text)>50000 or jsonb_typeof(p_config->'sites') is distinct from 'object'
 or jsonb_typeof(p_config->'tags') is distinct from 'array' or jsonb_array_length(p_config->'tags')>50
 or jsonb_typeof(p_config->'relations') is distinct from 'array' or jsonb_array_length(p_config->'relations')>100 then raise exception 'Invalid settings' using errcode='22023'; end if;
 for t in select jsonb_array_elements_text(p_config->'tags') loop
   if length(btrim(t)) not between 1 and 80 then raise exception 'Invalid tag' using errcode='22023'; end if;
 end loop;
 for rel in select jsonb_array_elements(p_config->'relations') loop
   if rel->>'kind' is null or rel->>'kind' not in ('background','evidence','followup','counterpoint','related') or not exists(select 1 from public.content_items where id::text=rel->>'target' and id<>p_id and content_type in ('article','analysis','case')) then raise exception 'Invalid relation' using errcode='22023'; end if;
 end loop;
 if length(coalesce(p_config->>'hero_image',''))>2000 or length(coalesce(p_config->>'image_alt',''))>500 then raise exception 'Invalid image' using errcode='22023'; end if;
 if coalesce(p_config->>'hero_image','')<>'' and not (p_config->>'hero_image' ~ '^https?://[^[:space:]]+$' or p_config->>'hero_image' ~ '^/[^/\\[:space:]][^\\[:space:]]*$') then raise exception 'Invalid image URL' using errcode='22023'; end if;
 foreach site in array array['meridian','avera'] loop
   s:=p_config->'sites'->site;
   if s is null or jsonb_typeof(s)<>'object' or not coalesce(s->>'slug' ~ '^[a-z0-9]+(-[a-z0-9]+)*$',false) or length(s->>'slug')>180
     or jsonb_typeof(s->'selected') is distinct from 'boolean' or jsonb_typeof(s->'indexable') is distinct from 'boolean' or jsonb_typeof(s->'featured') is distinct from 'boolean'
     or coalesce(s->>'canonical','') not in ('self','meridian','avera') or coalesce(s->>'position','') not in ('main','side')
     or length(coalesce(s->>'seo_title',''))>200 or length(coalesce(s->>'description',''))>500 then raise exception 'Invalid site settings' using errcode='22023'; end if;
 end loop;
 select version into current_version from public.publishing_configs where content_id=p_id for update;
 if coalesce(current_version,0)<>p_version or p_version is null then raise exception 'Settings changed elsewhere' using errcode='40001'; end if;
 insert into public.publishing_configs(content_id,version,config) values(p_id,1,p_config)
 on conflict(content_id) do update set config=excluded.config,version=public.publishing_configs.version+1,updated_at=now() returning version into current_version;
 return current_version;
end $$;

-- Report operations are serialized. Reordering requires the version the editor read.
create or replace function public.publishing_report_change(p_id uuid,p_action text,p_report uuid default null,p_version bigint default null,p_title text default null,p_order uuid[] default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.publishing_reports%rowtype; new_id uuid; old_id uuid;
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Editing not permitted' using errcode='42501'; end if;
 if not exists(select 1 from public.content_items where id=p_id and content_type in ('article','analysis','case')) then raise exception 'Article unavailable' using errcode='P0002'; end if;
 perform pg_advisory_xact_lock(hashtext('publishing-reports'));
 if p_action='create' then
   if length(btrim(coalesce(p_title,''))) not between 1 and 200 then raise exception 'Report title required' using errcode='22023'; end if;
   if exists(select 1 from public.publishing_reports where p_id=any(chapters)) then raise exception 'Article already in a report' using errcode='22023'; end if;
   new_id:=gen_random_uuid();
   insert into public.publishing_reports(id,title,slug,chapters) values(new_id,btrim(p_title),coalesce(nullif(left(trim(both '-' from regexp_replace(lower(p_title),'[^a-z0-9]+','-','g')),140),''),'verslag')||'-'||left(new_id::text,8),array[p_id]);
   return jsonb_build_object('report_id',new_id);
 end if;
 select * into r from public.publishing_reports where id=p_report for update;
 if not found then raise exception 'Report unavailable' using errcode='P0002'; end if;
 if p_version is null or r.version<>p_version then raise exception 'Report changed elsewhere' using errcode='40001'; end if;
 if p_action='attach' then
   if exists(select 1 from public.publishing_reports where p_id=any(chapters) and id<>p_report) then raise exception 'Detach from the other report first' using errcode='22023'; end if;
   if not p_id=any(r.chapters) then r.chapters:=array_append(r.chapters,p_id); end if;
 elsif p_action='detach' then r.chapters:=array_remove(r.chapters,p_id);
 elsif p_action='reorder' then
   if p_order is null or cardinality(p_order)<>cardinality(r.chapters) or not (p_order @> r.chapters and p_order <@ r.chapters)
   or cardinality(p_order)<>(select count(distinct x) from unnest(p_order) x) then raise exception 'Invalid chapter order' using errcode='22023'; end if;
   r.chapters:=p_order;
 elsif p_action='rename' then
   if length(btrim(coalesce(p_title,''))) not between 1 and 200 then raise exception 'Report title required' using errcode='22023'; end if;
   r.title:=btrim(p_title);
 elsif p_action='next' then
   if not p_id=any(r.chapters) then raise exception 'Not a chapter of this report' using errcode='22023'; end if;
   new_id:=gen_random_uuid();
   insert into public.content_items(id,slug,title,content_type,status,author_id)
     values(new_id,'hoofdstuk-'||new_id::text,coalesce(nullif(btrim(p_title),''),'Nieuw hoofdstuk'),'article','draft',auth.uid());
   insert into public.content_sections(content_id,section_type,position,title,body) values(new_id,'paragraph',0,'','');
   r.chapters:=r.chapters[1:array_position(r.chapters,p_id)]||array[new_id]||r.chapters[array_position(r.chapters,p_id)+1:cardinality(r.chapters)];
 else raise exception 'Invalid report action' using errcode='22023'; end if;
 if cardinality(r.chapters)>200 then raise exception 'Maximum 200 chapters' using errcode='22023'; end if;
 update public.publishing_reports set title=r.title,chapters=r.chapters,version=version+1,updated_at=now() where id=r.id;
 return jsonb_build_object('report_id',r.id,'new_content_id',new_id);
end $$;

create or replace function public.publishing_set_origin(p_site text,p_origin text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_site not in ('meridian','avera') or not coalesce(p_origin ~ '^https://[a-z0-9.-]+(:[0-9]+)?$',false) or length(p_origin)>250 then raise exception 'Use an HTTPS origin without a path' using errcode='22023'; end if;
 update public.publishing_sites set origin=p_origin where id=p_site;
end $$;

create or replace function public.publishing_public_settings(s jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('slug',s->'slug','seo_title',s->'seo_title','description',s->'description','indexable',s->'indexable','canonical',s->'canonical','featured',s->'featured','position',s->'position');
$$;

create or replace function public.publishing_publish(p_id uuid,p_sites text[],p_version bigint,p_revision text,p_report_version bigint default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cfg jsonb; v bigint; doc jsonb; rev uuid; site text; s jsonb; previous_slug text; r public.publishing_reports%rowtype; parent uuid;
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Publishing not permitted' using errcode='42501'; end if;
 if p_sites is null or cardinality(p_sites) not between 1 and 2 or not p_sites <@ array['meridian','avera']::text[] or array_position(p_sites,null) is not null then raise exception 'Choose a publication site' using errcode='22023'; end if;
 perform 1 from public.content_items where id=p_id and content_type in ('article','analysis','case') for update;
 if not found then raise exception 'Article unavailable' using errcode='P0002'; end if;
 perform 1 from public.content_sections where content_id=p_id order by id for update;
 doc:=public.admin_read_publication(p_id);
 if p_revision is null or doc->>'revision'<>p_revision then raise exception 'Save or reload the latest text first' using errcode='40001'; end if;
 if not exists(select 1 from public.content_sections where content_id=p_id and length(btrim(coalesce(body,'')))>0) then raise exception 'Write article content before publishing' using errcode='22023'; end if;
 select version,config into v,cfg from public.publishing_configs where content_id=p_id for update;
 if coalesce(v,0)<>p_version or p_version is null then raise exception 'Settings changed elsewhere' using errcode='40001'; end if;
 cfg:=coalesce(cfg,public.publishing_default(p_id));
 perform pg_advisory_xact_lock(hashtext('publishing-reports'));
 select * into r from public.publishing_reports where p_id=any(chapters) for update;
 if r.id is not null and (p_report_version is null or r.version<>p_report_version) then raise exception 'Report changed elsewhere' using errcode='40001'; end if;
 foreach site in array p_sites loop
   s:=cfg->'sites'->site;
   if not coalesce((s->>'selected')::boolean,false) then raise exception 'Site not selected in saved settings' using errcode='22023'; end if;
   if exists(select 1 from public.publishing_slug_history h where h.platform=site and h.slug=s->>'slug' and h.content_id<>p_id) then raise exception 'URL already reserved by another article' using errcode='23505'; end if;
   -- A canonical must resolve to a live self-canonical edition; avoid circular hints.
   if s->>'canonical' not in ('self',site) then
     if not exists(select 1 from public.publishing_sites ps where ps.id=s->>'canonical' and ps.origin is not null) then raise exception 'Set the canonical site address first' using errcode='22023'; end if;
     if s->>'canonical'=any(p_sites) then
       if coalesce(cfg->'sites'->(s->>'canonical')->>'canonical','self') not in ('self',s->>'canonical') then raise exception 'Circular canonical setting' using errcode='22023'; end if;
     elsif not exists(select 1 from public.publishing_editions e where e.content_id=p_id and e.platform=s->>'canonical' and e.state='published' and e.settings->>'canonical' in ('self',e.platform)) then raise exception 'Publish the primary edition first' using errcode='22023'; end if;
   end if;
 end loop;
 update public.content_items set status='published',published_at=coalesce(published_at,now()),updated_at=clock_timestamp(),featured=case when 'meridian'=any(p_sites) then (cfg->'sites'->'meridian'->>'featured')::boolean else featured end,featured_position=case when 'meridian'=any(p_sites) then cfg->'sites'->'meridian'->>'position' else featured_position end where id=p_id;
 doc:=public.publishing_document(p_id);
 doc:=doc||jsonb_build_object('hero_image',case when coalesce(cfg->>'hero_image','') like '/%' then (select origin from public.publishing_sites where id='meridian')||(cfg->>'hero_image') else nullif(cfg->>'hero_image','') end,'image_alt',cfg->>'image_alt');
 insert into public.publishing_revisions(content_id,document) values(p_id,doc) returning id into rev;
 foreach site in array p_sites loop
   s:=cfg->'sites'->site;
   select slug into previous_slug from public.publishing_editions where content_id=p_id and platform=site;
   if previous_slug is not null and previous_slug<>s->>'slug' then
     insert into public.publishing_slug_history(platform,slug,content_id) values(site,previous_slug,p_id) on conflict(platform,slug) do nothing;
   end if;
   insert into public.publishing_editions(content_id,platform,revision_id,slug,settings) values(p_id,site,rev,s->>'slug',public.publishing_public_settings(s))
   on conflict(content_id,platform) do update set revision_id=excluded.revision_id,slug=excluded.slug,state='published',settings=excluded.settings,updated_at=now();
   -- Remove this chapter from older public reports when its membership changes.
   update public.publishing_report_editions set chapters=array_remove(chapters,p_id),updated_at=now()
   where platform=site and p_id=any(chapters) and report_id is distinct from r.id;
   if r.id is not null then
     insert into public.publishing_report_editions(report_id,platform,title,slug,chapters) values(r.id,site,r.title,r.slug,r.chapters)
     on conflict(report_id,platform) do update set title=excluded.title,chapters=excluded.chapters,updated_at=now();
   end if;
 end loop;
 return jsonb_build_object('revision_id',rev,'sites',to_jsonb(p_sites));
end $$;

create or replace function public.publishing_withdraw(p_id uuid,p_site text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.is_editorial() then raise exception 'Publishing not permitted' using errcode='42501'; end if;
 if p_site not in ('meridian','avera') then raise exception 'Invalid site' using errcode='22023'; end if;
 perform 1 from public.content_items where id=p_id for update;
 update public.publishing_editions set state='withdrawn',updated_at=now() where content_id=p_id and platform=p_site;
 if not exists(select 1 from public.publishing_editions where content_id=p_id and state='published') then update public.content_items set status='draft',updated_at=clock_timestamp() where id=p_id; end if;
end $$;

-- Public projection helpers expose only the current released document.
create or replace function public.publishing_projection(p_id uuid,p_platform text,p_body boolean default false) returns jsonb
language sql stable security definer set search_path='' as $$
 select (case when p_body then r.document else r.document-'content_sections' end)||jsonb_build_object(
  'slug',e.slug,'status','published','featured',coalesce((e.settings->>'featured')::boolean,false),'featured_position',e.settings->>'position',
  'published_at',e.published_at,'updated_at',e.updated_at,'revision_id',e.revision_id,'platform',e.platform,
  'seo',e.settings,'origin',ps.origin,'canonical_url',coalesce((select s2.origin||'/artikelen/'||e2.slug from public.publishing_editions e2 join public.publishing_sites s2 on s2.id=e2.platform where e2.content_id=e.content_id and e2.platform=e.settings->>'canonical' and e2.state='published' and s2.origin is not null),ps.origin||'/artikelen/'||e.slug))
 from public.publishing_editions e join public.publishing_revisions r on r.id=e.revision_id join public.publishing_sites ps on ps.id=e.platform
 where e.content_id=p_id and e.platform=p_platform and e.state='published';
$$;
create or replace function public.publishing_catalog(p_platform text,p_offset integer default 0,p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if p_platform not in ('meridian','avera') or p_platform is null or p_offset is null or p_offset<0 or p_limit is null or p_limit not between 1 and 1000 then raise exception 'Invalid listing' using errcode='22023'; end if;
 select jsonb_build_object('items',coalesce((select jsonb_agg(public.publishing_projection(x.content_id,p_platform,false) order by x.published_at desc,x.content_id) from (select e.content_id,e.published_at from public.publishing_editions e where e.platform=p_platform and e.state='published' order by e.published_at desc,e.content_id limit p_limit offset p_offset) x),'[]'::jsonb),
 'total',(select count(*) from public.publishing_editions e where e.platform=p_platform and e.state='published'),
 'origin',(select origin from public.publishing_sites where id=p_platform)) into result;
 return result;
end $$;
create or replace function public.publishing_public_report(p_platform text,p_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',r.report_id,'title',r.title,'slug',r.slug,'updated_at',r.updated_at,'origin',s.origin,
 'indexable',exists(select 1 from public.publishing_editions e where e.platform=r.platform and e.state='published' and e.content_id=any(r.chapters) and coalesce((e.settings->>'indexable')::boolean,false)),
 'chapters',(select jsonb_agg(jsonb_build_object('id',e.content_id,'title',v.document->>'title','slug',e.slug,'position',c.n,'href','/artikelen/'||e.slug) order by c.n)
 from unnest(r.chapters) with ordinality c(id,n) join public.publishing_editions e on e.content_id=c.id and e.platform=r.platform and e.state='published' join public.publishing_revisions v on v.id=e.revision_id))
 from public.publishing_report_editions r join public.publishing_sites s on s.id=r.platform
 where r.platform=p_platform and r.slug=p_slug and exists(select 1 from public.publishing_editions e where e.platform=r.platform and e.state='published' and e.content_id=any(r.chapters));
$$;
create or replace function public.publishing_report_catalog(p_platform text) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(public.publishing_public_report(p_platform,r.slug) order by r.updated_at desc) filter(where public.publishing_public_report(p_platform,r.slug) is not null),'[]'::jsonb)
 from public.publishing_report_editions r where r.platform=p_platform;
$$;
create or replace function public.publishing_article(p_platform text,p_slug text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare item_id uuid; doc jsonb; targets jsonb; report jsonb;
begin
 if p_platform not in ('meridian','avera') or p_platform is null or p_slug is null or length(p_slug)>180 then raise exception 'Invalid article' using errcode='22023'; end if;
 select content_id into item_id from public.publishing_editions where platform=p_platform and slug=p_slug and state='published';
 if item_id is null then select h.content_id into item_id from public.publishing_slug_history h join public.publishing_editions e on e.content_id=h.content_id and e.platform=h.platform and e.state='published' where h.platform=p_platform and h.slug=p_slug; end if;
 if item_id is null then return null; end if;
 doc:=public.publishing_projection(item_id,p_platform,true);
 with ids as (select distinct ((regexp_matches(coalesce(s->>'body',''),'\]\(content:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})','g'))[1])::uuid id from jsonb_array_elements(doc->'content_sections') s),
 resolved as (select distinct on (e.content_id) e.content_id,e.platform,e.slug,ps.origin,v.document
 from ids join public.publishing_editions e on e.content_id=ids.id and e.state='published' join public.publishing_sites ps on ps.id=e.platform join public.publishing_revisions v on v.id=e.revision_id
 where e.platform=p_platform or ps.origin is not null order by e.content_id,(e.platform=p_platform) desc,e.platform)
 select coalesce(jsonb_object_agg(x.content_id::text,jsonb_build_object('href',(case when x.platform=p_platform then '' else x.origin end)||'/artikelen/'||x.slug,'title',x.document->>'title','sections',coalesce((select jsonb_agg(s->>'id') from jsonb_array_elements(x.document->'content_sections') s),'[]'::jsonb))),'{}'::jsonb) into targets from resolved x;
 select public.publishing_public_report(p_platform,r.slug) into report from public.publishing_report_editions r where r.platform=p_platform and item_id=any(r.chapters) order by r.updated_at desc limit 1;
 return doc||jsonb_build_object('targets',targets,'report',report);
end $$;

-- Seed only articles already public on Meridian. Nothing is sent to Avera.
do $$ declare c record; rid uuid; cfg jsonb; doc jsonb; begin
 for c in select * from public.content_items where content_type in ('article','analysis','case') and status='published' loop
   if not exists(select 1 from public.publishing_editions where content_id=c.id) then
     cfg:=public.publishing_default(c.id);
     insert into public.publishing_configs(content_id,config) values(c.id,cfg) on conflict(content_id) do nothing;
     doc:=public.publishing_document(c.id);
     if doc->>'hero_image' like '/%' then doc:=doc||jsonb_build_object('hero_image','https://meridiancollective.nl'||(doc->>'hero_image')); end if;
     insert into public.publishing_revisions(content_id,document) values(c.id,doc) returning id into rid;
     insert into public.publishing_editions(content_id,platform,revision_id,slug,settings,published_at,updated_at)
       values(c.id,'meridian',rid,c.slug,public.publishing_public_settings(cfg->'sites'->'meridian'),coalesce(c.published_at,c.created_at),c.updated_at);
   end if;
 end loop;
end $$;

-- Functions are closed by default; only explicit public projections are anonymous.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'publishing_%' loop
   execute format('revoke all on function %s from public, anon, authenticated',f.signature);
 end loop;
end $$;
grant execute on function public.publishing_context(uuid),public.publishing_search(text),public.publishing_save(uuid,bigint,jsonb),public.publishing_report_change(uuid,text,uuid,bigint,text,uuid[]),public.publishing_set_origin(text,text),public.publishing_publish(uuid,text[],bigint,text,bigint),public.publishing_withdraw(uuid,text) to authenticated;
grant execute on function public.publishing_catalog(text,integer,integer),public.publishing_article(text,text),public.publishing_public_report(text,text),public.publishing_report_catalog(text) to anon,authenticated;

create or replace function public.publishing_article_address(p_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('platform',e.platform,'slug',e.slug,'origin',s.origin)
 from public.publishing_editions e join public.publishing_sites s on s.id=e.platform
 where e.content_id=p_id and e.state='published' and (e.platform='meridian' or s.origin is not null)
 order by (e.platform='meridian') desc limit 1;
$$;
revoke all on function public.publishing_article_address(uuid) from public,anon,authenticated;
grant execute on function public.publishing_article_address(uuid) to anon,authenticated;
