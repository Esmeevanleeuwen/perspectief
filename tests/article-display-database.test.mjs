import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const id='10000000-0000-4000-8000-000000000001', other='10000000-0000-4000-8000-000000000002';
const owner='20000000-0000-4000-8000-000000000001', reader='20000000-0000-4000-8000-000000000003';
const setup=`
create schema auth; create role anon; create role authenticated;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create table public.user_roles(user_id uuid primary key,role text);
insert into public.user_roles values('${owner}','owner'),('${reader}','researcher');
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
insert into public.content_items(id,slug,title,summary,content_type,status,hero_image,metadata) values
 ('${id}','eerste','Eerste artikel','Samenvatting','article','published','/oud.jpg','{"private_secret":"NEVER PUBLIC"}'),
 ('${other}','tweede','Tweede artikel','Tweede samenvatting','article','draft',null,'{}');
insert into public.content_sections(content_id,title,body) values('${id}','Tussenkop','De bewaarde artikeltekst.'),('${other}','Tweede kop','De tweede tekst.');
`;
async function as(db,user){await db.exec(`reset role;set role ${user?'authenticated':'anon'};`); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']);}
async function one(db,sql,args=[]){return (await db.query(sql,args)).rows[0]?.value;}
const ctx=(db,key=id)=>one(db,'select public.publishing_context($1::uuid) as value',[key]);
const article=(db,site='meridian',slug='eerste')=>one(db,'select public.publishing_article($1,$2) as value',[site,slug]);
async function save(db,config,key=id,version){const c=await ctx(db,key);return one(db,'select public.publishing_save($1::uuid,$2::bigint,$3::jsonb) as value',[key,version??c.version,JSON.stringify(config)]);}
async function publish(db,sites=['meridian'],key=id){const c=await ctx(db,key),r=c.reports.find(r=>r.chapters.some(x=>x.id===key)),revision=await one(db,"select public.admin_read_publication($1::uuid)->>'revision' as value",[key]);return one(db,'select public.publishing_publish($1::uuid,$2::text[],$3::bigint,$4,$5::bigint) as value',[key,`{${sites.join(',')}}`,c.version,revision,r?.version??null]);}
async function create(){const db=new PGlite();await db.exec(setup);for(const file of ['202609180001_shared_publishing.sql','202609180002_activate_shared_publishing.sql','20260921210000_article_display.sql'])await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));await as(db,owner);return db;}
async function withReport(db){await db.query("select public.publishing_report_change($1::uuid,'create',null,null,'Mijn verslag',null)",[id]);let r=(await ctx(db)).reports[0];await db.query("select public.publishing_report_change($1::uuid,'attach',$2::uuid,$3::bigint,null,null)",[other,r.id,r.version]);for(const key of [id,other]){const c=await ctx(db,key);c.config.sites.avera.selected=true;await save(db,c.config,key);await publish(db,['meridian','avera'],key);}return (await ctx(db)).reports[0];}

test('existing editions and reports keep their default presentation after migration',async()=>{
 const db=await create();try{const before=await article(db);assert.equal(before.title,'Eerste artikel');assert.equal(before.hero_image,'https://meridiancollective.nl/oud.jpg');assert.doesNotMatch(JSON.stringify(before),/NEVER PUBLIC/);await withReport(db);assert.equal((await article(db)).report.chapters.length,2);}finally{await db.close();}
});
test('image and normal display stay draft until published and apply independently per site',async()=>{
 const db=await create();try{await withReport(db);const before=await article(db),c=await ctx(db);c.config.hero_image='https://images.example.test/nieuw.jpg';c.config.sites.meridian.show_chapters=false;await save(db,c.config);
 await as(db,null);assert.equal((await article(db)).hero_image,before.hero_image);assert.equal((await article(db)).report.chapters.length,2);
 await as(db,owner);await publish(db);await as(db,null);const normal=await article(db);assert.equal(normal.hero_image,'https://images.example.test/nieuw.jpg');assert.equal(normal.seo.show_chapters,false);assert.equal(normal.report,null);assert.equal(normal.title,before.title);assert.deepEqual(normal.content_sections,before.content_sections);assert.equal(normal.slug,before.slug);
 assert.equal((await article(db,'avera')).report.chapters.length,2);const sibling=await article(db,'meridian','tweede');assert.deepEqual(sibling.report.chapters.map(c=>c.id),[other]);
 await as(db,owner);assert.equal((await ctx(db)).reports[0].chapters.length,2);
 }finally{await db.close();}
});
test('hiding every chapter removes only the public report; restoring is reversible',async()=>{
 const db=await create();try{const report=await withReport(db);for(const key of [id,other]){const c=await ctx(db,key);c.config.sites.meridian.show_chapters=false;await save(db,c.config,key);await publish(db,['meridian'],key);}
 await as(db,null);assert.equal(await one(db,'select public.publishing_public_report($1,$2) as value',['meridian',report.slug]),null);assert.deepEqual(await one(db,"select public.publishing_report_catalog('meridian') as value"),[]);assert.equal((await article(db)).report,null);assert.ok(await article(db,'meridian','tweede'));
 await as(db,owner);let c=await ctx(db);assert.equal(c.reports[0].chapters.length,2);c.config.sites.meridian.show_chapters=true;await save(db,c.config);await publish(db);await as(db,null);assert.deepEqual((await article(db)).report.chapters.map(c=>c.id),[id]);
 }finally{await db.close();}
});
test('invalid display types and stale saves are rejected; non-editors cannot change presentation',async()=>{
 const db=await create();try{const c=await ctx(db);for(const value of ['false',0,null,{}]){const config=structuredClone(c.config);config.sites.meridian.show_chapters=value;await assert.rejects(save(db,config),e=>e.code==='23514');}await save(db,c.config);await assert.rejects(save(db,c.config,id,c.version),e=>e.code==='40001');
 for(const user of [null,reader]){await as(db,user);await assert.rejects(db.query('select public.publishing_save($1::uuid,$2::bigint,$3::jsonb)',[id,99,JSON.stringify(c.config)]));}await as(db,null);await assert.rejects(db.query('select * from public.publishing_configs'));assert.equal((await article(db)).title,'Eerste artikel');
 }finally{await db.close();}
});
