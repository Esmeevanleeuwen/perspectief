create or replace function meridian_private.member_directory(p_query text,p_ids uuid[],p_offset integer)
returns table(id uuid,display_name text,email text,created_at timestamptz,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('owner','admin')) then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 return query select u.id,p.display_name::text,u.email::text,u.created_at,count(*) over()
 from auth.users u left join public.profiles p on p.id=u.id
 where not coalesce(u.is_anonymous,false)
 and (p_ids is null or u.id=any(p_ids))
 and (coalesce(p_query,'')='' or strpos(lower(coalesce(u.email,'')||' '||coalesce(p.display_name,'')),lower(left(p_query,100)))>0)
 order by u.created_at desc,u.id limit 100 offset greatest(coalesce(p_offset,0),0);
end;
$$;
