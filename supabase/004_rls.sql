create or replace function public.current_role()
returns text language sql stable security definer set search_path = public
as $$ select coalesce((select role from public.user_roles where user_id = auth.uid()), 'contributor'); $$;

create or replace function public.is_editorial()
returns boolean language sql stable security definer set search_path = public
as $$ select public.current_role() in ('owner','editor'); $$;

create or replace function public.can_publish()
returns boolean language sql stable security definer set search_path = public
as $$ select public.current_role() in ('owner','editor'); $$;

do $$
declare t text;
begin
  foreach t in array array['user_roles','profiles','saved_items','content_items','content_sections','research_dossiers','research_children','sources','knowledge_nodes','knowledge_relations','claims','claim_sources','claim_relations','content_claims','content_nodes','perspectives','contributions','audit_log']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- Rerunnable policies.
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists roles_select on public.user_roles;
drop policy if exists roles_manage on public.user_roles;
drop policy if exists saved_manage on public.saved_items;
drop policy if exists content_select on public.content_items;
drop policy if exists content_manage on public.content_items;
drop policy if exists sections_select on public.content_sections;
drop policy if exists sections_manage on public.content_sections;
drop policy if exists research_select on public.research_dossiers;
drop policy if exists research_manage on public.research_dossiers;
drop policy if exists research_children_select on public.research_children;
drop policy if exists research_children_manage on public.research_children;
drop policy if exists sources_select on public.sources;
drop policy if exists sources_manage on public.sources;
drop policy if exists nodes_select on public.knowledge_nodes;
drop policy if exists nodes_manage on public.knowledge_nodes;
drop policy if exists relations_select on public.knowledge_relations;
drop policy if exists relations_manage on public.knowledge_relations;
drop policy if exists claims_select on public.claims;
drop policy if exists claims_manage on public.claims;
drop policy if exists claim_sources_select on public.claim_sources;
drop policy if exists claim_sources_manage on public.claim_sources;
drop policy if exists claim_relations_select on public.claim_relations;
drop policy if exists claim_relations_manage on public.claim_relations;
drop policy if exists content_claims_select on public.content_claims;
drop policy if exists content_claims_manage on public.content_claims;
drop policy if exists content_nodes_select on public.content_nodes;
drop policy if exists content_nodes_manage on public.content_nodes;
drop policy if exists perspectives_select on public.perspectives;
drop policy if exists perspectives_manage on public.perspectives;
drop policy if exists contributions_insert on public.contributions;
drop policy if exists contributions_own_select on public.contributions;
drop policy if exists contributions_editorial on public.contributions;
drop policy if exists audit_editorial_select on public.audit_log;
drop policy if exists audit_insert on public.audit_log;

create policy profiles_select on public.profiles for select using (public_profile or auth.uid() = id or public.is_editorial());
create policy profiles_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy roles_select on public.user_roles for select using (auth.uid() = user_id or public.current_role() = 'owner');
create policy roles_manage on public.user_roles for all using (public.current_role() = 'owner') with check (public.current_role() = 'owner');
create policy saved_manage on public.saved_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy content_select on public.content_items for select using (status = 'published' or public.is_editorial());
create policy content_manage on public.content_items for all using (public.is_editorial()) with check (public.is_editorial());
create policy sections_select on public.content_sections for select using (exists (select 1 from public.content_items c where c.id = content_sections.content_id and (c.status='published' or public.is_editorial())));
create policy sections_manage on public.content_sections for all using (public.is_editorial()) with check (public.is_editorial());
create policy research_select on public.research_dossiers for select using (exists (select 1 from public.content_items c where c.id = research_dossiers.content_id and (c.status='published' or public.is_editorial())));
create policy research_manage on public.research_dossiers for all using (public.is_editorial()) with check (public.is_editorial());
create policy research_children_select on public.research_children for select using (true);
create policy research_children_manage on public.research_children for all using (public.is_editorial()) with check (public.is_editorial());
create policy sources_select on public.sources for select using (true);
create policy sources_manage on public.sources for all using (public.is_editorial()) with check (public.is_editorial());
create policy nodes_select on public.knowledge_nodes for select using (status='active' or public.is_editorial());
create policy nodes_manage on public.knowledge_nodes for all using (public.is_editorial()) with check (public.is_editorial());
create policy relations_select on public.knowledge_relations for select using (true);
create policy relations_manage on public.knowledge_relations for all using (public.is_editorial()) with check (public.is_editorial());
create policy claims_select on public.claims for select using (true);
create policy claims_manage on public.claims for all using (public.is_editorial()) with check (public.is_editorial());
create policy claim_sources_select on public.claim_sources for select using (true);
create policy claim_sources_manage on public.claim_sources for all using (public.is_editorial()) with check (public.is_editorial());
create policy claim_relations_select on public.claim_relations for select using (true);
create policy claim_relations_manage on public.claim_relations for all using (public.is_editorial()) with check (public.is_editorial());
create policy content_claims_select on public.content_claims for select using (true);
create policy content_claims_manage on public.content_claims for all using (public.is_editorial()) with check (public.is_editorial());
create policy content_nodes_select on public.content_nodes for select using (true);
create policy content_nodes_manage on public.content_nodes for all using (public.is_editorial()) with check (public.is_editorial());
create policy perspectives_select on public.perspectives for select using (visibility='public' or public.is_editorial() or auth.uid()=created_by);
create policy perspectives_manage on public.perspectives for all using (public.is_editorial() or auth.uid()=created_by) with check (public.is_editorial() or auth.uid()=created_by);
create policy contributions_insert on public.contributions for insert to authenticated with check (auth.uid()=user_id);
create policy contributions_own_select on public.contributions for select using (auth.uid()=user_id);
create policy contributions_editorial on public.contributions for all using (public.is_editorial()) with check (public.is_editorial());
create policy audit_editorial_select on public.audit_log for select using (public.is_editorial());
create policy audit_insert on public.audit_log for insert to authenticated with check (auth.uid()=user_id);
