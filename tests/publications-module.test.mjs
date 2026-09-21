import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createClient } from '@supabase/supabase-js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resolveModule = createRequire(import.meta.url);

function load(relative, mocks = {}, cache = new Map()) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file);
  const output = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'server-only') return {};
    // Isolate the server table boundary; the real control has its own React/action tests.
    if (name === '@/components/admin/publications/PublicationStatus') return { __esModule: true, default: ({ item }) => React.createElement('select', { 'aria-label': 'Status van ' + item.title, defaultValue: item.status }, React.createElement('option', { value: item.status }, item.status)) };
    if (name.startsWith('.') || name.startsWith('@/')) {
      const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
      const target = [base, base + '.ts', base + '.tsx'].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      return load(target, mocks, cache);
    }
    return resolveModule(name);
  };
  new Function('require', 'module', 'exports', source)(localRequire, output, output.exports);
  cache.set(file, output.exports);
  return output.exports;
}
const filters = load('src/lib/admin/publications/filters.ts');
const { publicationsQuery, toPublication } = load('src/lib/admin/publications/query.ts');
const defaults = filters.parsePublicationFilters({});
const row = { id: 'pub-1', title: 'Een <titel>', slug: 'titel', content_type: 'analysis', status: 'draft', featured: true, featured_position: 'main', updated_at: '2026-09-13T10:00:00Z' };

function clientWithResponses(responses) {
  const urls = [];
  const client = createClient('https://example.supabase.co', 'test-publishable-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async input => {
      urls.push(new URL(String(input)));
      const response = responses.shift();
      assert.ok(response, 'Unexpected extra request');
      return new Response(JSON.stringify(response.body), { status: response.status ?? 200, headers: { 'Content-Type': 'application/json', 'Content-Range': response.range ?? '0-0/1' } });
    } },
  });
  return { client, urls };
}

test('URL input is normalized; type, status and placement remain independent', () => {
  const parsed = filters.parsePublicationFilters({ q: ['  vraag  ', 'ignored'], type: 'analysis', status: 'draft', placement: 'featured', page: '3' });
  assert.deepEqual(parsed, { q: 'vraag', type: 'analysis', status: 'draft', placement: 'featured', page: 3 });
  assert.deepEqual(filters.parsePublicationFilters({ type: 'injected', status: 'unknown', placement: 'main', page: '-10' }), defaults);
  for (const page of ['0', '1.5', 'NaN', '1000001', '9007199254740993']) assert.equal(filters.parsePublicationFilters({ page }).page, 1);
  assert.equal(filters.parsePublicationFilters({ q: 'x'.repeat(200) }).q.length, 100);
  const params = new URLSearchParams(filters.publicationSearchParams(parsed, 2));
  assert.equal(params.get('type'), 'analysis'); assert.equal(params.get('status'), 'draft'); assert.equal(params.get('placement'), 'featured'); assert.equal(params.get('page'), '2');
});

test('the real query builder combines independent filters and searches literal wildcard characters', async () => {
  const { client, urls } = clientWithResponses([{ body: [row] }]);
  const result = await publicationsQuery(client, { ...defaults, q: '50%_\\', type: 'analysis', status: 'draft', placement: 'featured', page: 2 });
  assert.equal(result.error, null);
  const params = urls[0].searchParams;
  assert.equal(params.get('content_type'), 'eq.analysis'); assert.equal(params.get('status'), 'eq.draft'); assert.equal(params.get('featured'), 'eq.true');
  assert.equal(params.get('title'), 'ilike.%50\\%\\_\\\\%');
  assert.equal(params.get('offset'), '25'); assert.equal(params.get('limit'), '25');
  assert.equal(params.get('order'), 'updated_at.desc,id.asc');
});

test('default data includes every type and status; placement does not imply published', async () => {
  const { client, urls } = clientWithResponses([{ body: [row] }, { body: [row] }]);
  await publicationsQuery(client, defaults);
  for (const name of ['content_type', 'status', 'featured']) assert.equal(urls[0].searchParams.has(name), false);
  await publicationsQuery(client, { ...defaults, placement: 'unfeatured' });
  assert.equal(urls[1].searchParams.get('featured'), 'eq.false');
  assert.equal(urls[1].searchParams.has('status'), false);
  const publication = toPublication(row);
  assert.equal(publication.type, 'analysis'); assert.equal(publication.status, 'draft');
  assert.deepEqual(publication.placement, { featured: true, position: 'main' });
});

