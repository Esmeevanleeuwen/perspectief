import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
const dom=new JSDOM('<div id="root"></div>',{url:'https://meridian.test/admin/content?status=draft&page=2'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const React=await import('react'),{act}=React,{createRoot}=await import('react-dom/client');
const require=createRequire(import.meta.url),root=createRoot(document.getElementById('root'));
const id='10000000-0000-4000-8000-000000000001',stamp='2026-09-21T12:00:00.123456+00:00';
const item={id,title:'Een artikel',slug:'een-artikel',type:'article',status:'draft',placement:{featured:false,position:null},updatedAt:stamp,canChangeStatus:true};
let calls=[],refreshes=0,publishProps=[],confirmations=[],confirm=true,implementation;
const success=status=>({ok:true,value:{confirmation_required:false,status,updated_at:'2026-09-21T12:01:00.234567+00:00'}});
const actions={changePublicationStatus:async input=>{calls.push(input);return implementation(input);}};
const router={refresh:()=>{refreshes++;},push:()=>assert.fail('Must not discard active list filters')};
window.confirm=message=>{confirmations.push(message);return confirm;};
function load(relative,mocks={},cache=new Map()) {
 const file=path.resolve(relative);if(cache.has(file))return cache.get(file);const mod={exports:{}};
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 function local(name){if(Object.hasOwn(mocks,name))return mocks[name];if(name.endsWith('.css'))return {};if(name==='@/app/admin/content/status-actions')return actions;if(name==='next/navigation')return {useRouter:()=>router};if(name==='@/components/admin/publishing/QuickPublish')return {__esModule:true,default:props=>{publishProps.push(props);return React.createElement('button',{onClick:()=>props.onReload?.()},'Publiceren');}};
 if(name.startsWith('.')||name.startsWith('@/')){const base=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(file),name);const actual=[base,base+'.ts',base+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());return load(actual,mocks,cache);}return require(name);}
 new Function('require','module','exports',source)(local,mod,mod.exports);cache.set(file,mod.exports);return mod.exports;
}
const Status=load('src/components/admin/publications/PublicationStatus.tsx').default;
let generation=0;
async function mount(overrides={}){calls=[];refreshes=0;publishProps=[];confirmations=[];confirm=true;implementation=async input=>success(input.status);await act(async()=>root.render(React.createElement(Status,{key:++generation,item:{...item,...overrides}})));}
const button=text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert.ok(b,text);return b;};
const click=async b=>act(async()=>b.click());
const choose=async value=>act(async()=>{const field=document.querySelector('select');field.value=value;field.dispatchEvent(new window.Event('change',{bubbles:true}));});
after(async()=>{await act(async()=>root.unmount());dom.window.close();});

