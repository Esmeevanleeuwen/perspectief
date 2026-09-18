import { test, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { JSDOM } from "jsdom";

const dom = new JSDOM('<div id="test-root"></div>', {
  url: "https://meridian.test/admin/content",
});
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  location: dom.window.location,
  FormData: dom.window.FormData,
  HTMLElement: dom.window.HTMLElement,
  HTMLInputElement: dom.window.HTMLInputElement,
  HTMLTextAreaElement: dom.window.HTMLTextAreaElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  resolve = createRequire(import.meta.url);
function load(relative, mocks, cache = new Map()) {
  const file = path.resolve(repo, relative);
  if (cache.has(file)) return cache.get(file);
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const require = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.endsWith(".css") || name === "server-only") return {};
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/")
        ? path.join(repo, "src", name.slice(2))
        : path.resolve(path.dirname(file), name);
      const next = [base, base + ".ts", base + ".tsx"].find(
        (p) => fs.existsSync(p) && fs.statSync(p).isFile(),
      );
      return load(next, mocks, cache);
    }
    return resolve(name);
  };
  new Function("require", "module", "exports", source)(
    require,
    loadedModule,
    loadedModule.exports,
  );
  cache.set(file, loadedModule.exports);
  return loadedModule.exports;
}
const key1 = "note:10000000-0000-4000-8000-000000000001",
  key2 = "note:10000000-0000-4000-8000-000000000002";
const makeDoc = (key, title) => ({
  key,
  title,
  summary: "",
  type: "note",
  status: "idea",
  featured: false,
  updatedAt: "2026-09-13T10:00:00Z",
  revision: "1",
  slug: null,
  editable: true,
  sections: [
    {
      id: key.slice(5),
      title: "Gedachte",
      body: "Bestaande tekst",
      kind: "paragraph",
    },
  ],
});
const backend = new Map([
  [key1, makeDoc(key1, "Eerste stuk")],
  [key2, makeDoc(key2, "Tweede stuk")],
]);
const copy = (value) => structuredClone(value);
const spaceWrites = [];
let spaceVersion = 0;
let saveGate = null;
let conflict = false;
const actions = {
  loadWritingDocument: async (key) =>
    backend.has(key)
      ? { ok: true, value: copy(backend.get(key)) }
      : { ok: false, message: "Onbeschikbaar" },
  loadWritingTitles: async (keys) => ({
    ok: true,
    value: Object.fromEntries(
      keys
        .filter((key) => backend.has(key))
        .map((key) => [key, backend.get(key).title]),
    ),
  }),
  loadWritingPage: async () => ({
    ok: true,
    value: {
      items: [...backend.values()].map(copy),
      total: backend.size,
      page: 1,
    },
  }),
  saveWritingSpace: async (state, version) => {
    spaceWrites.push({ state: copy(state), version });
    if (version !== spaceVersion)
      return { ok: false, message: "Conflict", conflict: true };
    spaceVersion++;
    return { ok: true, value: { version: spaceVersion } };
  },
  saveWritingDocument: async (doc) => {
    const snapshot = copy(doc);
    if (saveGate) await saveGate;
    if (conflict)
      return {
        ok: false,
        message: "Dit stuk is intussen gewijzigd.",
        conflict: true,
      };
    snapshot.revision = String(Number(snapshot.revision) + 1);
    snapshot.sections = snapshot.sections.map((s) => ({ ...s, fresh: false }));
    backend.set(snapshot.key, snapshot);
    return { ok: true, value: copy(snapshot) };
  },
  createWritingNote: async (title, body) => {
    const d = makeDoc(
      "note:10000000-0000-4000-8000-000000000003",
      title || body,
    );
    d.sections[0].body = body;
    backend.set(d.key, d);
    return { ok: true, value: copy(d) };
  },
};
const mocks = {
  "@/components/admin/publishing/PublishingPanel": { __esModule: true, default: () => null },
  "@/app/admin/content/workspace-actions": actions,
  "next/link": ({ href, children, ...props }) =>
    React.createElement("a", { href, ...props }, children),
};
const model = load("src/lib/admin/writing/model.ts", mocks);
const Workspace = load(
  "src/components/admin/publications/workspace/WritingWorkspace.tsx",
  mocks,
).default;
const container = document.getElementById("test-root"),
  root = createRoot(container);
