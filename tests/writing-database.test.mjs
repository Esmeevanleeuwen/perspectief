import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const owner = "10000000-0000-4000-8000-000000000001",
  other = "10000000-0000-4000-8000-000000000002",
  member = "10000000-0000-4000-8000-000000000003";
const publication = "20000000-0000-4000-8000-000000000001",
  section = "30000000-0000-4000-8000-000000000001";
await db.exec(`
create role anon; create role authenticated;
create schema auth; grant usage on schema auth,public to authenticated,anon;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create table public.user_roles(user_id uuid primary key,role text);
create function public.is_editorial() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('owner','editor')) $$;
create table public.content_items(id uuid primary key,slug text,content_type text,title text,summary text,status text,featured boolean default false,updated_at timestamptz default now(),metadata jsonb default '{}');
create table public.content_sections(id uuid primary key default gen_random_uuid(),content_id uuid references public.content_items(id),section_type text default 'paragraph',title text,body text,data jsonb default '{}',position integer default 0,updated_at timestamptz default now());
alter table public.content_items enable row level security; alter table public.content_sections enable row level security; alter table public.user_roles enable row level security;
grant select,insert,update,delete on public.content_items,public.content_sections to authenticated;grant select on public.content_items,public.content_sections to anon;grant select on public.user_roles to authenticated;
create policy roles_select on public.user_roles for select using(user_id=auth.uid());
create policy content_manage on public.content_items for all using(public.is_editorial()) with check(public.is_editorial());
create policy content_select on public.content_items for select using(status='published' or public.is_editorial());
create policy sections_manage on public.content_sections for all using(public.is_editorial()) with check(public.is_editorial());
create policy sections_select on public.content_sections for select using(exists(select 1 from public.content_items c where c.id=content_id and(c.status='published' or public.is_editorial())));
insert into auth.users values ('${owner}'),('${other}'),('${member}');
insert into public.user_roles values ('${owner}','owner'),('${other}','editor'),('${member}','contributor');
insert into public.content_items(id,slug,content_type,title,summary,status,metadata) values('${publication}','bestaand','analysis','Titel 50%_','Samenvatting','draft','{"keep":true}');
insert into public.content_sections(id,content_id,section_type,title,body,data,position) values('${section}','${publication}','callout','Een sectie','Zoek dit unieke verband','{"points":["Bewaar dit"],"custom":"intact"}',10);
`);
await db.exec(
  fs.readFileSync(
    new URL(
      "../supabase/migrations/20260913154532_admin_writing_workspace.sql",
      import.meta.url,
    ),
    "utf8",
  ),
);
after(() => db.close());
async function asUser(id, fn) {
  await db.exec("begin;set local role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [id]);
  try {
    await fn();
  } finally {
    await db.exec("rollback");
  }
}
async function failure(sql, params = [], code) {
  await db.exec("savepoint expected_failure");
  try {
    await assert.rejects(
      db.query(sql, params),
      (error) => !code || error.code === code,
    );
  } finally {
    await db.exec("rollback to savepoint expected_failure");
  }
}
async function read() {
  return (
    await db.query("select public.admin_read_publication($1) as doc", [
      publication,
    ])
  ).rows[0].doc;
}
function sections(doc) {
  return doc.sections.map((s) => ({
    id: s.id,
    title: s.title,
    body: s.body,
    kind: s.section_type,
  }));
}

test("live-schema functions search section text and literal wildcard characters, and keep filters independent", async () =>
  asUser(owner, async () => {
    const search = async (q, type = "", status = "", included = null) =>
      (
        await db.query(
          "select public.admin_list_writing_items($1,$2,$3,'',$4,null,0) as page",
          [q, type, status, included],
        )
      ).rows[0].page;
    assert.equal((await search("unieke verband")).total, 1);
    assert.equal((await search("50%_", "analysis", "draft")).total, 1);
    assert.equal((await search("50%X")).total, 0);
    assert.equal((await search("", "article", "draft")).total, 0);
    assert.equal((await search("", "", "", [])).total, 0);
    assert.equal(
      (await search("", "", "", ["publication:" + publication])).total,
      1,
    );
  }));
test("notes and workspace state survive writes for their owner and are isolated from another editor", async () =>
  asUser(owner, async () => {
    const note = (
      await db.query(
        'insert into public.admin_writing_notes(user_id,title,sections) values($1,\'Mijn notitie\',\'[{"id":"40000000-0000-4000-8000-000000000001","body":"Privé"}]\') returning id,version',
        [owner],
      )
    ).rows[0];
    await db.query(
      "insert into public.admin_writing_spaces(user_id,state) values($1,'{\"collections\":[]}')",
      [owner],
    );
    assert.equal(
      (await db.query("select id from public.admin_writing_notes")).rows.length,
      1,
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      other,
    ]);
    assert.equal(
      (await db.query("select id from public.admin_writing_notes")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.admin_writing_spaces")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          "update public.admin_writing_notes set title='Ander' where id=$1 returning id",
          [note.id],
        )
      ).rows.length,
      0,
    );
    await failure(
      "insert into public.admin_writing_spaces(user_id,state) values($1,'{}')",
      [owner],
      "42501",
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      owner,
    ]);
    assert.equal(
      (
        await db.query(
          "select title from public.admin_writing_notes where id=$1",
          [note.id],
        )
      ).rows[0].title,
      "Mijn notitie",
    );
    assert.equal(
      (
        await db.query(
          "update public.admin_writing_notes set version=2 where id=$1 and version=1 returning id",
          [note.id],
        )
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "update public.admin_writing_notes set title='Verouderd' where id=$1 and version=1 returning id",
          [note.id],
        )
      ).rows.length,
      0,
    );
  }));
