import {test,after} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import ts from 'typescript';import {JSDOM} from 'jsdom';
const dom=new JSDOM('<div id="root"></div>',{url:'https://meridian.test/admin/werkplek'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,HTMLInputElement:dom.window.HTMLInputElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};window.confirm=()=>true;
const React=await import('react'),{createRoot}=await import('react-dom/client'),{act}=React;const require=createRequire(import.meta.url);
const id='10000000-0000-4000-8000-000000000001';
const settings={selected:true,slug:'eerste',seo_title:'Eigen SEO',description:'Bestaande beschrijving',indexable:true,canonical:'self',featured:true,position:'main'};
let context,saveFailure=false,publishFailure=false,uploadFailure=false,finishUpload,calls=[];
function reset(){calls=[];saveFailure=false;publishFailure=false;uploadFailure=false;context={content_id:id,version:4,config:{tags:['bewaren'],relations:[],sites:{meridian:{...settings},avera:{...settings,selected:false}},hero_image:'https://example.test/old.jpg',image_alt:''},sites:[{id:'meridian',label:'Meridian',origin:'https://meridian.test'},{id:'avera',label:'Amparis',origin:'https://amparis.test'}],can_set_origin:false,reports:[],editions:[],backlinks:[]};}
reset();
const actions={loadPublishingContext:async()=>({ok:true,value:structuredClone(context)}),savePublishingConfig:async(_,version,config)=>{calls.push(['save',version]);if(saveFailure)return {ok:false,message:'Instellingen gewijzigd door een ander.'};context={...context,version:version+1,config:structuredClone(config)};return {ok:true,value:context.version};},publishSharedArticle:async input=>{calls.push(['publish',input]);return publishFailure?{ok:false,message:'De tekst is intussen gewijzigd.'}:{ok:true,value:{revision_id:'release'}};}};
const storage={upload:async()=>{calls.push(['upload']);await new Promise(resolve=>{finishUpload=resolve;});return {error:uploadFailure?{message:'offline'}:null};},getPublicUrl:()=>({data:{publicUrl:'https://storage.test/new.jpg'}})};
function load(file,cache=new Map()){if(cache.has(file))return cache.get(file);const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;function local(name){if(name==='@/app/admin/publishing-actions')return actions;if(name==='@/app/admin/content/workspace-actions')return {loadWritingDocument:async()=>({ok:true,value:{revision:'latest-saved-form'}})};if(name==='@/lib/supabase/client')return {createClient:()=>({auth:{getUser:async()=>({data:{user:{id}},error:null})},storage:{from:()=>storage}})};if(name==='@/lib/admin/article-image')return {ARTICLE_IMAGE_BUCKET:'article-images',prepareArticleImage:async()=>({blob:new Blob(['jpg']),format:{mime:'image/jpeg',extension:'jpg'}})};if(name.endsWith('.css'))return {};if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(file),name);return load([base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile()),cache);}return require(name);}new Function('require','module','exports',source)(local,mod,mod.exports);cache.set(file,mod.exports);return mod.exports;}
const Quick=load(path.resolve('src/components/admin/publishing/QuickPublish.tsx')).default;
const ImageField=load(path.resolve('src/components/admin/publishing/ArticleImageField.tsx')).default;
const root=createRoot(document.getElementById('root'));
after(async()=>{await act(async()=>root.unmount());dom.window.close();});
const button=text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert.ok(b,text);return b;};
const click=async b=>act(async()=>b.click());
const input=async(el,value)=>act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));});
async function mount(dirty=false){await act(async()=>root.render(null));reset();await act(async()=>root.render(React.createElement(Quick,{id,revision:'my-saved-revision',dirty})));await click(button('Publiceren'));}
const altInput=()=>[...document.querySelectorAll('label')].find(l=>l.textContent.startsWith('Beschrijving van de afbeelding')).querySelector('input');
test('one explicit click saves the image/settings then publishes only the selected site using the new config version',async()=>{
 await mount();await input(altInput(),'Een nieuwe foto');await click(button('Publiceer op Meridian'));
 assert.deepEqual(calls.map(c=>c[0]),['save','publish']);assert.equal(calls[1][1].version,5);assert.equal(calls[1][1].revision,'my-saved-revision');assert.deepEqual(calls[1][1].sites,['meridian']);
 assert.deepEqual(context.config.tags,['bewaren']);assert.equal(context.config.sites.meridian.seo_title,'Eigen SEO');assert.equal(context.config.sites.meridian.featured,true);
});
test('saving a draft never publishes',async()=>{await mount();await input(altInput(),'Conceptfoto');await click(button('Als concept opslaan'));assert.deepEqual(calls.map(c=>c[0]),['save']);});
test('an unsaved article blocks publishing',async()=>{await mount(true);assert.equal(button('Publiceer op Meridian').disabled,true);await click(button('Publiceer op Meridian'));assert.equal(calls.length,0);});
test('a settings conflict stops publishing and retains entered text',async()=>{await mount();saveFailure=true;await input(altInput(),'Niet kwijtraken');await click(button('Publiceer op Meridian'));assert.deepEqual(calls.map(c=>c[0]),['save']);assert.equal(altInput().value,'Niet kwijtraken');assert.match(document.querySelector('[role="alert"]').textContent,/ander/);});
test('a publish conflict retains already-saved settings and never substitutes a newer article revision',async()=>{await mount();publishFailure=true;await input(altInput(),'Bewaren');await click(button('Publiceer op Meridian'));assert.equal(calls[1][1].revision,'my-saved-revision');assert.equal(altInput().value,'Bewaren');assert.equal(button('Als concept opslaan').disabled,true);});
test('upload in progress blocks publication and failure keeps the previous image',async()=>{
 await mount();uploadFailure=true;const fileInput=document.querySelector('input[type="file"]');Object.defineProperty(fileInput,'files',{value:[new File(['bytes'],'test.JPG',{type:'image/jpeg'})],configurable:true});
 await act(async()=>fileInput.dispatchEvent(new window.Event('change',{bubbles:true})));assert.equal(button('Publiceer op Meridian').disabled,true);
 await act(async()=>finishUpload());assert.equal(document.querySelector('.article-image-preview img').getAttribute('src'),'https://example.test/old.jpg');assert.match(document.querySelector('.article-image-error').textContent,/niet gelukt/);
});
test('native form submission cannot race an unfinished upload; only successful uploads replace the field',async()=>{
 await act(async()=>root.render(null));reset();let submitted=0;
 await act(async()=>root.render(React.createElement('form',{onSubmit:e=>{e.preventDefault();submitted++;}},React.createElement(ImageField,{name:'hero_image',defaultValue:'https://example.test/old.jpg'}))));
 const fileInput=document.querySelector('input[type="file"]');Object.defineProperty(fileInput,'files',{value:[new File(['bytes'],'test.jpg',{type:'image/jpeg'})],configurable:true});
 await act(async()=>fileInput.dispatchEvent(new window.Event('change',{bubbles:true})));
 await act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(submitted,0);
 await act(async()=>finishUpload());assert.equal(document.querySelector('input[name="hero_image"]').value,'https://storage.test/new.jpg');
 await act(async()=>document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(submitted,1);
});
