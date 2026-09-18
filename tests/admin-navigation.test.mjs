import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nativeRequire = createRequire(import.meta.url);
function load(relative, mocks = {}, cache = new Map()) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'server-only' || name.endsWith('.css')) return {};
    if (name === 'next/link') return ({ children, ...props }) => React.createElement('a', props, children);
    if (name.startsWith('.') || name.startsWith('@/')) {
      const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
      const target = [base, base + '.ts', base + '.tsx'].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!target) throw new Error('Missing module: ' + name);
      return load(target, mocks, cache);
    }
    return nativeRequire(name);
  };
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
  cache.set(file, module.exports);
  return module.exports;
}
const navigation = load('src/lib/admin/navigation.ts');
const model = load('src/lib/admin/writing/model.ts');
const keyA = 'publication:00000000-0000-4000-8000-000000000001';
const keyB = 'note:00000000-0000-4000-8000-000000000002';
const state = () => ({ ...model.emptyWritingState(), view: { ...model.emptyView(), tabs: [keyA, keyB], active: keyA } });
const filters = { q: '', type: '', status: '', placement: '', page: 1 };

test('work areas are separate; member content is not a duplicate primary tab', () => {
  const items = navigation.adminNavigation('owner');
  assert.deepEqual(items.map(item => item.label), ['Overzicht', 'Werkplek', 'Onderzoeken', 'Publicaties', 'Gebruikers']);
  assert.equal(new Set(items.map(item => item.href)).size, items.length);
  assert.equal(items.some(item => item.href === '/admin/ledencontent'), false);
  for (const role of ['editor', 'researcher']) assert.equal(navigation.adminNavigation(role).some(item => item.href === '/admin/gebruikers'), false);
  assert.equal(navigation.adminNavigation('admin').some(item => item.href === '/admin/gebruikers'), true);
});

test('nested member routes select Publicaties, not Werkplek or an unrelated prefix', () => {
  const items = navigation.adminNavigation('owner');
  for (const route of ['/admin/ledencontent', '/admin/ledencontent/nieuw', '/admin/ledencontent/123'])
    assert.equal(navigation.activeAdminItem(route, items).href, '/admin/content');
  assert.equal(navigation.activeAdminItem('/admin/werkplek', items).label, 'Werkplek');
  assert.equal(navigation.activeAdminItem('/admin/onderzoeken', items).label, 'Onderzoeken');
  assert.equal(navigation.activeAdminItem('/admin/content/123', items).label, 'Publicaties');
  assert.equal(navigation.activeAdminItem('/admin/content-other', items), undefined);
});

test('member subnavigation keeps the existing role boundary', async () => {
  for (const role of ['owner', 'admin', 'editor', 'researcher']) {
    const Component = load('src/components/admin/publications/PublicationNavigation.tsx', {
      '@/lib/admin/roles': { requireEditorialUser: async () => ({ role }) },
      './publication-navigation.module.css': { navigation: 'test-nav' },
    }).default;
    const html = renderToStaticMarkup(await Component({ active: 'website' }));
    assert.match(html, /href="\/admin\/content"/);
    assert.equal(html.includes('/admin/ledencontent'), ['owner', 'admin'].includes(role));
  }
});

test('opening and closing tabs only changes the view, never the document source', () => {
  const original = state();
  const opened = model.openItem(original.view, keyB);
  assert.equal(opened.active, keyB);
  assert.deepEqual(opened.tabs, [keyA, keyB]);
  const closed = model.closeItem(opened, keyB);
  assert.deepEqual(closed.tabs, [keyA]);
  assert.equal(closed.active, keyA);
  assert.deepEqual(original, state());
});

test('tabs are visible outside a menu and link to the active editor panel', () => {
  const Tabs = load('src/components/admin/publications/workspace/OpenDocumentTabs.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Tabs, {
    view: state().view, title: key => key === keyA ? 'Tekst één' : 'Notitie twee', dirty: [keyA],
    onOpen() {}, onClose() {}, onNew() {}, capture: false, captureDirty: false,
  }));
  const document = new JSDOM(html).window.document;
  const tabs = document.querySelectorAll('[role="tab"]');
  assert.equal(tabs.length, 2);
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
  assert.equal(tabs[0].getAttribute('aria-controls'), 'writing-active-document');
  assert.match(tabs[0].getAttribute('aria-label'), /niet opgeslagen/);
  assert.equal(tabs[0].closest('details'), null);
});