test("contributors and anonymous requests cannot call editorial RPCs or read private notes", async () => {
  await asUser(member, async () => {
    await failure(
      "select public.admin_read_publication($1)",
      [publication],
      "42501",
    );
    await failure("select public.admin_list_writing_items()", [], "42501");
    await failure(
      "insert into public.admin_writing_notes(user_id,title) values($1,'Verboden')",
      [member],
      "42501",
    );
  });
  await db.exec("begin;set local role anon;");
  try {
    await failure("select * from public.admin_writing_notes", [], "42501");
    await failure("select public.admin_list_writing_items()", [], "42501");
  } finally {
    await db.exec("rollback");
  }
});
test("publication saves are atomic and preserve structured data, publishing settings and section types", async () =>
  asUser(owner, async () => {
    const original = await read(),
      blocks = sections(original);
    blocks[0].body = "Nieuwe tekst";
    blocks.push({
      id: "30000000-0000-4000-8000-000000000002",
      title: "Toegevoegd",
      body: "Nieuw blok",
      kind: "paragraph",
      fresh: true,
    });
    const saved = (
      await db.query(
        "select public.admin_save_publication($1,$2,$3,$4,$5) as doc",
        [
          publication,
          original.revision,
          "Nieuwe titel",
          "Nieuwe samenvatting",
          JSON.stringify(blocks),
        ],
      )
    ).rows[0].doc;
    assert.equal(saved.item.title, "Nieuwe titel");
    assert.equal(saved.item.status, "draft");
    assert.equal(saved.item.slug, "bestaand");
    assert.deepEqual(saved.item.metadata, { keep: true });
    assert.equal(saved.sections[0].section_type, "callout");
    assert.deepEqual(saved.sections[0].data, {
      points: ["Bewaar dit"],
      custom: "intact",
    });
    assert.equal(saved.sections[1].body, "Nieuw blok");
    assert.notEqual(saved.revision, original.revision);
    await failure(
      "select public.admin_save_publication($1,$2,$3,$4,$5)",
      [
        publication,
        original.revision,
        "Verouderde titel",
        "",
        JSON.stringify(blocks),
      ],
      "40001",
    );
    assert.equal((await read()).item.title, "Nieuwe titel");
  }));
test("deleted, foreign and duplicated sections fail without partial publication updates", async () =>
  asUser(owner, async () => {
    const original = await read();
    await failure(
      "select public.admin_save_publication($1,$2,$3,$4,$5)",
      [publication, original.revision, "Mag niet veranderen", "", "[]"],
      "22023",
    );
    const wrong = sections(original);
    wrong[0].id = "30000000-0000-4000-8000-999999999999";
    await failure(
      "select public.admin_save_publication($1,$2,$3,$4,$5)",
      [publication, original.revision, "Ook niet", "", JSON.stringify(wrong)],
      "P0002",
    );
    assert.equal((await read()).revision, original.revision);
    await db.query(
      "update public.content_sections set position=99 where id=$1",
      [section],
    );
    await failure(
      "select public.admin_save_publication($1,$2,$3,$4,$5)",
      [
        publication,
        original.revision,
        "Oude volgorde",
        "",
        JSON.stringify(sections(original)),
      ],
      "40001",
    );
  }));
test("workspace compare-and-swap does not overwrite a newer browser session", async () =>
  asUser(owner, async () => {
    await db.query(
      "insert into public.admin_writing_spaces(user_id,state) values($1,'{}')",
      [owner],
    );
    assert.equal(
      (
        await db.query(
          "update public.admin_writing_spaces set state='{\"saved\":true}',version=2 where user_id=$1 and version=1 returning version",
          [owner],
        )
      ).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "update public.admin_writing_spaces set state='{\"saved\":false}',version=2 where user_id=$1 and version=1 returning version",
          [owner],
        )
      ).rows.length,
      0,
    );
  }));
