import {test,after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import ts from 'typescript';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<div id="root"></div>',{url:'https://meridian.test/admin/werkplek'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,HTMLInputElement:dom.window.HTMLInputElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'));};window.confirm=()=>true;
const React=await import('react'),{createRoot}=await import('react-dom/client'),{act}=React;const require=createRequire(import.meta.url);
const id='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002';
const settings={selected:true,slug:'eerste',seo_title:'',description:'',indexable:true,canonical:'self',featured:false,position:'side'};
let context={content_id:id,version:0,config:{tags:[],relations:[],sites:{meridian:{...settings},avera:{...settings,selected:false}},hero_image:'',image_alt:''},sites:[{id:'meridian',label:'Meridian',origin:'https://meridian.test'},{id:'avera',label:'Avera',origin:'https://avera.test'}],can_set_origin:false,reports:[],editions:[],backlinks:[]};
const publications=[],insertions=[];
const actions={loadPublishingContext:async()=>({ok:true,value:structuredClone(context)}),searchPublishingArticles:async()=>({ok:true,value:[{id:other,title:'Ander artikel',content_type:'article',sections:[]}]}),savePublishingConfig:async(_,version,config)=>{assert.equal(version,context.version);context={...context,version:version+1,config:structuredClone(config)};return {ok:true,value:context.version};},publishSharedArticle:async input=>{publications.push(input);return {ok:true,value:{revision_id:'release'}};},changePublishingReport:async()=>({ok:false,message:'unused'}),setPublishingOrigin:async()=>({ok:true,value:null}),withdrawSharedArticle:async()=>({ok:true,value:null})};
function load(file,cache=new Map()){if(cache.has(file))return cache.get(file);const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;function local(name){if(name==='@/app/admin/publishing-actions')return actions;if(name.endsWith('.css'))return {};if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(file),name);const actual=[base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());return load(actual,cache);}return require(name);}new Function('require','module','exports',source)(local,mod,mod.exports);cache.set(file,mod.exports);return mod.exports;}
const Panel=load(path.resolve('src/components/admin/publishing/PublishingPanel.tsx')).default,root=createRoot(document.getElementById('root'));
after(async()=>{await act(async()=>root.unmount());dom.window.close();});
const button=text=>{const found=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert.ok(found,text);return found;};
const click=async b=>act(async()=>b.click());const wait=async()=>act(async()=>new Promise(resolve=>setTimeout(resolve,350)));
const input=async(el,value)=>act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));});
test('real panel saves internal settings without publishing; each publication needs an explicit choice',async()=>{
 await act(async()=>root.render(React.createElement(Panel,{id,revision:'saved-revision',dirty:false})));
 await click(button('Structuur & publicatie'));await click(button('Tags'));
 await input(document.querySelector('.pub-panel-content input'),'Interne tag');await click(button('Tag toevoegen'));assert.equal(publications.length,0);
 await click(button('Instellingen opslaan'));assert.deepEqual(context.config.tags,['Interne tag']);assert.equal(publications.length,0);
 await click(button('Publiceren & SEO'));const avera=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Publiceren op Avera')).querySelector('input');await click(avera);
 assert.equal(button('Publiceer geselecteerde websites').disabled,true);await click(button('Instellingen opslaan'));await click(button('Publiceer geselecteerde websites'));
 assert.deepEqual(publications[0].sites,['meridian','avera']);assert.equal(publications[0].revision,'saved-revision');
});
test('unsaved article text blocks release but not non-public organization',async()=>{
 await act(async()=>root.render(React.createElement(Panel,{id,revision:'saved-revision',dirty:true})));
 assert.equal(button('Publiceer geselecteerde websites').disabled,true);assert.equal(publications.length,1);
 await click(document.querySelector('[aria-label="Zijpaneel sluiten"]'));
});
test('link picker searches saved articles and returns IDs, not copied text or guessed URLs',async()=>{
 await act(async()=>root.render(React.createElement(Panel,{id,revision:'saved',dirty:false,selection:{sectionId:id,start:0,end:4,text:'Lees'},onInsert:(target,anchor)=>insertions.push({target,anchor})})));
 await click(button('Verwijzen'));await wait();await click(button('Ander artikel'));await click(button('Link invoegen in de tekst'));
 assert.equal(insertions[0].target.id,other);assert.equal(document.querySelector('dialog').hasAttribute('open'),false);
});