test('arrow keys activate tabs; Delete closes a tab without losing the remaining view', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/admin/werkplek', pretendToBeVisual: true });
  const saved = new Map();
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
    requestAnimationFrame: callback => { callback(); return 0; }, IS_REACT_ACT_ENVIRONMENT: true })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  const Tabs = load('src/components/admin/publications/workspace/OpenDocumentTabs.tsx').default;
  let current;
  function Harness() {
    const [view, setView] = React.useState(state().view);
    current = view;
    return React.createElement(Tabs, { view, title: key => key === keyA ? 'Eén' : 'Twee', dirty: [keyA],
      onOpen: key => setView(old => model.openItem(old, key)),
      onClose: key => setView(old => model.closeItem(old, key)),
      onNew() {}, capture: false, captureDirty: false });
  }
  const app = createRoot(dom.window.document.getElementById('root'));
  try {
    await act(async () => app.render(React.createElement(Harness)));
    const first = dom.window.document.querySelector('[role="tab"]');
    first.focus();
    await act(async () => first.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    assert.equal(current.active, keyB);
    assert.equal(dom.window.document.activeElement.getAttribute('aria-selected'), 'true');
    await act(async () => dom.window.document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Delete', bubbles: true })));
    assert.deepEqual(current.tabs, [keyA]);
    assert.equal(current.active, keyA);
  } finally {
    await act(async () => app.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});

test('workspace entry still checks editorial access before any reads', async () => {
  const denied = new Error('denied');
  const Component = load('src/components/admin/publications/workspace/WritingWorkspaceData.tsx', {
    '@/lib/admin/roles': { requireEditorialUser: async () => { throw denied; } },
    '@/lib/admin/writing/repository': {},
    './WritingWorkspace': () => null,
  }).default;
  await assert.rejects(Component({ filters, openKey: keyA }), error => error === denied);
});

test('management deep links open the existing document without copying notes, sessions or collections', async () => {
  const existing = state();
  existing.collections = [{ id: 'folder', name: 'Werk', items: [keyA] }];
  existing.sessions = [{ id: 'session', name: 'Later', view: state().view }];
  const calls = [];
  const Component = load('src/components/admin/publications/workspace/WritingWorkspaceData.tsx', {
    '@/lib/admin/roles': { requireEditorialUser: async () => ({ user: { id: 'editor' }, supabase: {} }) },
    '@/lib/admin/writing/repository': {
      readWritingSpace: async () => ({ state: structuredClone(existing), version: 7 }),
      readWritingPage: async () => ({ items: [], total: 0, page: 1 }),
      readWritingDocument: async (_client, userId, key) => { calls.push([userId, key]); return { key }; },
    },
    './WritingWorkspace': () => null,
  }).default;
  const result = await Component({ filters, openKey: keyB });
  assert.equal(result.props.initialState.view.active, keyB);
  assert.equal(result.props.initialDetail, true);
  assert.deepEqual(result.props.initialState.collections, existing.collections);
  assert.deepEqual(result.props.initialState.sessions, existing.sessions);
  assert.deepEqual(calls, [['editor', keyB]]);
});

test('publication management and writing use different module entry points', () => {
  const publications = fs.readFileSync(path.join(root, 'src/components/admin/publications/PublicationsModule.tsx'), 'utf8');
  const workspace = fs.readFileSync(path.join(root, 'src/app/admin/werkplek/page.tsx'), 'utf8');
  assert.match(publications, /PublicationsResults/);
  assert.match(publications, /PublicationFilters/);
  assert.doesNotMatch(publications, /WritingWorkspaceData/);
  assert.match(workspace, /WritingWorkspaceData/);
  assert.match(workspace, /isItemKey/);
});
