-- Status control for the Publications list. No existing rows are changed by this migration.
-- A move away from a live state explicitly withdraws every edition, in one transaction.
create or replace function public.admin_change_publication_status(
  p_id uuid, p_status text, p_updated_at timestamptz, p_confirmed boolean default false
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  item public.content_items%rowtype;
  live_sites text[];
  site text;
begin
  if auth.uid() is null or not coalesce(public.is_editorial(), false) then
    raise exception 'Status change not permitted' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('idea','researching','draft','source_check','editorial_review','ready','published','archived') then
    raise exception 'Invalid status' using errcode = '22023';
  end if;
  select * into item from public.content_items where id = p_id for update;
  if not found then raise exception 'Publication unavailable' using errcode = 'P0002'; end if;
  if p_updated_at is null or item.updated_at is distinct from p_updated_at then
    raise exception 'Publication changed elsewhere' using errcode = '40001';
  end if;

  if p_status = 'published' then
    -- Shared articles must create an actual snapshot, with explicit website selection.
    if item.content_type <> 'research' then
      raise exception 'Use article publishing' using errcode = '22023';
    end if;
    if length(btrim(item.title)) = 0 or not exists (
      select 1 from public.content_sections where content_id = p_id and length(btrim(coalesce(body, ''))) > 0
    ) then raise exception 'Write content before publishing' using errcode = '22023'; end if;
    if item.status <> 'published' and p_confirmed is distinct from true then
      return jsonb_build_object('confirmation_required', true, 'action', 'publish', 'sites', jsonb_build_array('meridian'));
    end if;
    update public.content_items set status = 'published', published_at = coalesce(published_at, now()), updated_at = clock_timestamp()
      where id = p_id returning * into item;
  else
    select coalesce(array_agg(platform order by platform), array[]::text[]) into live_sites
      from public.publishing_editions where content_id = p_id and state = 'published';
    if item.content_type = 'research' and item.status = 'published' and not ('meridian' = any(live_sites)) then
      live_sites := array_append(live_sites, 'meridian');
    end if;
    if cardinality(live_sites) > 0 and p_confirmed is distinct from true then
      return jsonb_build_object('confirmation_required', true, 'action', 'withdraw', 'sites', to_jsonb(live_sites));
    end if;
    -- Reuse the existing withdrawal rules; any failure rolls back every change.
    foreach site in array live_sites loop
      perform public.publishing_withdraw(p_id, site);
    end loop;
    update public.content_items set status = p_status, updated_at = clock_timestamp()
      where id = p_id returning * into item;
  end if;
  return jsonb_build_object('confirmation_required', false, 'status', item.status, 'updated_at', item.updated_at);
end;
$function$;
revoke all on function public.admin_change_publication_status(uuid, text, timestamptz, boolean) from public, anon;
grant execute on function public.admin_change_publication_status(uuid, text, timestamptz, boolean) to authenticated;
