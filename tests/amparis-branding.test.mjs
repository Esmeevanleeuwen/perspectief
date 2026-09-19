import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const require = createRequire(import.meta.url);
function load(file) {
  const output = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', code)(localRequire, output, output.exports);
  return output.exports;
}
const model = load(path.resolve('src/lib/publishing/model.ts'));
const seo = load(path.resolve('src/lib/publishing/seo.ts'));

test('Amparis retains existing article identities and canonical choices', () => {
  assert.equal(model.isPlatform('avera'), true);
  const item = {
    platform: 'avera', origin: 'https://amparis.test', slug: 'hoofdstuk-twee',
    title: 'Tweede hoofdstuk', summary: 'Samenvatting', seo: { indexable: true },
    published_at: '2026-09-18T00:00:00Z', updated_at: '2026-09-18T00:00:00Z',
    report: { slug: 'verslag', title: 'Verslag' },
  };
  const jsonld = seo.articleStructuredData(item);
  assert.equal(jsonld.publisher.name, 'Amparis');
  assert.equal(jsonld.publisher.url, item.origin);
  assert.equal(jsonld.mainEntityOfPage, 'https://amparis.test/artikelen/hoofdstuk-twee');
  assert.equal(jsonld.isPartOf.url, 'https://amparis.test/verslagen/verslag');
  assert.equal(seo.articleStructuredData({ ...item, platform: 'meridian' }).publisher.name, 'Meridian');
  const canonical = 'https://meridian.test/artikelen/hoofdstuk-twee';
  assert.equal(seo.articleMetadata({ ...item, canonical_url: canonical }).alternates.canonical, canonical);
  assert.match(fs.readFileSync('src/components/admin/publishing/PublishingSettings.tsx', 'utf8'), /Meridian of Amparis/);
});

test('the idempotent label migration preserves origins and connected editions', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table public.publishing_sites(id text primary key, label text not null, origin text);
      create table public.edition_fixture(platform text references public.publishing_sites(id), article text);
      insert into public.publishing_sites values
        ('meridian', 'Meridian', 'https://meridian.test'),
        ('avera', 'Avera', 'https://previous-origin.test');
      insert into public.edition_fixture values ('avera', 'unchanged-article');
    `);
    const migration = fs.readFileSync('supabase/migrations/202609190001_rebrand_amparis.sql', 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const { rows } = await db.query('select * from public.publishing_sites order by id');
    assert.deepEqual(rows, [
      { id: 'avera', label: 'Amparis', origin: 'https://previous-origin.test' },
      { id: 'meridian', label: 'Meridian', origin: 'https://meridian.test' },
    ]);
    const editions = await db.query('select * from public.edition_fixture');
    assert.deepEqual(editions.rows, [{ platform: 'avera', article: 'unchanged-article' }]);
    await db.exec("update public.publishing_sites set origin = null where id = 'avera'");
    await db.exec(migration);
    const unconfigured = await db.query("select origin from public.publishing_sites where id = 'avera'");
    assert.equal(unconfigured.rows[0].origin, null);
  } finally {
    await db.close();
  }
});
