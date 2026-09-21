"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { loadPublishingContext, publishSharedArticle, savePublishingConfig } from "@/app/admin/publishing-actions";
import { loadWritingDocument } from "@/app/admin/content/workspace-actions";
import { hasUnsavedPublicationForm } from "@/lib/admin/unsaved-publication-form";
import type { PublishingConfig, PublishingContext } from "@/lib/publishing/model";
import ArticleImageField from "./ArticleImageField";
import ArticleDisplayOptions from "./ArticleDisplayOptions";
import "./publishing.css";
import "./article-image.css";
import "./article-presentation.css";

type Props = { id: string; revision: string; dirty: boolean; inline?: boolean; refreshRevisionOnOpen?: boolean; onReload?: () => void | Promise<void> };

export default function QuickPublish({ id, revision, dirty, inline = false, refreshRevisionOnOpen = false, onReload }: Props) {
  const dialog = useRef<HTMLDialogElement>(null), heading = useId(), lock = useRef(false), request = useRef(0);
  const [savedRevision, setSavedRevision] = useState(revision);
  const [formDirty, setFormDirty] = useState(false);
  const [context, setContext] = useState<PublishingContext | null>(null);
  const [config, setConfig] = useState<PublishingConfig | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(inline), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [conflict, setConflict] = useState(false);
  const changed = !!config && JSON.stringify(config) !== baseline;
  const hasUnsavedText = dirty || formDirty;
  const selected = context?.sites.filter(site => config?.sites[site.id].selected) ?? [];
  const blocked = busy || uploading || loading;

  const load = useCallback(async () => {
    const token = ++request.current;
    setLoading(true); setError(""); setConflict(false);
    try {
      const [result, article] = await Promise.all([
        loadPublishingContext(id),
        refreshRevisionOnOpen ? loadWritingDocument(`publication:${id}`) : Promise.resolve(null),
      ]);
      if (token !== request.current) return;
      if (!result.ok || (article && !article.ok)) {
        setContext(null); setConfig(null);
        setError(!result.ok ? result.message : article && !article.ok ? article.message : "Laden lukte niet."); return;
      }
      if (article?.ok) setSavedRevision(article.value.revision);
      setContext(result.value); setConfig(result.value.config); setBaseline(JSON.stringify(result.value.config));
      setFormDirty(refreshRevisionOnOpen && hasUnsavedPublicationForm(document));
    } catch {
      if (token === request.current) { setContext(null); setConfig(null); setError("Artikelinstellingen laden is niet gelukt. Probeer opnieuw."); }
    } finally { if (token === request.current) setLoading(false); }
  }, [id, refreshRevisionOnOpen]);

  useEffect(() => { if (inline) void load(); return () => { request.current++; }; }, [inline, load]);
  useEffect(() => {
    if (!changed && !uploading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed, uploading]);
  useEffect(() => {
    if (!inline) return;
    // Saving a legacy form refreshes this panel. Do not discard an unfinished image selection.
    const guard = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".admin-editor-grid")) return;
      if (!changed && !uploading && !busy) return;
      event.preventDefault(); event.stopImmediatePropagation();
      setError(uploading ? "Wacht tot de afbeelding is geüpload." : "Sla eerst je afbeelding en weergave op met ‘Als concept opslaan’. Daarna kun je de tekstformulieren opslaan.");
    };
    document.addEventListener("submit", guard, true);
    return () => document.removeEventListener("submit", guard, true);
  }, [inline, changed, uploading, busy]);

  function open() {
    setContext(null); setConfig(null); setBaseline(""); setNotice("");
    dialog.current?.showModal(); void load();
  }
  function close() {
    if (blocked) return;
    if (changed && !window.confirm("Sluiten zonder de afbeeldings- en publicatie-instellingen op te slaan?")) return;
    dialog.current?.close();
  }
  function reloadLatest() {
    if (blocked || (changed && !window.confirm("Je niet-opgeslagen instellingen vervangen door de nieuwste opgeslagen versie?"))) return;
    void load();
  }

  async function save(publish: boolean) {
    if (lock.current || blocked || conflict || !context || !config || (publish && (dirty || !selected.length))) return;
    if (publish && refreshRevisionOnOpen) {
      const unsaved = hasUnsavedPublicationForm(document); setFormDirty(unsaved);
      if (unsaved) { setError("Sla eerst je gewijzigde tekstformulier op. Je afbeelding en weergave kun je hier alvast als concept opslaan."); return; }
    }
    lock.current = true; setBusy(true); setError(""); setNotice("");
    let published = false;
    try {
      let version = context.version;
      if (changed) {
        const saved = await savePublishingConfig(id, version, config);
        if (!saved.ok) { setError(saved.message); setConflict(!!saved.conflict); return; }
        version = saved.value;
        setContext(current => current ? { ...current, version, config } : current);
        setBaseline(JSON.stringify(config));
      }
      if (!publish) { setNotice("Afbeelding en weergave opgeslagen als concept. Klik op Publiceer om ze ook op de website te tonen."); return; }
      const report = context.reports.find(item => item.chapters.some(chapter => chapter.id === id));
      const result = await publishSharedArticle({ id, sites: selected.map(site => site.id), version,
        revision: refreshRevisionOnOpen ? savedRevision : revision, reportVersion: report?.version ?? null });
      if (!result.ok) { setError(result.message); setConflict(!!result.conflict); return; }
      published = true;
      setNotice(`Gepubliceerd op ${selected.map(site => site.label).join(" en ")}.`);
      await load(); await onReload?.();
    } catch {
      setError(published ? "Het artikel is gepubliceerd, maar de weergave kon niet worden vernieuwd. Herlaad de pagina."
        : "De verbinding is onderbroken. Je invoer blijft staan. Controleer de opgeslagen versie voordat je opnieuw publiceert.");
    } finally { lock.current = false; setBusy(false); }
  }

  const contents = <>
    <header className="quick-publish-heading"><h2 id={heading}>{inline ? "Afbeelding en artikelweergave" : "Artikel publiceren"}</h2>
      {!inline && <button type="button" aria-label="Publiceren sluiten" disabled={blocked} onClick={close}>×</button>}</header>
    {loading && <p className="quick-publish-content" role="status">Instellingen laden…</p>}
    {error && <div className="quick-publish-error"><p role="alert">{error}</p>{context && <button type="button" disabled={blocked} onClick={reloadLatest}>Laatste versie laden</button>}</div>}
    {notice && <p role="status" className="quick-publish-notice">{notice}</p>}
    {!loading && !context && <div className="quick-publish-content"><button type="button" onClick={() => void load()}>Opnieuw laden</button></div>}
    {context && config && <>
      <fieldset className="quick-publish-content" disabled={blocked || conflict}>
        <p className="pub-hint">Kies een JPEG vanaf je apparaat om de huidige afbeelding te vervangen. Publiceer daarna om de afbeelding, weergave en opgeslagen artikeltekst op de gekozen websites bij te werken.</p>
        {hasUnsavedText && <p role="alert" className="pub-error">Je tekst is nog niet opgeslagen. Sla eerst het gewijzigde tekstformulier op voordat je publiceert.</p>}
        <ArticleImageField value={config.hero_image} disabled={busy || loading || conflict} onBusyChange={setUploading}
          onChange={hero_image => setConfig(current => current ? { ...current, hero_image } : current)} />
        <label>Beschrijving van de afbeelding<input value={config.image_alt} maxLength={500} placeholder="Beschrijf kort wat er op de afbeelding staat"
          onChange={event => { const image_alt = event.target.value; setConfig(current => current ? { ...current, image_alt } : current); }} /></label>
        <ArticleDisplayOptions config={config} sites={context.sites} onChange={setConfig} />
        <div className="quick-publish-sites" role="group" aria-label="Publiceren op">
          {context.sites.map(site => <label key={site.id}>
            <input type="checkbox" checked={config.sites[site.id].selected} onChange={event => {
              const checked = event.target.checked;
              setConfig(current => current ? { ...current, sites: { ...current.sites, [site.id]: { ...current.sites[site.id], selected: checked } } } : current);
            }} />{site.label}{context.editions.some(edition => edition.platform === site.id && edition.state === "published") ? " · staat al live" : ""}
          </label>)}
        </div>
        <p className="pub-hint">Een website uitvinken haalt een bestaande publicatie niet offline. Hoofdstukken beheren en SEO blijven bij Structuur & publicatie.</p>
        {context.editions.filter(edition => edition.state === "published").map(edition => {
          const site = context.sites.find(item => item.id === edition.platform);
          return site?.origin ? <a key={edition.platform} href={`${site.origin}/artikelen/${edition.slug}`} target="_blank" rel="noopener noreferrer">Bekijk op {site.label} ↗</a> : null;
        })}
      </fieldset>
      <footer className="quick-publish-footer">
        <button type="button" disabled={blocked || conflict || !changed} onClick={() => void save(false)}>Als concept opslaan</button>
        <button type="button" className="pub-primary" disabled={blocked || conflict || dirty || !selected.length} onClick={() => void save(true)}>
          {busy ? "Bezig met opslaan…" : `Publiceer${selected.length ? ` op ${selected.map(site => site.label).join(" en ")}` : " artikel"}`}
        </button>
      </footer>
    </>}
  </>;
  if (inline) return <section className="article-presentation-panel" id="article-presentation" aria-labelledby={heading}>{contents}</section>;
  return <><button type="button" className="pub-panel-trigger pub-primary" onClick={open}>Publiceren</button>
    <dialog ref={dialog} className="quick-publish-dialog" aria-labelledby={heading} onCancel={event => { event.preventDefault(); close(); }}>{contents}</dialog></>;
}
