import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const id='10000000-0000-4000-8000-000000000001', other='10000000-0000-4000-8000-000000000002', owner='20000000-0000-4000-8000-000000000001', editor='20000000-0000-4000-8000-000000000002', reader='20000000-0000-4000-8000-000000000003', block='30000000-0000-4000-8000-000000000001';
const setup=`
create schema auth;create role anon;create role authenticated;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
create table public.user_roles(user_id uuid primary key,role text);
insert into public.user_roles values('${owner}','owner'),('${editor}','editor'),('${reader}','researcher');
create function public.current_role() returns text language sql stable security definer set search_path='' as $$select coalesce((select role from public.user_roles where user_id=auth.uid()),'contributor')$$;
create function public.is_editorial() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','editor')$$;
create function public.can_edit_content() returns boolean language sql stable security definer set search_path='' as $$select public.current_role() in ('owner','admin','editor','researcher','fact_checker')$$;
create table public.content_items(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,content_type text not null,status text not null default 'draft',author_id uuid,eyebrow text,subtitle text,summary text,hero_image text,image_alt text,featured boolean not null default false,featured_position text,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),metadata jsonb not null default '{}');
create table public.content_sections(id uuid primary key default gen_random_uuid(),content_id uuid references public.content_items(id) on delete cascade,section_type text default 'paragraph',position integer default 0,title text,body text,data jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
create table public.research_children(research_content_id uuid,child_content_id uuid,relation text,position int);
alter table public.content_items enable row level security;alter table public.content_sections enable row level security;
create policy content_manage on public.content_items for all using(public.is_editorial()) with check(public.is_editorial());
create policy content_select on public.content_items for select using(status='published' or public.is_editorial());
create policy sections_manage on public.content_sections for all using(public.is_editorial()) with check(public.is_editorial());
create policy sections_select on public.content_sections for select using(exists(select 1 from public.content_items c where c.id=content_id and (c.status='published' or public.is_editorial())));
grant select,insert,update,delete on public.content_items,public.content_sections to anon,authenticated;
create function public.admin_read_publication(p_id uuid) returns jsonb language plpgsql set search_path='' as $$declare item jsonb; blocks jsonb;begin
 if auth.uid() is null or not public.can_edit_content() then raise exception 'No access' using errcode='42501';end if;
 select to_jsonb(c) into item from public.content_items c where id=p_id;if item is null then raise exception 'Unavailable' using errcode='P0002';end if;
 select coalesce(jsonb_agg(to_jsonb(s) order by s.position,s.id),'[]') into blocks from public.content_sections s where content_id=p_id;
 return jsonb_build_object('item',item,'sections',blocks,'revision',md5(item::text||blocks::text),'editable',public.is_editorial());end$$;
insert into public.content_items(id,slug,title,summary,content_type,status,hero_image,metadata) values('${id}','bestaand-artikel','Bestaand artikel','Samenvatting','article','published','/foto.jpg','{"experiences":2,"private_secret":"PRIVATE SOURCE"}'),('${other}','tweede-hoofdstuk','Tweede hoofdstuk','Toelichting','article','draft',null,'{}');
insert into public.content_sections(id,content_id,title,body) values('${block}','${id}','Eerste sectie','Publieke tekst'),('30000000-0000-4000-8000-000000000002','${other}','Tweede sectie','Tweede tekst');
`;
async function create(){const db=new PGlite();await db.exec(setup);await db.exec(fs.readFileSync('supabase/migrations/202609180001_shared_publishing.sql','utf8'));await db.exec(fs.readFileSync('supabase/migrations/202609180002_activate_shared_publishing.sql','utf8'));return db;}
async function as(db,user){await db.exec(`reset role;set role ${user?'authenticated':'anon'};`);await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[user||'']);}
async function one(db,sql,values=[]){return (await db.query(sql,values)).rows[0]?.value;}
const context=(db,key=id)=>one(db,'select public.publishing_context($1::uuid) as value',[key]);
const article=(db,site='meridian',slug='bestaand-artikel')=>one(db,'select public.publishing_article($1,$2) as value',[site,slug]);
const revision=(db,key=id)=>one(db,"select public.admin_read_publication($1::uuid)->>'revision' as value",[key]);
async function save(db,cfg,key=id){const c=await context(db,key);return one(db,'select public.publishing_save($1::uuid,$2::bigint,$3::jsonb) as value',[key,c.version,JSON.stringify(cfg)]);}
async function publish(db,sites=['meridian'],key=id){const c=await context(db,key),r=c.reports.find(r=>r.chapters.some(x=>x.id===key));return one(db,'select public.publishing_publish($1::uuid,$2::text[],$3::bigint,$4,$5::bigint) as value',[key,`{${sites.join(',')}}`,c.version,await revision(db,key),r?.version??null]);}
async function report(db,key,action,r,title=null,order=null){return one(db,'select public.publishing_report_change($1::uuid,$2,$3::uuid,$4::bigint,$5,$6::uuid[]) as value',[key,action,r?.id??null,r?.version??null,title,order?`{${order.join(',')}}`:null]);}