after(async () => {
  await act(async () => root.unmount());
  dom.window.close();
});
const element = (selector) => {
  const found = container.querySelector(selector);
  assert.ok(found, selector);
  return found;
};
const button = (text, scope = container) => {
  const found = [...scope.querySelectorAll("button")].find(
    (b) =>
      b.getAttribute("aria-label") === text || b.textContent.trim() === text,
  );
  assert.ok(found, `button: ${text}`);
  return found;
};
const click = async (el) => act(async () => el.click());
const input = async (el, value) =>
  act(async () => {
    const prototype =
      el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(el, value);
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
const submit = async (el) =>
  act(async () =>
    el.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
const settle = async (ms = 220) =>
  act(async () => new Promise((resolve) => setTimeout(resolve, ms)));

test("real React workspace retains drafts, compares documents, captures notes and restores saved sessions", async () => {
  const state = model.emptyWritingState();
  state.view = model.openItem(state.view, key1);
  await act(async () =>
    root.render(
      React.createElement(Workspace, {
        initialState: state,
        initialVersion: 0,
        initialPage: {
          items: [...backend.values()].map(copy),
          total: 2,
          page: 1,
        },
        initialDocuments: [copy(backend.get(key1))],
      }),
    ),
  );
  assert.equal(element(".writing-title").value, "Eerste stuk");
  await input(element(".writing-section textarea"), "Mijn bewerking");
  await click(button("Tweede stuk", element(".writing-list")));
  assert.equal(element(".writing-title").value, "Tweede stuk");
  await click(button("Eerste stuk •", element(".writing-tabs")));
  assert.equal(element(".writing-section textarea").value, "Mijn bewerking");
  await click(element('button[aria-label="Sluit tabblad Eerste stuk"]'));
  await click(button("Eerste stuk •", element(".writing-list")));
  assert.equal(element(".writing-section textarea").value, "Mijn bewerking");
  await click(element(".writing-document-menu > summary"));
  await click(button("Koppelen"));
  await click(button("Ernaast", element(".writing-connections")));
  assert.equal(element(".writing-workspace").dataset.mode, "reference");
  assert.ok(element(".writing-reference").textContent.includes("Tweede stuk"));
  await click(element(".writing-document-menu > summary"));
  await click(button("Alleen schrijfvlak"));
  assert.equal(element(".writing-workspace").dataset.mode, "focus");
  await click(button("‹ Terug naar lijst"));
  await click(element(".writing-open-menu > summary"));
  await click(element(".writing-save-session > summary"));
  await input(element(".writing-save-session input"), "Mijn sessie");
  await submit(element(".writing-save-session form"));
  await click(element('button[aria-label="Sluit tabblad Tweede stuk"]'));
  await click(
    [...element(".writing-sessions").querySelectorAll("button")].find((b) =>
      b.textContent.includes("Mijn sessie"),
    ),
  );
  assert.equal(container.querySelectorAll(".writing-tab").length, 2);
  await click(button("Nieuwe tekst"));
  await input(element(".writing-capture textarea"), "Een nieuwe gedachte");
  await click(button("Sluiten", element(".writing-capture")));
  await click(button("Nieuwe tekst"));
  assert.equal(
    element(".writing-capture textarea").value,
    "Een nieuwe gedachte",
  );
  await click(element('.writing-capture input[type="checkbox"]'));
  await submit(element(".writing-capture"));
  assert.equal(element(".writing-title").value, "Een nieuwe gedachte");
  assert.ok(
    element(".writing-connections").textContent.includes("Eerste stuk"),
  );
  await settle(600);
  assert.ok(spaceWrites.length > 0);
  assert.equal(
    spaceWrites.at(-1).state.view.active,
    "note:10000000-0000-4000-8000-000000000003",
  );
  assert.ok(
    spaceWrites.at(-1).state.sessions.some((s) => s.name === "Mijn sessie"),
  );
});

test("typing during a save is retained; a later conflict never discards or overwrites that draft", async () => {
  await input(element(".writing-section textarea"), "Tekst verstuurd");
  let release;
  saveGate = new Promise((resolve) => {
    release = resolve;
  });
  await click(button("Tekst opslaan"));
  assert.ok(button("Opslaan…").disabled);
  await input(
    element(".writing-section textarea"),
    "Verder getypt tijdens opslaan",
  );
  await act(async () => {
    release();
    await saveGate;
  });
  saveGate = null;
  assert.equal(
    element(".writing-section textarea").value,
    "Verder getypt tijdens opslaan",
  );
  assert.equal(
    element(".writing-save-status").textContent,
    "Nog niet opgeslagen",
  );
  assert.equal(
    backend.get("note:10000000-0000-4000-8000-000000000003").sections[0].body,
    "Tekst verstuurd",
  );
  conflict = true;
  await click(button("Tekst opslaan"));
  assert.equal(
    element(".writing-section textarea").value,
    "Verder getypt tijdens opslaan",
  );
  await click(button("Nieuwste versie ernaast"));
  assert.ok(
    element(".writing-reference").textContent.includes("Tekst verstuurd"),
  );
  assert.equal(
    element(".writing-section textarea").value,
    "Verder getypt tijdens opslaan",
  );
  window.confirm = () => false;
  await click(button("Verder met deze opgeslagen versie"));
  assert.equal(
    element(".writing-section textarea").value,
    "Verder getypt tijdens opslaan",
  );
  conflict = false;
  await click(button("Sluiten", element(".writing-reference")));
  await click(button("Tekst opslaan"));
  assert.equal(element(".writing-save-status").textContent, "Opgeslagen");
  await settle();
});

test("Notes navigation preserves search, list position and drafts; menus dismiss with Escape", async () => {
  await click(button("‹ Terug naar lijst"));
  const list = element(".writing-list");
  const previousRects = list.getClientRects;
  list.getClientRects = () => [{ width: 300, height: 500 }];
  await input(element('input[type="search"]'), "gedachte");
  await settle();
  list.scrollTop = 320;
  await act(async () => list.dispatchEvent(new window.Event("scroll")));
  const currentKey = "note:10000000-0000-4000-8000-000000000003";
  await click(button("Een nieuwe gedachte", list));
  assert.equal(element(".writing-workspace").dataset.detail, "true");
  await input(
    element(".writing-section textarea"),
    "Verder schrijven na teruggaan",
  );
  await click(button("‹ Terug naar lijst"));
  assert.equal(element(".writing-workspace").dataset.detail, "false");
  assert.equal(element('input[type="search"]').value, "gedachte");
  assert.equal(element(".writing-list"), list);
  assert.equal(list.scrollTop, 320);
  await click(button("Een nieuwe gedachte •", list));
  assert.equal(
    element(".writing-section textarea").value,
    "Verder schrijven na teruggaan",
  );
  const menu = element(".writing-document-menu");
  await click(menu.querySelector("summary"));
  assert.equal(menu.open, true);
  await act(async () =>
    menu.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(menu.open, false);
  assert.equal(document.activeElement, menu.querySelector("summary"));
  assert.equal(
    backend.get(currentKey).sections[0].body,
    "Verder getypt tijdens opslaan",
  );
  await click(button("Tekst opslaan"));
  list.getClientRects = previousRects;
});

test("all tab close leaves original documents available; collection membership stores references only", async () => {
  await click(button("‹ Terug naar lijst"));
  await click(element(".writing-folders > summary"));
  await click(element(".writing-add > summary"));
  await input(element(".writing-add input"), "Mijn collectie");
  await submit(element(".writing-add form"));
  await click(element(".writing-document-menu > summary"));
  await click(element(".writing-organize > summary"));
  await click(element(".writing-memberships input"));
  await settle(600);
  const c = spaceWrites.at(-1).state.collections.at(-1);
  assert.equal(c.name, "Mijn collectie");
  assert.deepEqual(c.items, ["note:10000000-0000-4000-8000-000000000003"]);
  while (container.querySelector(".writing-tab button[aria-label]"))
    await click(container.querySelector(".writing-tab button[aria-label]"));
  assert.ok(element(".writing-document").textContent.includes("Open een stuk"));
  assert.equal(backend.size, 3);
});
