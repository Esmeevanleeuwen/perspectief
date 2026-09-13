-- Private working material is separate from content_items and public publishing.
create table public.admin_writing_spaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 1000000),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
create table public.admin_writing_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 500),
  summary text not null default '' check (length(summary) <= 100000),
  sections jsonb not null default '[]' check (jsonb_typeof(sections) = 'array' and octet_length(sections::text) <= 1000000),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index admin_writing_notes_owner_updated on public.admin_writing_notes(user_id, updated_at desc, id);
alter table public.admin_writing_spaces enable row level security;
alter table public.admin_writing_notes enable row level security;
revoke all on public.admin_writing_spaces, public.admin_writing_notes from anon, public;
grant select, insert, update, delete on public.admin_writing_spaces, public.admin_writing_notes to authenticated;
create policy writing_space_owner on public.admin_writing_spaces for all to authenticated
using (user_id = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin','editor','researcher','fact_checker')))
with check (user_id = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin','editor','researcher','fact_checker')));
create policy writing_note_owner on public.admin_writing_notes for all to authenticated
using (user_id = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin','editor','researcher','fact_checker')))
with check (user_id = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin','editor','researcher','fact_checker')));

-- Invoker functions keep all existing content RLS and editorial permissions.
create function public.admin_read_publication(p_id uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare item public.content_items%rowtype; blocks jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('owner','admin','editor','researcher','fact_checker')) then
    raise exception 'Editorial access required' using errcode='42501';
  end if;
  select * into item from public.content_items where id=p_id;
  if not found then raise exception 'Publication unavailable' using errcode='P0002'; end if;
  select coalesce(jsonb_agg(to_jsonb(s) order by s.position,s.id),'[]') into blocks from public.content_sections s where s.content_id=p_id;
  return jsonb_build_object('item',to_jsonb(item),'sections',blocks,'revision',md5(to_jsonb(item)::text || blocks::text),'editable',public.is_editorial());
end;
$$;

-- One transaction: stale edits fail before any title or section is changed.
create function public.admin_save_publication(p_id uuid,p_revision text,p_title text,p_summary text,p_sections jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare current_doc jsonb; section jsonb; changed integer; last_position integer;
begin
  if auth.uid() is null or not public.is_editorial() then raise exception 'Editing not permitted' using errcode='42501'; end if;
  if p_title is null or length(trim(p_title)) not between 1 and 500 or p_summary is null or length(p_summary)>100000 or p_sections is null or jsonb_typeof(p_sections)<>'array' or octet_length(p_sections::text)>1000000 or jsonb_array_length(p_sections)>500 then
    raise exception 'Invalid document' using errcode='22023';
  end if;
  perform 1 from public.content_items where id=p_id for update;
  if not found then raise exception 'Publication unavailable' using errcode='P0002'; end if;
  perform 1 from public.content_sections where content_id=p_id order by id for update;
  current_doc := public.admin_read_publication(p_id);
  if p_revision is null or current_doc->>'revision' <> p_revision then raise exception 'Writing conflict' using errcode='40001'; end if;
  if (select count(*) from jsonb_array_elements(p_sections) s where not coalesce((s->>'fresh')::boolean,false)) <> jsonb_array_length(current_doc->'sections')
     or (select count(distinct s->>'id') from jsonb_array_elements(p_sections) s) <> jsonb_array_length(p_sections) then
    raise exception 'Section list changed' using errcode='22023';
  end if;
  select coalesce(max(position),0) into last_position from public.content_sections where content_id=p_id;
  for section in select * from jsonb_array_elements(p_sections) loop
    if section->>'title' is null or section->>'body' is null or length(section->>'title')>500 or length(section->>'body')>200000 then raise exception 'Invalid section' using errcode='22023'; end if;
    if coalesce((section->>'fresh')::boolean,false) then
      last_position := last_position+10;
      insert into public.content_sections(id,content_id,section_type,title,body,position)
      values((section->>'id')::uuid,p_id,'paragraph',section->>'title',section->>'body',last_position);
    else
      update public.content_sections set title=section->>'title',body=section->>'body',updated_at=clock_timestamp()
      where id=(section->>'id')::uuid and content_id=p_id;
      get diagnostics changed=row_count;
      if changed<>1 then raise exception 'Section unavailable' using errcode='P0002'; end if;
    end if;
  end loop;
  update public.content_items set title=trim(p_title),summary=p_summary,updated_at=clock_timestamp() where id=p_id;
  return public.admin_read_publication(p_id);
end;
$$;

-- Search on the server across titles, summaries and section text. Return 25 summaries.
create function public.admin_list_writing_items(p_query text default '',p_type text default '',p_status text default '',p_placement text default '',p_included text[] default null,p_excluded text[] default null,p_offset integer default 0) returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
declare pattern text; result jsonb;
begin
  if auth.uid() is null or not exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('owner','admin','editor','researcher','fact_checker')) then
    raise exception 'Editorial access required' using errcode='42501';
  end if;
  if length(p_query)>100 or p_offset<0 or p_offset>25000000 or cardinality(p_included)>2000 or cardinality(p_excluded)>200000 then raise exception 'Invalid filter' using errcode='22023'; end if;
  pattern := '%' || replace(replace(replace(p_query, E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';
  with items as (
    select 'publication:'||c.id as key,c.title,coalesce(nullif(c.summary,''),(select left(coalesce(s.body,''),220) from public.content_sections s where s.content_id=c.id order by s.position,s.id limit 1),'') as summary,c.content_type as type,c.status,c.featured,c.updated_at,
      (p_query='' or c.title ilike pattern or c.summary ilike pattern or exists(select 1 from public.content_sections s where s.content_id=c.id and (s.title ilike pattern or s.body ilike pattern))) as matches
    from public.content_items c
    union all
    select 'note:'||n.id,n.title,coalesce(nullif(n.summary,''),left(n.sections->0->>'body',220),''),'note','idea',false,n.updated_at,
      (p_query='' or n.title ilike pattern or n.summary ilike pattern or exists(select 1 from jsonb_array_elements(n.sections) s where s->>'title' ilike pattern or s->>'body' ilike pattern))
    from public.admin_writing_notes n where n.user_id=auth.uid()
  ), filtered as (
    select key,title,summary,type,status,featured,updated_at as "updatedAt" from items
    where matches and (p_type='' or type=p_type) and (p_status='' or status=p_status)
      and (p_placement='' or (p_placement='featured' and featured) or (p_placement='unfeatured' and not featured))
      and (p_included is null or key=any(p_included)) and (p_excluded is null or not(key=any(p_excluded)))
  ), page as (select * from filtered order by "updatedAt" desc,key offset p_offset limit 25)
  select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(page) order by "updatedAt" desc,key) from page),'[]'),'total',(select count(*) from filtered),'page',p_offset/25+1) into result;
  return result;
end;
$$;
revoke all on function public.admin_read_publication(uuid),public.admin_save_publication(uuid,text,text,text,jsonb),public.admin_list_writing_items(text,text,text,text,text[],text[],integer) from public,anon;
grant execute on function public.admin_read_publication(uuid),public.admin_save_publication(uuid,text,text,text,jsonb),public.admin_list_writing_items(text,text,text,text,text[],text[],integer) to authenticated;
