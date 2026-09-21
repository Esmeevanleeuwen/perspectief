import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const id='10000000-0000-4000-8000-000000000001', draft='10000000-0000-4000-8000-000000000002', research='10000000-0000-4000-8000-000000000003';
const owner='20000000-0000-4000-8000-000000000001', editor='20000000-0000-4000-8000-000000000002', reader='20000000-0000-4000-8000-000000000003', admin='20000000-0000-4000-8000-000000000004';
const setup=`
create schema auth; create role anon; create role authenticated;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create table public.user_roles(user_id uuid primary key,role text);
insert into public.user_roles values('${owner}','owner'),('${editor}','editor'),('${reader}','researcher'),('${admin}','admin');
create function public.current_role() returns text language sql stable security definer set search_path='' as $$select coalesce((select role from public.user_roles where user_id=auth.uid()),'contributor')$$;
create function public.is_editorial() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','editor')$$;
create function public.can_edit_content() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','admin','editor','researcher','fact_checker')$$;
create table public.content_items(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,content_type text not null,status text not null default 'draft',author_id uuid,eyebrow text,subtitle text,summary text,hero_image text,image_alt text,featured boolean not null default false,featured_position text,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),metadata jsonb not null default '{}');
create table public.content_sections(id uuid primary key default gen_random_uuid(),content_id uuid references public.content_items(id) on delete cascade,section_type text default 'paragraph',position integer default 0,title text,body text,data jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
create table public.research_children(research_content_id uuid,child_content_id uuid,relation text,position int);
alter table public.content_items enable row level security; alter table public.content_sections enable row level security;
create policy content_manage on public.content_items for all using(public.is_editorial()) with check(public.is_editorial());
create policy content_select on public.content_items for select using(status='published' or public.is_editorial());
create policy sections_manage on public.content_sections for all using(public.is_editorial()) with check(public.is_editorial());
create policy sections_select on public.content_sections for select using(exists(select 1 from public.content_items c where c.id=content_id and (c.status='published' or public.is_editorial())));
grant select,insert,update,delete on public.content_items,public.content_sections to anon,authenticated;
create function public.admin_read_publication(p_id uuid) returns jsonb language plpgsql set search_path='' as $$declare item jsonb; blocks jsonb; begin
 if auth.uid() is null or not public.can_edit_content() then raise exception 'No access' using errcode='42501'; end if;
 select to_jsonb(c) into item from public.content_items c where id=p_id; if item is null then raise exception 'Unavailable' using errcode='P0002'; end if;
 select coalesce(jsonb_agg(to_jsonb(s) order by s.position,s.id),'[]') into blocks from public.content_sections s where content_id=p_id;
 return jsonb_build_object('item',item,'sections',blocks,'revision',md5(item::text||blocks::text),'editable',public.is_editorial()); end$$;
insert into public.content_items(id,slug,title,summary,content_type,status,hero_image,featured,featured_position) values
 ('${id}','live','Live artikel','Samenvatting','article','published','/foto.jpg',true,'main'),
 ('${draft}','concept','Conceptartikel','Samenvatting','article','draft','/foto.jpg',true,'main'),
 ('${research}','onderzoek','Onderzoek','Vraag','research','draft',null,false,null);
insert into public.content_sections(content_id,body) values('${id}','Artikeltekst'),('${draft}','Concepttekst'),('${research}','Onderzoekstekst');
`;
async function create() {
  const db=new PGlite(); await db.exec(setup);
  for(const file of ['202609180001_shared_publishing.sql','202609180002_activate_shared_publishing.sql','20260921160000_publication_status.sql']) await db.exec(fs.readFileSync(`supabase/migrations/${file}`,'utf8'));
  return db;
}
async function as(db,user) { await db.exec(`reset role;set role ${user?'authenticated':'anon'}`); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']); }
const one=async(db,sql,args=[]) => (await db.query(sql,args)).rows[0]?.value;
const version=(db,key)=>one(db,'select updated_at::text as value from public.content_items where id=$1::uuid',[key]);
const read=(db,key)=>one(db,'select to_jsonb(c) as value from public.content_items c where id=$1::uuid',[key]);
const context=(db,key=id)=>one(db,'select public.publishing_context($1::uuid) as value',[key]);
const change=async(db,key,status,confirmed=false,expected=undefined)=>one(db,'select public.admin_change_publication_status($1::uuid,$2,$3::timestamptz,$4::boolean) as value',[key,status,expected??await version(db,key),confirmed]);
async function publishBoth(db) {
 const c=await context(db); c.config.sites.avera.selected=true;
 const v=await one(db,'select public.publishing_save($1::uuid,$2,$3::jsonb) as value',[id,c.version,JSON.stringify(c.config)]);
 const r=await one(db,"select public.admin_read_publication($1::uuid)->>'revision' as value",[id]);
 await db.query('select public.publishing_publish($1::uuid,$2::text[],$3,$4,null)',[id,'{meridian,avera}',v,r]);
}

test('all non-live workflow statuses persist without changing text, image, type or homepage choice',async()=>{
 const db=await create();try{await as(db,editor);const before=await read(db,draft);
 for(const status of ['idea','researching','source_check','editorial_review','ready','archived','draft']) {
   const result=await change(db,draft,status); assert.equal(result.confirmation_required,false); assert.equal(result.status,status);
   const saved=await read(db,draft); assert.equal(saved.status,status);
   for(const key of ['title','summary','slug','content_type','hero_image','featured','featured_position']) assert.deepEqual(saved[key],before[key]);
 }
 assert.equal(await one(db,'select body as value from public.content_sections where content_id=$1::uuid',[draft]),'Concepttekst');
 }finally{await db.close();}
});

test('anonymous and non-editors are denied, invalid input is rejected, and shared publishing cannot be bypassed',async()=>{
 const db=await create();try{await as(db,owner);const timestamp=await version(db,draft);
 for(const user of [null,reader,admin]) {await as(db,user);await assert.rejects(change(db,draft,'ready',false,timestamp),e=>e.code==='42501');}
 await as(db,owner);await assert.rejects(change(db,draft,'not-a-status'),e=>e.code==='22023');
 await assert.rejects(change(db,draft,'published',true),e=>e.code==='22023'&&e.message.includes('Use article publishing'));
 assert.equal((await read(db,draft)).status,'draft');
 await assert.rejects(change(db,'99999999-0000-4000-8000-000000000000','ready',false,timestamp),e=>e.code==='P0002');
 }finally{await db.close();}
});

test('changing a live article first requests consent, then withdraws both real site editions atomically',async()=>{
 const db=await create();try{await as(db,owner);await publishBoth(db);const before=await read(db,id);
 const pending=await change(db,id,'draft'); assert.equal(pending.confirmation_required,true);assert.equal(pending.action,'withdraw');assert.deepEqual(pending.sites,['avera','meridian']);
 assert.equal((await read(db,id)).status,'published');assert.ok((await context(db)).editions.every(e=>e.state==='published'));
 const saved=await change(db,id,'draft',true);assert.equal(saved.status,'draft');assert.ok((await context(db)).editions.every(e=>e.state==='withdrawn'));
 assert.equal((await read(db,id)).published_at,before.published_at);assert.equal((await read(db,id)).featured,true);
 await as(db,null);for(const site of ['meridian','avera']) assert.equal(await one(db,'select public.publishing_article($1,$2) as value',[site,'live']),null);
 }finally{await db.close();}
});

test('a stale status change cannot withdraw a newer publication or overwrite its status',async()=>{
 const db=await create();try{await as(db,owner);await publishBoth(db);const stale=await version(db,id);
 await db.query("update public.content_items set updated_at=clock_timestamp(),title='Nieuwe titel' where id=$1::uuid",[id]);
 await assert.rejects(change(db,id,'archived',true,stale),e=>e.code==='40001');
 assert.equal((await read(db,id)).status,'published');assert.ok((await context(db)).editions.every(e=>e.state==='published'));
 }finally{await db.close();}
});

test('a failure on the second withdrawal rolls back the first and preserves the original status',async()=>{
 const db=await create();try{await as(db,owner);await publishBoth(db);
 await db.exec(`reset role;create function fail_second_withdrawal() returns trigger language plpgsql as $$begin if new.platform='meridian' and new.state='withdrawn' then raise exception 'fixture failure';end if;return new;end$$;create trigger reject_withdrawal before update on public.publishing_editions for each row execute function fail_second_withdrawal();`);
 await as(db,owner);await assert.rejects(change(db,id,'archived',true),/fixture failure/);
 assert.equal((await read(db,id)).status,'published');assert.ok((await context(db)).editions.every(e=>e.state==='published'));
 }finally{await db.close();}
});

test('research publication requires content and confirmation, then can be archived without losing its text',async()=>{
 const db=await create();try{await as(db,editor);
 const pending=await change(db,research,'published');assert.equal(pending.confirmation_required,true);assert.equal(pending.action,'publish');
 assert.equal((await read(db,research)).status,'draft');
 await change(db,research,'published',true);const live=await read(db,research);assert.equal(live.status,'published');assert.ok(live.published_at);
 assert.equal((await change(db,research,'archived')).confirmation_required,true);
 await change(db,research,'archived',true);assert.equal((await read(db,research)).status,'archived');assert.equal((await read(db,research)).published_at,live.published_at);
 await db.query("update public.content_sections set body='' where content_id=$1::uuid",[research]);
 await assert.rejects(change(db,research,'published',true),e=>e.code==='22023');
 }finally{await db.close();}
});
