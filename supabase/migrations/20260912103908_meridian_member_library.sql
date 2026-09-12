-- Extra publications are isolated from the public CMS and all public feeds.
create schema if not exists meridian_private;
revoke all on schema meridian_private from public, anon;
grant usage on schema meridian_private to authenticated;

create function public.is_member_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
 select (select auth.uid()) is not null and exists (
   select 1 from public.user_roles where user_id = (select auth.uid()) and role in ('owner','admin')
 );
$$;
revoke all on function public.is_member_admin() from public, anon;
grant execute on function public.is_member_admin() to authenticated;

create table public.member_publications (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 150),
 title text not null check (char_length(trim(title)) between 1 and 180),
 summary text not null default '' check (char_length(summary) <= 500),
 body text not null default '' check (char_length(body) <= 200000),
 kind text not null default 'article' check (kind in ('article','text')),
 audience text not null default 'members' check (audience in ('members','selected')),
 status text not null default 'draft' check (status in ('draft','published')),
 author_id uuid references auth.users(id) on delete set null,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint published_body_required check (status <> 'published' or char_length(trim(body)) > 0)
);
create index member_publications_library_idx on public.member_publications(status, published_at desc, id);
create index member_publications_author_idx on public.member_publications(author_id);

create table public.member_publication_recipients (
 publication_id uuid not null references public.member_publications(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 primary key (publication_id,user_id)
);
create index member_recipients_user_idx on public.member_publication_recipients(user_id,publication_id);
create table public.member_bookmarks (
 user_id uuid not null references auth.users(id) on delete cascade,
 publication_id uuid not null references public.member_publications(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,publication_id)
);
create index member_bookmarks_publication_idx on public.member_bookmarks(publication_id);

alter table public.member_publications enable row level security;
alter table public.member_publication_recipients enable row level security;
alter table public.member_bookmarks enable row level security;
revoke all on public.member_publications, public.member_publication_recipients, public.member_bookmarks from anon;
grant select,insert,update,delete on public.member_publications,public.member_publication_recipients,public.member_bookmarks to authenticated;

create policy member_publications_read on public.member_publications for select to authenticated using (
 (select public.is_member_admin()) or (
   (select auth.uid()) is not null and not coalesce((select auth.jwt()->>'is_anonymous')::boolean,false)
   and status='published' and (audience='members' or exists (
    select 1 from public.member_publication_recipients r where r.publication_id=id and r.user_id=(select auth.uid())
   ))
 )
);
create policy member_publications_insert on public.member_publications for insert to authenticated with check ((select public.is_member_admin()));
create policy member_publications_update on public.member_publications for update to authenticated using ((select public.is_member_admin())) with check ((select public.is_member_admin()));
create policy member_publications_delete on public.member_publications for delete to authenticated using ((select public.is_member_admin()));
create policy member_recipients_read on public.member_publication_recipients for select to authenticated using ((select public.is_member_admin()) or user_id=(select auth.uid()));
create policy member_recipients_manage on public.member_publication_recipients for all to authenticated using ((select public.is_member_admin())) with check ((select public.is_member_admin()));
create policy member_bookmarks_read on public.member_bookmarks for select to authenticated using (user_id=(select auth.uid()) and exists (select 1 from public.member_publications p where p.id=publication_id and p.status='published'));
create policy member_bookmarks_insert on public.member_bookmarks for insert to authenticated with check (user_id=(select auth.uid()) and exists (select 1 from public.member_publications p where p.id=publication_id and p.status='published'));
create policy member_bookmarks_delete on public.member_bookmarks for delete to authenticated using (user_id=(select auth.uid()));

-- A single transaction saves the text and its recipients. A failed assignment leaves both untouched.
create function public.save_member_publication(
 p_id uuid, p_title text, p_slug text, p_summary text, p_body text,
 p_kind text, p_audience text, p_status text, p_recipients uuid[]
) returns uuid language plpgsql security invoker set search_path='' as $$
declare result_id uuid; existing_published timestamptz;
begin
 if not public.is_member_admin() then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_audience='selected' and p_status='published' and coalesce(cardinality(p_recipients),0)=0 then
   raise exception 'Choose at least one recipient' using errcode='22023';
 end if;
 if p_id is null then
  insert into public.member_publications(title,slug,summary,body,kind,audience,status,author_id,published_at)
  values(p_title,p_slug,p_summary,p_body,p_kind,p_audience,p_status,auth.uid(),case when p_status='published' then now() end)
  returning id into result_id;
 else
  select published_at into existing_published from public.member_publications where id=p_id for update;
  if not found then raise exception 'Publication not found' using errcode='P0002'; end if;
  update public.member_publications set title=p_title,slug=p_slug,summary=p_summary,body=p_body,kind=p_kind,
   audience=p_audience,status=p_status,updated_at=now(),published_at=case when p_status='published' then coalesce(existing_published,now()) else existing_published end
  where id=p_id returning id into result_id;
 end if;
 delete from public.member_publication_recipients where publication_id=result_id;
 if p_audience='selected' then
  insert into public.member_publication_recipients(publication_id,user_id)
  select result_id, unnest(coalesce(p_recipients,'{}'::uuid[])) on conflict do nothing;
 end if;
 return result_id;
end;
$$;
revoke all on function public.save_member_publication(uuid,text,text,text,text,text,text,text,uuid[]) from public,anon;
grant execute on function public.save_member_publication(uuid,text,text,text,text,text,text,text,uuid[]) to authenticated;

-- Only an owner/admin may look up email addresses to select the correct recipient.
-- The definer implementation stays outside the exposed API schema and checks auth.uid().
create function meridian_private.member_directory(p_query text,p_ids uuid[],p_offset integer)
returns table(id uuid,display_name text,email text,created_at timestamptz,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('owner','admin')) then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 return query select u.id,p.display_name,u.email,u.created_at,count(*) over()
 from auth.users u left join public.profiles p on p.id=u.id
 where not coalesce(u.is_anonymous,false)
 and (p_ids is null or u.id=any(p_ids))
 and (coalesce(p_query,'')='' or strpos(lower(coalesce(u.email,'')||' '||coalesce(p.display_name,'')),lower(left(p_query,100)))>0)
 order by u.created_at desc,u.id limit 100 offset greatest(coalesce(p_offset,0),0);
end;
$$;
revoke all on function meridian_private.member_directory(text,uuid[],integer) from public,anon;
grant execute on function meridian_private.member_directory(text,uuid[],integer) to authenticated;
create function public.member_directory(p_query text default '',p_ids uuid[] default null,p_offset integer default 0)
returns table(id uuid,display_name text,email text,created_at timestamptz,total_count bigint)
language sql stable security invoker set search_path='' as $$ select * from meridian_private.member_directory(p_query,p_ids,p_offset); $$;
revoke all on function public.member_directory(text,uuid[],integer) from public,anon;
grant execute on function public.member_directory(text,uuid[],integer) to authenticated;
