"use client";
import { useEffect, useId, useRef, useState } from "react";
import { changePublishingReport, loadPublishingContext, publishSharedArticle, savePublishingConfig, searchPublishingArticles, setPublishingOrigin, withdrawSharedArticle } from "@/app/admin/publishing-actions";
import { relationLabels, type ArticleChoice, type Platform, type PublishingConfig, type PublishingContext, type Relation, type Selection } from "@/lib/publishing/model";
import type { Result } from "@/lib/admin/writing/model";
import "./publishing.css";
type Tab="chapters"|"links"|"tags"|"publish";
const tabs:[Tab,string][]=[["chapters","Hoofdstukken"],["links","Verwijzingen"],["tags","Tags"],["publish","Publiceren & SEO"]];
export default function PublishingPanel({id,revision,dirty,selection,onInsert,onOpen,onReference,onReload}: {
  id:string;revision:string;dirty:boolean;selection?:Selection|null;
  onInsert?:(target:ArticleChoice,sectionId?:string)=>void;onOpen?:(id:string)=>void;
  onReference?:(id:string)=>void;onReload?:()=>void|Promise<void>;
}) {
  const dialog=useRef<HTMLDialogElement>(null), headingId=useId();
  const [opened,setOpened]=useState(false),[tab,setTab]=useState<Tab>("chapters"),[context,setContext]=useState<PublishingContext|null>(null),[config,setConfig]=useState<PublishingConfig|null>(null),[baseline,setBaseline]=useState("");
  const [loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[error,setError]=useState("");
  const [query,setQuery]=useState(""),[choices,setChoices]=useState<ArticleChoice[]>([]),[target,setTarget]=useState<ArticleChoice|null>(null),[anchor,setAnchor]=useState(""),[kind,setKind]=useState<Relation["kind"]>("related"),[tagValue,setTagValue]=useState(""),[reportTitle,setReportTitle]=useState(""),[reportId,setReportId]=useState(""),[origins,setOrigins]=useState<Partial<Record<Platform,string>>>({});
  const changed=!!config&&JSON.stringify(config)!==baseline;
  const report=context?.reports.find(r=>r.chapters.some(c=>c.id===id));
  async function load() {
    setLoading(true); setError("");
    try { const result=await loadPublishingContext(id); if(!result.ok){setError(result.message);return;} setContext(result.value);setConfig(result.value.config);setBaseline(JSON.stringify(result.value.config)); }
    catch {setError("Instellingen konden niet worden geladen. Probeer opnieuw.");}
    finally {setLoading(false);}
  }
  function show(next:Tab) {setTab(next);setOpened(true);dialog.current?.showModal();void load();}
  function close() {if(changed&&!window.confirm("Niet opgeslagen instellingen sluiten? De artikeltekst blijft behouden."))return;dialog.current?.close();setOpened(false);}
  function openArticle(contentId:string,beside=false){if(changed&&!window.confirm("Niet opgeslagen instellingen sluiten?"))return;dialog.current?.close();setOpened(false);if(beside)onReference?.(contentId);else onOpen?.(contentId);}
  useEffect(()=>{
    if(!opened||tab!=="links")return;
    let cancelled=false;const timer=setTimeout(()=>{
      void searchPublishingArticles(query).then(r=>{if(cancelled)return;if(r.ok)setChoices(r.value.filter(c=>c.id!==id));else setError(r.message);}).catch(()=>{if(!cancelled)setError("Zoeken lukte niet.");});
    },250);return()=>{cancelled=true;clearTimeout(timer);};
  },[query,opened,tab,id]);
  useEffect(()=>{if(!changed)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[changed]);
  async function run<T>(action:()=>Promise<Result<T>>,success:string,after?:(value:T)=>void|Promise<void>) {
    if(busy)return;setBusy(true);setError("");setNotice("");
    try{const r=await action();if(!r.ok){setError(r.message);return;}setNotice(success);await load();await after?.(r.value);}
    catch{setError("De verbinding is onderbroken. Controleer de opgeslagen versie voordat je opnieuw probeert.");}
    finally{setBusy(false);}
  }
  function setSite(site:Platform,field:string,value:string|boolean){setConfig(c=>c?{...c,sites:{...c.sites,[site]:{...c.sites[site],[field]:value}}}:c);}
  function reportChange(action:string,extra:{title?:string;order?:string[];id?:string;report?:string;version?:number}={}){
    if(changed){setError("Sla eerst je instellingen op.");return;}
    void run(()=>changePublishingReport({id,action,report:report?.id,version:report?.version,...extra}),"Verslagstructuur als concept opgeslagen. Publiceer om de leesvolgorde op de gekozen websites bij te werken.",r=>{if(r.new_content_id)openArticle(r.new_content_id);});
  }
  return <>
    <button type="button" className="pub-panel-trigger" onClick={()=>show("chapters")}>Structuur & publicatie</button>
    {onInsert&&<button type="button" className="pub-panel-trigger" onClick={()=>show("links")}>Verwijzen</button>}
    <dialog ref={dialog} className="pub-dialog" aria-labelledby={headingId} onCancel={e=>{e.preventDefault();close();}} onClose={()=>setOpened(false)}>
      <div className="pub-dialog-heading"><h2 id={headingId}>Structuur & publicatie</h2><button type="button" onClick={close} aria-label="Zijpaneel sluiten">×</button></div>
      <nav className="pub-panel-tabs" aria-label="Artikelinstellingen">{tabs.map(([key,label])=><button type="button" key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</nav>
      {error&&<p role="alert" className="pub-error">{error}</p>}{notice&&<p role="status" className="pub-notice">{notice}</p>}
      {loading&&!context?<p role="status">Instellingen laden…</p>:!context||!config?<button onClick={()=>void load()}>Opnieuw laden</button>:<>
      <fieldset className="pub-panel-content" disabled={busy||loading}>
        {tab==="chapters"&&<>
          <p className="pub-hint">Een hoofdstuk is een artikel met een eigen pagina. Alleen gepubliceerde hoofdstukken verschijnen voor lezers.</p>
          {report?<>
            <h3>{report.title}</h3><ol className="pub-admin-chapters">{report.chapters.map((c,i)=><li key={c.id} data-current={c.id===id}>
              <button type="button" onClick={()=>openArticle(c.id)}>{i+1}. {c.title}</button>
              <div><button type="button" aria-label={`Verplaats ${c.title} omhoog`} disabled={changed||i===0} onClick={()=>{const order=report.chapters.map(x=>x.id);[order[i-1],order[i]]=[order[i],order[i-1]];reportChange("reorder",{order});}}>↑</button>
                <button type="button" aria-label={`Verplaats ${c.title} omlaag`} disabled={changed||i===report.chapters.length-1} onClick={()=>{const order=report.chapters.map(x=>x.id);[order[i],order[i+1]]=[order[i+1],order[i]];reportChange("reorder",{order});}}>↓</button>
                <button type="button" aria-label={`Ontkoppel ${c.title} uit dit verslag`} disabled={changed} onClick={()=>{if(window.confirm("Alleen uit het verslag halen? Het artikel blijft bestaan."))reportChange("detach",{id:c.id});}}>Ontkoppel</button></div>
            </li>)}</ol>
            <label>Titel volgend hoofdstuk<input value={reportTitle} maxLength={200} onChange={e=>setReportTitle(e.target.value)} placeholder="Nieuw hoofdstuk"/></label>
            <button type="button" className="pub-primary" disabled={dirty||changed} onClick={()=>reportChange("next",{title:reportTitle})}>+ Verdergaan in een nieuw hoofdstuk</button>
            {dirty&&<p className="pub-hint">Sla eerst je huidige tekst op.</p>}
            <details><summary>Verslagtitel aanpassen</summary><label>Nieuwe titel<input value={reportTitle} maxLength={200} onChange={e=>setReportTitle(e.target.value)}/></label><button disabled={!reportTitle.trim()||changed} onClick={()=>reportChange("rename",{title:reportTitle})}>Titel opslaan</button></details>
            <p className="pub-hint">Gebruik Verwijzingen om een bestaand artikel te zoeken en aan dit verslag toe te voegen.</p>
          </>:<>
            <label>Nieuw verslag<input value={reportTitle} maxLength={200} onChange={e=>setReportTitle(e.target.value)} placeholder="Titel van het verslag"/></label>
            <button type="button" disabled={!reportTitle.trim()||changed} onClick={()=>reportChange("create",{title:reportTitle})}>Verslag beginnen met dit artikel</button>
            {!!context.reports.length&&<><label>Of kies een bestaand verslag<select value={reportId} onChange={e=>setReportId(e.target.value)}><option value="">Kies een verslag</option>{context.reports.map(r=><option value={r.id} key={r.id}>{r.title}</option>)}</select></label><button disabled={!reportId||changed} onClick={()=>{const r=context.reports.find(x=>x.id===reportId)!;reportChange("attach",{report:r.id,version:r.version});}}>Dit artikel als hoofdstuk toevoegen</button></>}
          </>}
        </>}
        {tab==="links"&&<>
          <p className="pub-hint">Selecteer woorden in je tekst en voeg een verwijzing toe. De koppeling blijft werken als het webadres verandert.</p>
          <label>Zoek een artikel of interne tag<input type="search" value={query} maxLength={100} onChange={e=>setQuery(e.target.value)} placeholder="Zoek op titel, samenvatting of tag"/></label>
          <div className="pub-search-results" role="group" aria-label="Gevonden artikelen">{choices.map(c=><button type="button" key={c.id} aria-pressed={target?.id===c.id} onClick={()=>{setTarget(c);setAnchor("");}}>{c.title}</button>)}{!choices.length&&<p>Geen artikelen gevonden.</p>}</div>
          {target&&<><h3>{target.title}</h3><label>Verwijzen naar<select value={anchor} onChange={e=>setAnchor(e.target.value)}><option value="">Hele artikel</option>{target.sections.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
            {onInsert&&<><p className="pub-hint">{selection?`Linktekst: ${selection.text||target.title}`:"Selecteer eerst woorden of zet de cursor in een tekstsectie."}</p><button className="pub-primary" type="button" disabled={!selection} onClick={()=>{onInsert(target,anchor||undefined);close();}}>Link invoegen in de tekst</button></>}
            <div className="pub-row"><button type="button" onClick={()=>openArticle(target.id)}>Openen in Werkplek</button>{onReference&&<button type="button" onClick={()=>openArticle(target.id,true)}>Ernaast lezen</button>}</div>
            {report&&<button disabled={changed} onClick={()=>reportChange("attach",{id:target.id})}>Toevoegen als hoofdstuk</button>}
            <label>Interne verbinding<select value={kind} onChange={e=>setKind(e.target.value as Relation["kind"])}>{Object.entries(relationLabels).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
            <button type="button" onClick={()=>setConfig(c=>c?{...c,relations:[...c.relations.filter(r=>r.target!==target.id),{target:target.id,kind}]}:c)}>Intern verbinden, zonder openbare link</button>
          </>}
          <h3>Interne verbindingen</h3>{config.relations.map((r,i)=><div className="pub-row" key={r.target}><button onClick={()=>openArticle(r.target)}>{relationLabels[r.kind]} · Open artikel</button><button onClick={()=>setConfig(c=>c?{...c,relations:c.relations.filter((_,j)=>j!==i)}:c)}>Ontkoppel</button></div>)}
          <h3>Deze artikelen verwijzen hiernaar</h3>{context.backlinks.map(b=><button type="button" key={b.id} onClick={()=>openArticle(b.id)}>{b.title} · {b.inline?"In de tekst":"Intern"}</button>)}{!context.backlinks.length&&<p className="pub-hint">Nog geen terugverwijzingen.</p>}
        </>}
        {tab==="tags"&&<>
          <p className="pub-hint">Deze tags zijn alleen voor de redactie. Ze worden niet in de openbare pagina of SEO-metadata gezet.</p>
          <label>Interne tag<input value={tagValue} maxLength={80} onChange={e=>setTagValue(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();if(tagValue.trim()){setConfig(c=>c?{...c,tags:[...new Set([...c.tags,tagValue.trim()])].slice(0,50)}:c);setTagValue("");}}}}/></label>
          <button type="button" disabled={!tagValue.trim()||config.tags.length>=50} onClick={()=>{setConfig(c=>c?{...c,tags:[...new Set([...c.tags,tagValue.trim()])]}:c);setTagValue("");}}>Tag toevoegen</button>
          <div className="pub-tags">{config.tags.map(t=><button key={t} type="button" aria-label={`Verwijder tag ${t}`} onClick={()=>setConfig(c=>c?{...c,tags:c.tags.filter(x=>x!==t)}:c)}>{t} ×</button>)}</div>
        </>}
        {tab==="publish"&&<>
          <p className="pub-hint">Opslaan verandert het concept. Publiceren zet die opgeslagen versie op de gekozen websites. De andere website houdt zijn eigen laatst gepubliceerde versie.</p>
          {context.sites.map(site=>{const s=config.sites[site.id],edition=context.editions.find(e=>e.platform===site.id);return <section className="pub-site" key={site.id}>
            <label className="pub-check"><input type="checkbox" checked={s.selected} onChange={e=>setSite(site.id,"selected",e.target.checked)}/>Publiceren op {site.label}</label>
            <p className="pub-hint">{edition?.state==="published"?`Live · bijgewerkt ${new Date(edition.updated_at).toLocaleString("nl-NL")}`:"Niet gepubliceerd"}</p>
            <label>Webadres<input value={s.slug} maxLength={180} onChange={e=>setSite(site.id,"slug",e.target.value)} spellCheck={false}/></label>
            <label>SEO-titel<input value={s.seo_title} maxLength={200} placeholder="Standaard de artikeltitel" onChange={e=>setSite(site.id,"seo_title",e.target.value)}/></label>
            <label>Beschrijving<textarea value={s.description} maxLength={500} rows={3} placeholder="Standaard de samenvatting" onChange={e=>setSite(site.id,"description",e.target.value)}/></label>
            <label className="pub-check"><input type="checkbox" checked={s.indexable} onChange={e=>setSite(site.id,"indexable",e.target.checked)}/>Mag in zoekmachines verschijnen</label>
            <label>Voorkeursversie voor zoekmachines<select value={s.canonical} onChange={e=>setSite(site.id,"canonical",e.target.value)}><option value="self">Deze website</option>{context.sites.filter(x=>x.id!==site.id).map(x=><option value={x.id} key={x.id}>{x.label}</option>)}</select></label>
            <label className="pub-check"><input type="checkbox" checked={s.featured} onChange={e=>setSite(site.id,"featured",e.target.checked)}/>Uitlichten op de homepage</label>
            {s.featured&&<label>Plek<select value={s.position} onChange={e=>setSite(site.id,"position",e.target.value)}><option value="main">Hoofditem</option><option value="side">Overige uitgelichte artikelen</option></select></label>}
            {edition?.state==="published"&&<div className="pub-row">{site.origin&&<a href={`${site.origin}/artikelen/${edition.slug}`} target="_blank" rel="noopener noreferrer">Bekijk live ↗</a>}<button type="button" disabled={dirty||changed} onClick={()=>{if(window.confirm(`Alleen op ${site.label} offline halen?`))void run(()=>withdrawSharedArticle(id,site.id),`Op ${site.label} offline gehaald.`,()=>onReload?.());}}>Offline halen</button></div>}
            {!site.origin&&<p className="pub-hint">Stel het websiteadres in voor canonicals en verwijzingen tussen websites.</p>}
            {context.can_set_origin&&<details><summary>Websiteadres {site.label}</summary><p className="pub-hint">Dit adres geldt voor alle artikelen op deze website.</p><label>Officieel adres<input type="url" value={origins[site.id]??site.origin??""} placeholder="https://jouw-website.nl" onChange={e=>setOrigins(values=>({...values,[site.id]:e.target.value}))}/></label><button disabled={!origins[site.id]||changed} onClick={()=>void run(()=>setPublishingOrigin(site.id,origins[site.id]!),"Websiteadres opgeslagen.")}>Websiteadres opslaan</button></details>}
          </section>;})}
          <label>Afbeelding<input value={config.hero_image} maxLength={2000} placeholder="https://… of /afbeelding.jpg" onChange={e=>setConfig(c=>c?{...c,hero_image:e.target.value}:c)}/></label>
          <label>Beschrijving van de afbeelding<input value={config.image_alt} maxLength={500} onChange={e=>setConfig(c=>c?{...c,image_alt:e.target.value}:c)}/></label>
          <p className="pub-hint">Een website uitvinken haalt een eerdere publicatie niet offline. Daarvoor gebruik je Offline halen.</p>
          <button type="button" className="pub-primary" disabled={dirty||changed||!context.sites.some(s=>config.sites[s.id].selected)} onClick={()=>{const sites=context.sites.filter(s=>config.sites[s.id].selected).map(s=>s.id);if(window.confirm(`De opgeslagen tekst en verslagstructuur publiceren op ${sites.join(" en ")}?`))void run(()=>publishSharedArticle({id,sites,version:context.version,revision,reportVersion:report?.version??null}),"Gepubliceerd. Nieuwe pagina-aanvragen lezen de gekozen versie.",()=>onReload?.());}}>Publiceer geselecteerde websites</button>
          {(dirty||changed)&&<p className="pub-hint">Sla eerst {dirty?"de artikeltekst":"de instellingen"} op voordat je publiceert.</p>}
        </>}
      </fieldset>
      <footer className="pub-panel-footer"><span>{changed?"Instellingen nog niet opgeslagen":"Instellingen opgeslagen"}</span><button type="button" className="pub-primary" disabled={!changed||busy||loading} onClick={()=>void run(()=>savePublishingConfig(id,context.version,config),"Instellingen opgeslagen. De live versies zijn nog niet veranderd.")}>{busy?"Even geduld…":"Instellingen opslaan"}</button></footer>
      </>}
    </dialog>
  </>;
}