test('the repository always enforces editorial access before reading', async () => {
  const denied = new Error('editorial access denied');
  const { getPublications } = load('src/lib/admin/publications/repository.ts', { '@/lib/admin/roles': { requireEditorialUser: async () => { throw denied; } } });
  await assert.rejects(getPublications(defaults), error => error === denied);
});

test('database errors are distinct from an empty list and do not expose internal details', async () => {
  const { client } = clientWithResponses([{ status: 500, body: { code: 'XX000', message: 'internal secret error' } }, { body: [], range: '*/0' }]);
  const { getPublications } = load('src/lib/admin/publications/repository.ts', { '@/lib/admin/roles': { requireEditorialUser: async () => ({ supabase: client }) } });
  const failed = await getPublications(defaults); assert.equal(failed.ok, false); assert.doesNotMatch(failed.message, /secret/);
  const empty = await getPublications(defaults); assert.equal(empty.ok, true); assert.equal(empty.total, 0); assert.deepEqual(empty.items, []);
});

test('an out-of-range page is recovered while preserving filters', async () => {
  const { client, urls } = clientWithResponses([{ body: [], range: '*/26' }, { body: [row], range: '25-25/26' }]);
  const { getPublications } = load('src/lib/admin/publications/repository.ts', { '@/lib/admin/roles': { requireEditorialUser: async () => ({ supabase: client }) } });
  const result = await getPublications({ ...defaults, page: 10, status: 'draft' });
  assert.equal(result.ok, true); assert.equal(result.page, 2); assert.equal(result.total, 26);
  assert.equal(urls[1].searchParams.get('status'), 'eq.draft'); assert.equal(urls[1].searchParams.get('offset'), '25');
});

test('columns can be rearranged without data changes; draft records never get public links', () => {
  const mocks = {
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    '@/lib/admin/content': { publicContentHref: (type, slug) => type === 'research' ? '/onderzoek/' + slug : '/artikelen/' + slug },
  };
  const { publicationColumns } = load('src/components/admin/publications/publication-columns.tsx', mocks);
  const Table = load('src/components/admin/publications/PublicationsTable.tsx', mocks).default;
  const reordered = [publicationColumns[2], publicationColumns[0], publicationColumns[5]];
  const draft = renderToStaticMarkup(React.createElement(Table, { items: [toPublication(row)], columns: reordered }));
  assert.ok(draft.indexOf('>Status</th>') < draft.indexOf('>Titel</th>'));
  assert.match(draft, /Een &lt;titel&gt;/); assert.match(draft, /\/admin\/content\/pub-1/); assert.doesNotMatch(draft, /href="\/artikelen\//);
  const published = renderToStaticMarkup(React.createElement(Table, { items: [toPublication({ ...row, status: 'published' })], columns: reordered }));
  assert.match(published, /href="\/lees\/pub-1"/);
  const editable = renderToStaticMarkup(React.createElement(Table, { items: [{ ...toPublication(row), canChangeStatus: true }], columns: reordered }));
  assert.match(editable, /<select/); assert.doesNotMatch(draft, /<select/);
});

test('a rejected database range recovers to the first page without dropping filters', async () => {
  const { client, urls } = clientWithResponses([{ status: 416, body: { code: 'PGRST103', message: 'Invalid range' }, range: '*/1' }, { body: [row] }]);
  const { getPublications } = load('src/lib/admin/publications/repository.ts', { '@/lib/admin/roles': { requireEditorialUser: async () => ({ supabase: client }) } });
  const result = await getPublications({ ...defaults, page: 10, type: 'analysis' });
  assert.equal(result.ok, true); assert.equal(result.page, 1);
  assert.equal(urls[1].searchParams.get('content_type'), 'eq.analysis');
});

test('list editing controls follow the existing owner/editor database boundary', async () => {
  for (const role of ['owner', 'editor', 'admin', 'researcher', 'fact_checker']) {
    const { client } = clientWithResponses([{ body: [row] }]);
    const { getPublications } = load('src/lib/admin/publications/repository.ts', { '@/lib/admin/roles': { requireEditorialUser: async () => ({ supabase: client, role }) } });
    const result = await getPublications(defaults);
    assert.equal(result.ok, true); assert.equal(result.items[0].canChangeStatus, ['owner', 'editor'].includes(role));
  }
});
