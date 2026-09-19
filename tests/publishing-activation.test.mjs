import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

// Isolated local PostgreSQL fixtures: no production users, keys or network requests.
const owner = '20000000-0000-4000-8000-000000000001';
const editor = '20000000-0000-4000-8000-000000000002';
const member = '20000000-0000-4000-8000-000000000003';
const article = '10000000-0000-4000-8000-000000000001';
const draft = '10000000-0000-4000-8000-000000000002';
const research = '10000000-0000-4000-8000-000000000003';
const privateResearch = '10000000-0000-4000-8000-000000000004';
const setup = `
create schema auth; create role anon; create role authenticated;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to anon,authenticated;
grant execute on function auth.uid() to anon,authenticated;
insert into auth.users values('${owner}'),('${editor}'),('${member}');
create table public.user_roles(user_id uuid primary key,role text);
insert into public.user_roles values('${owner}','owner'),('${editor}','editor'),('${member}','contributor');
alter table public.user_roles enable row level security;
create policy own_role on public.user_roles for select using(user_id=auth.uid());
grant select on public.user_roles to authenticated;
create function public.current_role() returns text language sql stable security definer set search_path='' as $$select coalesce((select role from public.user_roles where user_id=auth.uid()),'contributor')$$;
create function public.is_editorial() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','editor')$$;
create function public.can_edit_content() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','admin','editor','researcher','fact_checker')$$;
create table public.content_items(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,content_type text not null,status text not null default 'draft',author_id uuid,eyebrow text,subtitle text,summary text,hero_image text,image_alt text,featured boolean not null default false,featured_position text,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),metadata jsonb not null default '{}');
create table public.content_sections(id uuid primary key default gen_random_uuid(),content_id uuid references public.content_items(id) on delete cascade,section_type text default 'paragraph',position integer default 0,title text,body text,data jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
create table public.research_children(research_content_id uuid,child_content_id uuid,relation text,position integer);
alter table public.content_items enable row level security; alter table public.content_sections enable row level security;
create policy content_manage on public.content_items for all using(public.is_editorial()) with check(public.is_editorial());
create policy content_select on public.content_items for select using(status='published' or public.is_editorial());
create policy sections_manage on public.content_sections for all using(public.is_editorial()) with check(public.is_editorial());
create policy sections_select on public.content_sections for select using(exists(select 1 from public.content_items c where c.id=content_id and (c.status='published' or public.is_editorial())));
grant select,insert,update,delete on public.content_items,public.content_sections to anon,authenticated;
insert into public.content_items(id,slug,title,summary,content_type,status) values
('${article}','openbaar-artikel','Openbare titel','Openbare samenvatting','article','published'),
('${draft}','prive-artikel','GEHEIM CONCEPT','Niet vrijgegeven','article','draft'),
('${research}','openbaar-onderzoek','Openbaar onderzoek','Onderzoek','research','published'),
('${privateResearch}','prive-onderzoek','PRIVE ONDERZOEK','Onderzoek','research','draft');
insert into public.content_sections(content_id,body) values('${article}','Openbare tekst'),('${draft}','GEHEIME TEKST');
insert into public.research_children values
('${research}','${article}','part_of',10),('${research}','${draft}','background',20),
('${privateResearch}','${article}','part_of',10);
-- Test double for the OLD synchronizer's article-link query. The activation
-- must replace this query and run its refresh trigger; no production code is executed remotely.
create table public.test_research_links(content_id uuid primary key,links jsonb);
create function public.sync_meridian_research(p_content_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 insert into public.test_research_links(content_id,links)
 select p_content_id,coalesce(jsonb_agg(jsonb_build_object('title',child.title,'slug',child.slug) order by relation.position)
 filter(where child.status='published' and child.content_type in ('article','analysis','case')),'[]')
 from public.research_children relation
 join public.content_items child on child.id = relation.child_content_id
 where relation.research_content_id=p_content_id
 on conflict(content_id) do update set links=excluded.links;
end;$$;
`;
async function create() {
  const db = new PGlite();
  await db.exec(setup);
  for (const file of [
    '20260913154532_admin_writing_workspace.sql',
    '202609180001_shared_publishing.sql',
    '202609180002_activate_shared_publishing.sql',
    '20260919093000_released_research_links.sql',
  ]) await db.exec(fs.readFileSync(`supabase/migrations/${file}`, 'utf8'));
  return db;
}
async function as(db, user) {
  await db.exec(`reset role; set role ${user ? 'authenticated' : 'anon'};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user || '']);
}
async function value(db, sql, args = []) { return (await db.query(sql, args)).rows[0].value; }
async function release(db) {
  const c = await value(db,'select public.publishing_context($1) as value',[article]);
  const revision = await value(db,"select public.admin_read_publication($1)->>'revision' as value",[article]);
  return value(db,"select public.publishing_publish($1,array['meridian'],$2,$3,null) as value",[article,c.version,revision]);
}
const links = async (db, id = research) => (await db.query('select * from public.publishing_research_links($1)',[id])).rows;

test('activation makes real workspace tag search work, including literal wildcard characters, without exposing tags', async () => {
  const db = await create();
  try {
    await as(db, owner);
    const c = await value(db,'select public.publishing_context($1) as value',[article]);
    c.config.tags = ['INTERNAL_REVIEW_50%_'];
    await db.query('select public.publishing_save($1,$2,$3::jsonb)',[article,c.version,JSON.stringify(c.config)]);
    const search = (text, type = '') => value(db,'select public.admin_list_writing_items($1,$2) as value',[text,type]);
    assert.equal((await search('INTERNAL_REVIEW_50%_')).total,1);
    assert.equal((await search('INTERNAL_REVIEW_50%X')).total,0);
    assert.equal((await search('INTERNAL_REVIEW_50%_','research')).total,0);
    await as(db, editor);
    assert.equal((await search('INTERNAL_REVIEW_50%_')).items[0].key,`publication:${article}`);
    await as(db, member);
    assert.equal((await db.query('select * from public.publishing_configs')).rows.length,0);
    await assert.rejects(search('INTERNAL_REVIEW_50%_'),e=>e.code==='42501');
    await as(db, null);
    await assert.rejects(search('INTERNAL_REVIEW_50%_'),e=>e.code==='42501');
    const catalog = await value(db,"select public.publishing_catalog('meridian',0,100) as value");
    assert.doesNotMatch(JSON.stringify(catalog),/INTERNAL_REVIEW|GEHEIM/);
  } finally { await db.close(); }
});

test('research links retain published titles after draft edits and reflect explicit release and withdrawal', async () => {
  const db = await create();
  try {
    await as(db, owner);
    await db.query("update public.content_items set title='NIEUWE CONCEPTTITEL',summary='GEHEIME SAMENVATTING',updated_at=clock_timestamp() where id=$1",[article]);
    await as(db, null);
    let rows = await links(db);
    assert.equal(rows.length,1);
    assert.equal(rows[0].title,'Openbare titel');
    assert.equal(rows[0].slug,'openbaar-artikel');
    assert.doesNotMatch(JSON.stringify(rows),/GEHEIM|CONCEPT/);
    assert.equal((await db.query("select * from public.content_items where content_type='article'")).rows.length,0);
    await as(db, owner);
    await release(db);
    await as(db, null);
    assert.equal((await links(db))[0].title,'NIEUWE CONCEPTTITEL');
    await as(db, owner);
    await db.query("select public.publishing_withdraw($1,'meridian')",[article]);
    await as(db, null);
    assert.deepEqual(await links(db),[]);
  } finally { await db.close(); }
});

test('draft parent research and missing IDs reveal no linked article titles; activation refreshes old dossier links', async () => {
  const db = await create();
  try {
    await as(db, null);
    assert.deepEqual(await links(db, privateResearch),[]);
    assert.deepEqual(await links(db,'99999999-0000-4000-8000-000000000001'),[]);
    await as(db, owner);
    await db.query("update public.content_items set title='UNRELEASED TITLE' where id=$1",[article]);
    // A routine refresh caused by editing the old research must still use releases.
    await db.exec('reset role');
    await db.query('select public.sync_meridian_research($1)',[research]);
    let cached = await value(db,'select links as value from public.test_research_links where content_id=$1',[research]);
    assert.equal(cached[0].title,'Openbare titel');
    await as(db, owner);
    await release(db);
    await db.exec('reset role');
    cached = await value(db,'select links as value from public.test_research_links where content_id=$1',[research]);
    assert.equal(cached[0].title,'UNRELEASED TITLE');
    await as(db, owner);
    await db.query("select public.publishing_withdraw($1,'meridian')",[article]);
    await db.exec('reset role');
    assert.deepEqual(await value(db,'select links as value from public.test_research_links where content_id=$1',[research]),[]);
  } finally { await db.close(); }
});
