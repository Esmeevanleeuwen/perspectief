"use client";

import { useEffect, useId, useRef, useState } from "react";
import { loadPublishingContext, publishSharedArticle, savePublishingConfig } from "@/app/admin/publishing-actions";
import { loadWritingDocument } from "@/app/admin/content/workspace-actions";
import type { PublishingConfig, PublishingContext } from "@/lib/publishing/model";
import ArticleImageField from "./ArticleImageField";
import "./publishing.css";
import "./article-image.css";

type Props = { id: string; revision: string; dirty: boolean; refreshRevisionOnOpen?: boolean; onReload?: () => void | Promise<void> };

export default function QuickPublish({ id, revision, dirty, refreshRevisionOnOpen = false, onReload }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const lock = useRef(false);
  const [savedRevision, setSavedRevision] = useState(revision);
  const [formDirty, setFormDirty] = useState(false);
  const hasUnsavedText = dirty || formDirty;
  const [context, setContext] = useState<PublishingContext | null>(null);
  const [config, setConfig] = useState<PublishingConfig | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const changed = !!config && JSON.stringify(config) !== baseline;
  const selected = context?.sites.filter(site => config?.sites[site.id].selected) ?? [];
  const blocked = busy || uploading || loading;

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  async function load() {
    setLoading(true); setError("");
    try {
      if (refreshRevisionOnOpen) {
        const article = await loadWritingDocument(`publication:${id}`);
        if (!article.ok) { setError(article.message); return; }
        setSavedRevision(article.value.revision);
      }
      const result = await loadPublishingContext(id);
      if (!result.ok) { setError(result.message); return; }
      setContext(result.value); setConfig(result.value.config); setBaseline(JSON.stringify(result.value.config));
    } catch { setError("Artikelinstellingen laden is niet gelukt. Probeer opnieuw."); }
    finally { setLoading(false); }
  }

  function open() {
    // Legacy forms are uncontrolled. Never publish while visible field edits are unsaved.
    if (refreshRevisionOnOpen) {
      const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(".admin-editor-grid input, .admin-editor-grid textarea");
      setFormDirty(Array.from(fields).some(field => field instanceof HTMLInputElement && field.type === "checkbox"
        ? field.checked !== field.defaultChecked
        : field.type !== "hidden" && field.value !== field.defaultValue));
    }
    setContext(null); setConfig(null); setBaseline(""); setNotice("");
    dialog.current?.showModal(); void load();
  }

  function close() {
    if (blocked) return;
    if (changed && !window.confirm("Sluiten zonder de afbeeldings- en publicatie-instellingen op te slaan?")) return;
    dialog.current?.close();
  }

  async function save(publish: boolean) {
    if (lock.current || blocked || !context || !config || (publish && (hasUnsavedText || !selected.length))) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    let published = false;
    try {
      let version = context.version;
      if (changed) {
        const saved = await savePublishingConfig(id, version, config);
        if (!saved.ok) { setError(saved.message); return; }
        version = saved.value;
        setContext(current => current ? { ...current, version, config } : current);
        setBaseline(JSON.stringify(config));
      }
      if (!publish) { setNotice("Afbeelding en instellingen opgeslagen als concept. De live versie is niet gewijzigd."); return; }
      const report = context.reports.find(item => item.chapters.some(chapter => chapter.id === id));
      // Keep the user's saved-text revision. Do not silently publish a newer concurrent edit.
      const result = await publishSharedArticle({ id, sites: selected.map(site => site.id), version, revision: refreshRevisionOnOpen ? savedRevision : revision, reportVersion: report?.version ?? null });
      if (!result.ok) { setError(result.message); return; }
      published = true;
      setNotice(`Gepubliceerd op ${selected.map(site => site.label).join(" en ")}.`);
      await load();
      await onReload?.();
    } catch {
      setError(published
        ? "Het artikel is gepubliceerd, maar de weergave kon niet worden vernieuwd. Herlaad de pagina."
        : "De verbinding is onderbroken. Je invoer blijft staan. Controleer de opgeslagen versie voordat je opnieuw publiceert.");
    } finally { lock.current = false; setBusy(false); }
  }

  return <>
    <button type="button" className="pub-panel-trigger pub-primary" onClick={open}>Publiceren</button>
    <dialog ref={dialog} className="quick-publish-dialog" aria-labelledby={heading} onCancel={event => { event.preventDefault(); close(); }}>
      <header className="quick-publish-heading"><h2 id={heading}>Artikel publiceren</h2><button type="button" aria-label="Publiceren sluiten" disabled={blocked} onClick={close}>×</button></header>
      {loading && <p className="quick-publish-content" role="status">Instellingen laden…</p>}
      {error && <p role="alert" className="quick-publish-error">{error}</p>}
      {notice && <p role="status" className="quick-publish-notice">{notice}</p>}
      {!loading && !context && <div className="quick-publish-content"><button type="button" onClick={() => void load()}>Opnieuw laden</button></div>}
      {context && config && <>
        <fieldset className="quick-publish-content" disabled={blocked}>
          <p className="pub-hint">Kies je afbeelding en waar het artikel verschijnt. De knop onderaan bewaart de instellingen en publiceert de opgeslagen artikeltekst.</p>
          {hasUnsavedText && <p role="alert" className="pub-error">Je tekst is nog niet opgeslagen. Sluit dit venster en sla eerst je tekst of het gewijzigde formulier op.</p>}
          <div className="quick-publish-sites" role="group" aria-label="Publiceren op">
            {context.sites.map(site => <label key={site.id}>
              <input type="checkbox" checked={config.sites[site.id].selected} onChange={event => {
                const checked = event.target.checked;
                setConfig(current => current ? { ...current, sites: { ...current.sites, [site.id]: { ...current.sites[site.id], selected: checked } } } : current);
              }} />
              {site.label}{context.editions.some(edition => edition.platform === site.id && edition.state === "published") ? " · staat al live" : ""}
            </label>)}
          </div>
          <ArticleImageField value={config.hero_image} disabled={busy || loading} onBusyChange={setUploading}
            onChange={hero_image => setConfig(current => current ? { ...current, hero_image } : current)} />
          <label>Beschrijving van de afbeelding<input value={config.image_alt} maxLength={500} placeholder="Beschrijf kort wat er op de afbeelding staat"
            onChange={event => { const image_alt = event.target.value; setConfig(current => current ? { ...current, image_alt } : current); }} /></label>
          <p className="pub-hint">Websiteadressen, SEO en hoofdstukken blijven bij Structuur & publicatie. Een website uitvinken haalt een bestaande publicatie niet offline.</p>
          {context.editions.filter(edition => edition.state === "published").map(edition => {
            const site = context.sites.find(item => item.id === edition.platform);
            return site?.origin ? <a key={edition.platform} href={`${site.origin}/artikelen/${edition.slug}`} target="_blank" rel="noopener noreferrer">Bekijk op {site.label} ↗</a> : null;
          })}
        </fieldset>
        <footer className="quick-publish-footer">
          <button type="button" disabled={blocked || !changed} onClick={() => void save(false)}>Als concept opslaan</button>
          <button type="button" className="pub-primary" disabled={blocked || hasUnsavedText || !selected.length} onClick={() => void save(true)}>
            {busy ? "Bezig met opslaan…" : `Publiceer${selected.length ? ` op ${selected.map(site => site.label).join(" en ")}` : " artikel"}`}
          </button>
        </footer>
      </>}
    </dialog>
  </>;
}
