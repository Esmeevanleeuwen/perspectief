import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url), base=path.resolve(import.meta.dirname,'..');
function load(relative,mocks={},cache=new Map()) {
  const file=path.resolve(base,relative);
  if(cache.has(file)) return cache.get(file);
  if(file.endsWith('.json')) return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};
  const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'), {fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}});
  assert.equal((compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,file);
  function local(name){
    if(Object.hasOwn(mocks,name)) return mocks[name];
    if(name==='server-only'||name.endsWith('.css')) return {};
    if(name==='next/link') return ({children,...props})=>React.createElement('a',props,children);
    if(name.startsWith('.')||name.startsWith('@/')) {
      const location=name.startsWith('@/')?path.join(base,'src',name.slice(2)):path.resolve(path.dirname(file),name);
      const next=[location,location+'.ts',location+'.tsx',location+'.json'].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());
      if(!next) throw Error('Missing '+location);
      return load(next,mocks,cache);
    }
    return require(name);
  }
  new Function('require','module','exports',compiled.outputText)(local,mod,mod.exports);
  cache.set(file,mod.exports);return mod.exports;
}
const d=load('src/lib/publishing/discovery.ts'), seo=load('src/lib/publishing/seo.ts');
const origin='https://meridiancollective.nl';
const fixture=()=>({id:'10000000-0000-4000-8000-000000000001',slug:'test-artikel',title:'Titel & uitleg',summary:'Een openbare samenvatting.',subtitle:null,status:'published',platform:'meridian',origin,canonical_url:null,published_at:'2026-09-21T10:00:00Z',updated_at:'2026-09-21T10:05:00Z',hero_image:'/test.jpg',image_alt:'Een foto',report:null,targets:{},metadata:{private_secret:'MUST NOT LEAK'},seo:{indexable:true,description:'',seo_title:''},content_sections:[{id:'s1',title:'Kop',body:'Gepubliceerde tekst.',position:0,section_type:'paragraph',data:{}}]});
test('discovery excludes drafts, noindex, unsafe slugs, absent origins and other canonicals',()=>{
 const item=fixture(); assert.equal(d.discoveryUrl(item),origin+'/artikelen/test-artikel');
 for(const change of [{status:'draft'},{status:'archived'},{seo:{...item.seo,indexable:false}},{slug:'../admin'},{origin:'http://local.test'},{origin:null},{canonical_url:'https://www.amparis.nl/artikelen/test-artikel'}]) assert.equal(d.discoveryUrl({...item,...change}),null);
});
test('manual SEO description wins and is not silently rewritten or shortened',()=>{
 const item=fixture();item.seo.description='Eigen '+('lange omschrijving '.repeat(22));assert.equal(d.articleDescription(item),item.seo.description.trim());
});
test('fallback descriptions use public text, collapse whitespace and stop at a word boundary',()=>{
 const item=fixture();item.summary='Een uitleg over de onderlinge samenhang. '.repeat(20);const value=d.articleDescription(item);
 assert.ok(value.length<=180);assert.ok(value.endsWith('…'));assert.ok(item.summary.includes(value.slice(0,-1)+' '));
 item.summary='';item.subtitle='Kort\n  ondertitel';assert.equal(d.articleDescription(item),'Kort ondertitel');
 item.subtitle=null;assert.equal(d.articleDescription(item),'Gepubliceerde tekst.');
 item.content_sections=[];assert.equal(d.articleDescription(item),item.title);
});
test('images become absolute and reject script URLs, credentials and protocol-relative URLs',()=>{
 assert.equal(d.articleImageUrl(fixture()),origin+'/test.jpg');
 for(const hero_image of ['javascript:alert(1)','//evil.test/a.jpg','https://secret:pass@evil.test/x']) assert.equal(d.articleImageUrl({...fixture(),hero_image}),null);
});
test('sitemap uses released lastmod and image extension, excludes private fields and nonindexable URLs',()=>{
 const item=fixture();item.hero_image='https://images.example.test/a.jpg?x=1&y=2';const xml=d.articleSitemap([item,{...item,slug:'draft-only',status:'draft'}]);
 assert.match(xml,/<lastmod>2026-09-21T10:05:00Z<\/lastmod>/);assert.match(xml,/image:loc/);assert.match(xml,/&amp;y=2/);assert.doesNotMatch(xml,/MUST NOT LEAK|draft-only/);
});
test('RSS uses stable IDs and actual publication dates; only recent eligible articles appear',()=>{
 const item=fixture();const other={...fixture(),id:'other',slug:'hidden',seo:{indexable:false}};
 const xml=d.articleFeed([item,other,{...item,slug:'other-host',origin:'https://other.example.test'}],origin);
 assert.match(xml,/Titel &amp; uitleg/);assert.match(xml,/urn:uuid:10000000/);assert.match(xml,/21 Sep 2026 10:00:00 GMT/);
 assert.doesNotMatch(xml,/MUST NOT LEAK|other-host|hidden/);
});
test('invalid dates never produce Invalid Date or invented timestamps in feeds',()=>{
 const item={...fixture(),published_at:'nonsense',updated_at:'nonsense'};const xml=d.articleFeed([item],origin)+d.articleSitemap([item]);
 assert.doesNotMatch(xml,/Invalid Date|<lastmod>|<pubDate>|<lastBuildDate>/);
});
test('XML text is escaped and unsupported controls removed',()=>{
 assert.equal(d.xmlText('<x a="1">&\u0001\' >'),'&lt;x a=&quot;1&quot;&gt;&amp;&apos; &gt;');
});
test('Article and breadcrumbs describe real visible fields without manufacturing authors',()=>{
 const item=fixture();item.report={title:'Verslag',slug:'verslag'};
 const data=seo.articleStructuredData(item), crumbs=seo.articleBreadcrumbData(item);
 assert.equal(data['@type'],'Article');assert.equal(data.author,undefined);assert.equal(data.datePublished,item.published_at);assert.equal(data.dateModified,item.updated_at);
 assert.deepEqual(crumbs.itemListElement.map(x=>x.name),['Meridian','Artikelen','Verslag',item.title]);assert.doesNotMatch(JSON.stringify(data),/private_secret/);
});
test('preview remains noindex while production advertises canonical, RSS and large images',()=>{
 const previous=process.env.VERCEL_ENV;
 try {process.env.VERCEL_ENV='preview';assert.equal(seo.articleMetadata(fixture()).robots.index,false);
 process.env.VERCEL_ENV='production';const metadata=seo.articleMetadata(fixture());assert.equal(metadata.robots.index,true);assert.equal(metadata.robots.googleBot['max-image-preview'],'large');assert.equal(metadata.alternates.types['application/rss+xml'],origin+'/feed.xml');}
 finally{if(previous===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=previous;}
});
test('plain source links preserve original text and trailing punctuation',()=>{
 const {sourceLinks}=load('src/lib/publishing/discovery-links.ts');const value='Bron (https://example.test/pagina). En https://x.test/a?x=1&y=2';const parts=sourceLinks(value);
 assert.equal(parts.map(x=>x.text).join(''),value);assert.equal(parts.filter(x=>x.href)[0].href,'https://example.test/pagina');
 assert.equal(sourceLinks('https://user:pass@example.test/x').find(x=>x.href),undefined);
});
test('React renderer escapes text and keeps existing markdown and content-ID links intact',()=>{
 const Linked=load('src/components/publishing/LinkedText.tsx').default,id=fixture().id;
 const html=renderToStaticMarkup(React.createElement(Linked,{text:`<script>alert(1)</script> https://example.test [Verder](content:${id})`,targets:{[id]:{href:'/artikelen/vervolg',sections:[],title:'Vervolg'}}}));
 assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/href="https:\/\/example.test\/"/);assert.match(html,/href="\/artikelen\/vervolg"/);
});
async function notifyHarness(env,items,fail=false){
 const old=process.env.VERCEL_ENV,original=globalThis.fetch,info=console.info,warn=console.warn;let callbacks=[],requests=[];
 process.env.VERCEL_ENV=env;console.info=()=>{};console.warn=()=>{};globalThis.fetch=async(url,options)=>{requests.push({url,...options});if(fail)throw Error('offline');return {status:202};};
 try {const n=load('src/lib/publishing/discovery-notify.ts',{'next/server':{after:callback=>callbacks.push(callback)},'./public':{readCatalogAll:async()=>items}});n.queueDiscoveryNotice(fixture().id);for(const callback of callbacks)await callback();return {requests,callbacks:callbacks.length};}
 finally{globalThis.fetch=original;console.info=info;console.warn=warn;if(old===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=old;}
}
test('no notification runs on previews',async()=>{const r=await notifyHarness('preview',[fixture()]);assert.equal(r.callbacks,0);assert.equal(r.requests.length,0);});
test('production notification contains only an allowed public URL and public protocol key',async()=>{
 const r=await notifyHarness('production',[fixture()]);assert.equal(r.requests.length,1);assert.equal(r.requests[0].url,'https://api.indexnow.org/indexnow');
 const body=JSON.parse(r.requests[0].body);assert.deepEqual(body.urlList,[origin+'/artikelen/test-artikel']);assert.doesNotMatch(r.requests[0].body,/private_secret|MUST NOT LEAK|author_id|session/);
});
test('notification skips drafts and never throws a transport error into successful publication',async()=>{
 assert.equal((await notifyHarness('production',[{...fixture(),status:'draft'}])).requests.length,0);
 assert.equal((await notifyHarness('production',[fixture()],true)).requests.length,1);
});
test('RSS and sitemap route wrappers read only the public projection',async()=>{
 const mocks={'@/lib/publishing/public':{readCatalogAll:async()=>[fixture()]},'@/lib/dossier-platforms':{absoluteUrl:x=>origin+x,isPreview:false}};
 const sitemap=await load('src/app/artikelen/sitemap.xml/route.ts',mocks).GET(),feed=await load('src/app/feed.xml/route.ts',mocks).GET();
 assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);assert.match(await sitemap.text(),/test-artikel/);assert.match(await feed.text(),/<rss/);
});
test('discovery endpoints are disabled on preview',async()=>{
 const mocks={'@/lib/publishing/public':{readCatalogAll:async()=>{throw Error('must not read');}},'@/lib/dossier-platforms':{absoluteUrl:x=>origin+x,isPreview:true}};
 for(const file of ['src/app/artikelen/sitemap.xml/route.ts','src/app/feed.xml/route.ts'])assert.equal((await load(file,mocks).GET()).status,404);
});
test('recent articles are crawlable without manually featured status',async()=>{
 const item=fixture();item.featured=false;const Recent=load('src/components/publishing/RecentArticles.tsx',{'@/lib/publishing/public':{readCatalogAll:async()=>[item]}}).default;
 const html=renderToStaticMarkup(await Recent());assert.match(html,/Net gepubliceerd/);assert.match(html,/href="\/artikelen\/test-artikel"/);
});
test('publish action notifies only a successfully released Meridian edition',async()=>{
 const notices=[],paths=[];let failed=false;
 const actions=load('src/app/admin/publishing-actions.ts',{
  '@/lib/admin/roles':{requireEditorialUser:async()=>({supabase:{rpc:async()=>failed?{data:null,error:{code:'40001'}}:{data:{revision_id:'released'},error:null}}})},
  '@/lib/publishing/discovery-notify':{queueDiscoveryNotice:id=>notices.push(id)},
  'next/cache':{revalidatePath:path=>paths.push(path),updateTag:()=>{}},
 });
 const input={id:fixture().id,sites:['meridian'],version:1,revision:'saved',reportVersion:null};
 failed=true;assert.equal((await actions.publishSharedArticle(input)).ok,false);assert.deepEqual(notices,[]);assert.deepEqual(paths,[]);
 failed=false;assert.equal((await actions.publishSharedArticle({...input,sites:['avera']})).ok,true);assert.deepEqual(notices,[]);
 assert.equal((await actions.publishSharedArticle(input)).ok,true);assert.deepEqual(notices,[input.id]);assert.ok(paths.includes('/feed.xml'));assert.ok(paths.includes('/artikelen/sitemap.xml'));
});