test('the real status control saves only after explicit submission and preserves list navigation',async()=>{
 await mount();assert.equal(document.querySelector('label').textContent,'Status van Een artikel');assert.equal(document.querySelectorAll('option').length,8);
 await choose('source_check');assert.equal(calls.length,0);await click(button('Opslaan'));
 assert.deepEqual(calls[0],{id,status:'source_check',updatedAt:stamp});assert.equal(refreshes,1);assert.equal(document.querySelector('select').value,'source_check');assert.match(document.body.textContent,/Status opgeslagen/);
 assert.equal(window.location.search,'?status=draft&page=2');
});
test('errors keep the chosen value visible and a conflict requires refreshing before retry',async()=>{
 await mount();implementation=async()=>({ok:false,conflict:true,message:'Intussen gewijzigd.'});await choose('ready');await click(button('Opslaan'));
 assert.equal(document.querySelector('select').value,'ready');assert.match(document.querySelector('[role="alert"]').textContent,/Intussen/);assert.equal(button('Opslaan').disabled,true);
 assert.equal(refreshes,0);await click(button('Ververs overzicht'));assert.equal(refreshes,1);
});
test('going offline can be cancelled and only an explicit confirmation permits the second call',async()=>{
 await mount({status:'published'});implementation=async input=>input.confirmed?success(input.status):({ok:true,value:{confirmation_required:true,action:'withdraw',sites:['meridian','avera']}});
 await choose('draft');confirm=false;await click(button('Opslaan'));assert.equal(calls.length,1);assert.equal(refreshes,0);assert.match(confirmations[0],/Meridian en Amparis/);
 confirm=true;await click(button('Opslaan'));assert.equal(calls.length,3);assert.equal(calls[2].confirmed,true);assert.equal(calls[2].updatedAt,stamp);assert.equal(refreshes,1);
});
test('shared articles delegate publishing to the existing site-selection dialog, never a raw status write',async()=>{
 await mount();await choose('published');assert.ok(button('Publiceren'));assert.equal(calls.length,0);assert.equal(publishProps.at(-1).refreshRevisionOnOpen,true);assert.equal(publishProps.at(-1).id,id);
 await click(button('Publiceren'));assert.equal(calls.length,0);assert.equal(refreshes,1);
});
test('research publishing also needs confirmation',async()=>{
 await mount({type:'research'});implementation=async input=>input.confirmed?success('published'):({ok:true,value:{confirmation_required:true,action:'publish',sites:['meridian']}});
 await choose('published');await click(button('Opslaan'));assert.equal(publishProps.length,0);assert.match(confirmations[0],/publiceren op Meridian/);assert.equal(calls[1].confirmed,true);
});
test('pending requests disable controls and a double click cannot submit twice',async()=>{
 await mount();let release;implementation=()=>new Promise(resolve=>{release=resolve;});await choose('ready');
 await act(async()=>{const b=button('Opslaan');b.click();b.click();});assert.equal(calls.length,1);assert.equal(document.querySelector('select').disabled,true);
 await act(async()=>release(success('ready')));assert.equal(refreshes,1);assert.equal(document.querySelector('select').disabled,false);
});
test('transport failures are shown without a success message',async()=>{
 await mount();implementation=async()=>{throw new Error('network');};await choose('archived');await click(button('Opslaan'));assert.ok(document.querySelector('[role="alert"]'));assert.equal(refreshes,0);assert.equal(document.querySelector('select').disabled,false);
});
test('server action validates input, checks access, preserves timestamp precision, and only invalidates on success',async()=>{
 let auth=0,rpcs=[],tags=[],paths=[],result={data:{confirmation_required:true,action:'withdraw',sites:['meridian']},error:null};
 const change=load('src/app/admin/content/status-actions.ts',{
 '@/lib/admin/roles':{requireEditorialUser:async()=>{auth++;return {supabase:{rpc:async(name,args)=>{rpcs.push({name,args});return result;}}};}},
 'next/cache':{updateTag:t=>tags.push(t),revalidatePath:p=>paths.push(p)},
 }).changePublicationStatus;
 for(const input of [null,{id:'bad',status:'draft',updatedAt:stamp},{id,status:'bad',updatedAt:stamp},{id,status:'ready',updatedAt:stamp,confirmed:'true'}]) assert.equal((await change(input)).ok,false);
 assert.equal(auth,4);assert.equal(rpcs.length,0);
 await change({id,status:'draft',updatedAt:stamp});assert.equal(rpcs[0].args.p_updated_at,stamp);assert.equal(rpcs[0].args.p_confirmed,false);assert.equal(tags.length,0);
 result={data:{confirmation_required:false,status:'draft',updated_at:stamp},error:null};assert.equal((await change({id,status:'draft',updatedAt:stamp,confirmed:true})).ok,true);assert.ok(tags.length>=2);assert.ok(paths.includes('/admin/content'));
 result={data:null,error:{code:'42501',message:'SECRET INTERNAL DETAIL'}};const denied=await change({id,status:'ready',updatedAt:stamp});assert.equal(denied.ok,false);assert.doesNotMatch(denied.message,/SECRET/);
 result={data:null,error:{code:'40001',message:'conflict'}};assert.equal((await change({id,status:'ready',updatedAt:stamp})).conflict,true);
});
