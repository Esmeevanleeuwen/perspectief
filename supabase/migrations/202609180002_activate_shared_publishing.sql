-- Run ONLY after the shared public readers have deployed.
-- Published research retains its existing public model; article drafts are editorial only.
alter policy content_select on public.content_items using (
  public.is_editorial() or (status='published' and (content_type='research' or (auth.uid() is not null and public.can_edit_content())))
);
alter policy sections_select on public.content_sections using (
  exists(select 1 from public.content_items c where c.id=content_sections.content_id and (c.status='published' or public.is_editorial()))
);
-- Private tags may be searched by their editors, never anonymously.
create policy publishing_config_editor_read on public.publishing_configs for select to authenticated using (public.is_editorial());
grant select on public.publishing_configs to authenticated;

-- The existing dossier synchronizer must take linked article titles from releases,
-- not from a draft being edited. Preserve its research-specific behavior.
do $$ declare definition text; before_text text; after_text text; begin
 if to_regprocedure('public.sync_meridian_research(uuid)') is not null then
   definition:=pg_get_functiondef('public.sync_meridian_research(uuid)'::regprocedure);
   before_text:='join public.content_items child on child.id = relation.child_content_id';
   after_text:='join public.publishing_editions pe on pe.content_id = relation.child_content_id and pe.platform = ''meridian'' and pe.state = ''published''
  join public.publishing_revisions pr on pr.id = pe.revision_id
  cross join lateral jsonb_to_record(pr.document || jsonb_build_object(''slug'',pe.slug,''status'',''published'')) as child(title text, summary text, slug text, status text, content_type text)';
   if position(before_text in definition)>0 then execute replace(definition,before_text,after_text);
   elsif position('public.publishing_editions pe' in definition)=0 then raise exception 'Unknown dossier synchronizer; review before activation'; end if;
 end if;
 if to_regprocedure('public.admin_list_writing_items(text,text,text,text,text[],text[],integer)') is not null then
   definition:=pg_get_functiondef('public.admin_list_writing_items(text,text,text,text,text[],text[],integer)'::regprocedure);
   before_text:='c.title ilike pattern or c.summary ilike pattern or exists';
   after_text:='c.title ilike pattern or c.summary ilike pattern or exists(select 1 from public.publishing_configs pc, jsonb_array_elements_text(pc.config->''tags'') tag where pc.content_id=c.id and tag ilike pattern) or exists';
   if position('public.publishing_configs pc' in definition)=0 then
     if position(before_text in definition)=0 then raise exception 'Unknown writing search; review before activation'; end if;
     execute replace(definition,before_text,after_text);
   end if;
 end if;
end $$;
create or replace function public.publishing_refresh_parent_dossiers() returns trigger
language plpgsql security definer set search_path='' as $$
declare parent_id uuid;
begin
 if new.platform='meridian' and to_regprocedure('public.sync_meridian_research(uuid)') is not null then
   for parent_id in select research_content_id from public.research_children where child_content_id=new.content_id loop
     perform public.sync_meridian_research(parent_id);
   end loop;
 end if;
 return new;
end $$;
revoke all on function public.publishing_refresh_parent_dossiers() from public,anon,authenticated;
create trigger publishing_refresh_parent_dossiers after insert or update on public.publishing_editions for each row execute function public.publishing_refresh_parent_dossiers();
do $$ declare id uuid; begin
 if to_regprocedure('public.sync_meridian_research(uuid)') is not null then
   for id in select c.id from public.content_items c where content_type='research' and status='published' loop perform public.sync_meridian_research(id); end loop;
 end if;
end $$;