test('backfill preserves public Meridian articles, not Avera; drafts and metadata are private',async()=>{
 const db=await create();try{await as(db,null);const a=await article(db);assert.equal(a.title,'Bestaand artikel');assert.equal(a.hero_image,'https://meridiancollective.nl/foto.jpg');assert.doesNotMatch(JSON.stringify(a),/PRIVATE SOURCE|private_secret|author_id/);
 assert.equal(await article(db,'avera'),null);assert.equal(await article(db,'meridian','tweede-hoofdstuk'),null);
 assert.equal((await db.query('select * from public.content_items')).rows.length,0);assert.equal((await db.query('select * from public.content_sections')).rows.length,0);
 for(const table of ['publishing_configs','publishing_revisions','publishing_reports','publishing_editions'])await assert.rejects(db.query(`select * from public.${table}`));
 await assert.rejects(db.query('select public.publishing_document($1::uuid)',[id]));
 await as(db,reader);await assert.rejects(context(db));await assert.rejects(db.query('select public.publishing_withdraw($1::uuid,$2)',[id,'meridian']));
 }finally{await db.close();}
});
test('one revision can be released on both sites; saving a draft changes neither live edition',async()=>{
 const db=await create();try{await as(db,owner);let c=await context(db);c.config.tags=['CONFIDENTIAL_TAG'];c.config.sites.meridian.internal_secret='DO NOT EXPOSE';c.config.sites.avera.selected=true;await save(db,c.config);const released=await publish(db,['meridian','avera']);
 await db.query("update public.content_sections set body='SECRET NEW DRAFT',updated_at=clock_timestamp() where content_id=$1::uuid",[id]);
 await as(db,null);for(const site of ['meridian','avera']){const a=await article(db,site);assert.equal(a.revision_id,released.revision_id);assert.equal(a.content_sections[0].body,'Publieke tekst');assert.doesNotMatch(JSON.stringify(a),/SECRET NEW DRAFT|CONFIDENTIAL_TAG|DO NOT EXPOSE/);}
 await as(db,owner);await publish(db,['meridian']);await as(db,null);assert.equal((await article(db)).content_sections[0].body,'SECRET NEW DRAFT');assert.equal((await article(db,'avera')).content_sections[0].body,'Publieke tekst');
 }finally{await db.close();}
});
test('revisions and settings use optimistic concurrency; rights do not broaden',async()=>{
 const db=await create();try{await as(db,editor);const c=await context(db),rev=await revision(db);await save(db,c.config);await assert.rejects(db.query('select public.publishing_save($1::uuid,$2::bigint,$3::jsonb)',[id,c.version,JSON.stringify(c.config)]),e=>e.code==='40001');
 await db.query("update public.content_items set title='Later title',updated_at=clock_timestamp() where id=$1::uuid",[id]);
 await assert.rejects(db.query('select public.publishing_publish($1::uuid,$2::text[],$3::bigint,$4,$5::bigint)',[id,'{meridian}',c.version+1,rev,null]),e=>e.code==='40001');
 await assert.rejects(db.query('select public.publishing_set_origin($1,$2)',['avera','https://avera.test']),e=>e.code==='42501');
 const changed=await context(db);changed.config.relations=[{target:'99999999-0000-4000-8000-000000000001',kind:'related'}];await assert.rejects(save(db,changed.config));
 }finally{await db.close();}
});
test('chapters have ordered public neighbours; new or withdrawn chapters do not leak',async()=>{
 const db=await create();try{await as(db,owner);await report(db,id,'create',null,'Een samenhangend verslag');let r=(await context(db)).reports[0];await report(db,other,'attach',r);r=(await context(db)).reports[0];const created=await report(db,id,'next',r,'PRIVATE CHAPTER TITLE');assert.ok(created.new_content_id);await publish(db);await publish(db,['meridian'],other);
 await as(db,null);let a=await article(db);assert.equal(a.report.chapters.length,2);assert.deepEqual(a.report.chapters.map(c=>c.id),[id,other]);assert.doesNotMatch(JSON.stringify(a),/PRIVATE CHAPTER TITLE/);
 await as(db,owner);r=(await context(db)).reports[0];await report(db,id,'reorder',r,null,[other,id,created.new_content_id]);await assert.rejects(report(db,id,'rename',r,'stale'),e=>e.code==='40001');await publish(db);
 await as(db,null);assert.deepEqual((await article(db)).report.chapters.map(c=>c.id),[other,id]);await as(db,owner);await db.query('select public.publishing_withdraw($1::uuid,$2)',[other,'meridian']);await as(db,null);assert.equal((await article(db)).report.chapters.length,1);
 }finally{await db.close();}
});
test('stable in-text IDs resolve per site, renamed slugs redirect, unsafe targets fail closed',async()=>{
 const db=await create();try{await as(db,owner);await publish(db,['meridian'],other);await db.query('update public.content_sections set body=$2 where content_id=$1::uuid',[id,`Lees [het vervolg](content:${other}#section-30000000-0000-4000-8000-000000000002) en [ongeldig](content:------------------------------------).`]);let c=await context(db);c.config.sites.avera.selected=true;await save(db,c.config);await publish(db,['meridian','avera']);await as(db,null);
 assert.equal((await article(db)).targets[other].href,'/artikelen/tweede-hoofdstuk');assert.equal((await article(db,'avera')).targets[other].href,'https://meridiancollective.nl/artikelen/tweede-hoofdstuk');
 await as(db,owner);c=await context(db);c.config.sites.meridian.slug='nieuw-adres';await save(db,c.config);await publish(db);await as(db,null);assert.equal((await article(db)).slug,'nieuw-adres');assert.match((await article(db)).canonical_url,/nieuw-adres$/);
 await as(db,owner);await db.query('select public.publishing_withdraw($1::uuid,$2)',[other,'meridian']);await as(db,null);assert.deepEqual((await article(db)).targets,{});
 }finally{await db.close();}
});
test('canonical settings reject cycles and respect self-canonical chapters',async()=>{
 const db=await create();try{await as(db,owner);await db.query('select public.publishing_set_origin($1,$2)',['avera','https://avera.test']);const c=await context(db);c.config.sites.avera.selected=true;c.config.sites.avera.canonical='meridian';await save(db,c.config);await publish(db,['meridian','avera']);await as(db,null);assert.equal((await article(db,'avera')).canonical_url,'https://meridiancollective.nl/artikelen/bestaand-artikel');
 await as(db,owner);c.config.sites.meridian.canonical='avera';await save(db,c.config);await assert.rejects(publish(db,['meridian','avera']));
 }finally{await db.close();}
});
