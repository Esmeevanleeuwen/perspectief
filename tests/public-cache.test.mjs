import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");

// Run the real TypeScript and Supabase query builder, replacing only server
// boundaries (React request memoization, Next invalidation, auth and HTTP).
function loadSource(entry, overrides = {}, loaded = new Map()) {
  const filename = path.join(root, entry);
  if (loaded.has(filename)) return loaded.get(filename);
  const exports = {};
  loaded.set(filename, exports);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier in overrides) return overrides[specifier];
    if (specifier === "server-only") return {};
    if (specifier === "react") return { cache: (fn) => fn };
    if (specifier.startsWith("@/")) {
      return loadSource(`src/${specifier.slice(2)}.ts`, overrides, loaded);
    }
    if (specifier.startsWith(".")) {
      return loadSource(path.relative(root, path.resolve(path.dirname(filename), `${specifier}.ts`)), overrides, loaded);
    }
    return require(specifier);
  };
  new Function("require", "exports", compiled)(localRequire, exports);
  return exports;
}

const { PUBLIC_CONTENT_CACHE_TAG, DOSSIER_CACHE_TAG } = loadSource("src/lib/public-cache.ts");

test("public reads use an anonymous shared cache and only request published content", async () => {
  const savedFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  const requests = [];
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.test";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "must-never-be-used";
  globalThis.fetch = async (input, init) => {
    requests.push({ url: new URL(String(input)), init });
    return Response.json([]);
  };
  try {
    const content = loadSource("src/lib/admin/content.ts");
    await content.getPublishedArticles();
    await content.getPublishedResearch();
    await content.getPublishedContentBySlug("voorbeeld");
    assert.equal(requests.length, 3);
    for (const { url, init } of requests) {
      const headers = new Headers(init.headers);
      assert.equal(url.searchParams.get("status"), "eq.published");
      assert.equal(init.cache, "force-cache");
      assert.equal(init.next.revalidate, 300);
      assert.deepEqual(init.next.tags, [PUBLIC_CONTENT_CACHE_TAG]);
      assert.equal(headers.get("Authorization"), "Bearer public-test-key");
      assert.equal(headers.get("Cookie"), null);
    }
  } finally {
    globalThis.fetch = savedFetch;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
  }
});

test("article relationships use one filtered query, retain metadata and never fan out", async () => {
  const savedFetch = globalThis.fetch;
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const savedKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.test";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  const requests = [];
  let rows = [{
    title: "Eigen titel", summary: "Eigen samenvatting", status_label: "In onderzoek",
    state: "published", indexable: true, updated_at: "2026-09-12T00:00:00Z",
    article_links: [{ href: "/artikelen/prestatiedruk", title: "Artikel" }],
    core: { id: "core-id", slug: "test-dossier", title: "Kerntitel", themes: ["Onderwijs"],
      views: [{ platform: "meridian", state: "published" }, { platform: "ampara", state: "published" }] },
  }];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: new URL(String(input)), init });
    return Response.json(rows);
  };
  try {
    const { getArticleDossiers } = loadSource("src/lib/dossier-network.ts");
    const result = await getArticleDossiers("prestatiedruk");
    assert.equal(requests.length, 1);
    const { url, init } = requests[0];
    assert.equal(url.pathname, "/rest/v1/dossier_presentations");
    assert.equal(url.searchParams.get("platform"), "eq.meridian");
    assert.equal(url.searchParams.get("state"), "eq.published");
    assert.equal(url.searchParams.get("core.visibility"), "eq.public");
    assert.equal(url.searchParams.get("core.views.state"), "eq.published");
    assert.deepEqual(JSON.parse(url.searchParams.get("article_links").slice(3)), [{ href: "/artikelen/prestatiedruk" }]);
    assert.ok(url.searchParams.get("select").includes("dossier_core_records!inner"));
    assert.deepEqual(init.next.tags, [DOSSIER_CACHE_TAG]);
    assert.equal(result[0].title, "Eigen titel");
    assert.equal(result[0].coreTitle, "Kerntitel");
    assert.deepEqual(result[0].availableOn, ["meridian", "ampara"]);
    assert.deepEqual(result[0].themes, ["Onderwijs"]);

    rows = [];
    assert.deepEqual(await getArticleDossiers("prestatiedruk"), []);
    assert.equal(requests.length, 2, "empty results must not fetch the catalogue or revive local links");
    assert.deepEqual(await getArticleDossiers("../private"), []);
    assert.equal(requests.length, 2, "invalid slugs must not make requests");

    globalThis.fetch = async () => { requests.push({ failed: true }); return Response.json({ message: "Permission denied" }, { status: 403 }); };
    await getArticleDossiers("prestatiedruk");
    assert.equal(requests.length, 3, "an API error must not recreate the dossier fan-out");
  } finally {
    globalThis.fetch = savedFetch;
    if (savedUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    if (savedKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedKey;
  }
});

test("every CMS mutation immediately expires article and trigger-updated dossier caches", async () => {
  const tags = [];
  const redirect = (url) => { throw new Error(`REDIRECT:${url}`); };
  const supabase = {
    from(table) {
      const result = { data: table === "content_sections"
        ? [{ id: "section-1", position: 10 }, { id: "section-2", position: 20 }]
        : { id: "content-1", slug: "voorbeeld", content_type: "article", metadata: {} }, error: null };
      const chain = new Proxy({}, {
        get(_, key) {
          if (key === "then") return (resolve) => resolve(result);
          if (key === "single" || key === "maybeSingle") {
            return async () => ({ ...result, data: Array.isArray(result.data) ? result.data[0] : result.data });
          }
          return () => chain;
        },
      });
      return chain;
    },
  };
  const actions = loadSource("src/app/admin/actions.ts", {
    "next/cache": { revalidatePath() {}, updateTag: (tag) => tags.push(tag) },
    "next/navigation": { redirect },
    "@/lib/admin/roles": { requireEditorialUser: async () => ({ supabase, user: { id: "editor-id" }, role: "owner" }) },
  });
  for (const name of ["createContent", "createResearch", "updateContent", "publishContent", "deleteContent", "addSection", "updateSection", "deleteSection", "moveSection"]) {
    tags.length = 0;
    const form = new FormData();
    for (const [key, value] of Object.entries({ id: "content-1", content_id: "content-1", section_id: "section-1", title: "Voorbeeld", slug: "voorbeeld", direction: "down" })) form.set(key, value);
    try { await actions[name](form); }
    catch (error) { assert.match(error.message, /^REDIRECT:/); }
    assert.ok(tags.includes(PUBLIC_CONTENT_CACHE_TAG), `${name}: article cache`);
    assert.ok(tags.includes(DOSSIER_CACHE_TAG), `${name}: dossier cache`);
  }
});
