"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { changePublicationStatus } from "@/app/admin/content/status-actions";
import { optionLabel, publicationStatuses, type Publication } from "@/lib/admin/publications/model";
import { isPublicationStatus, type PublicationStatusValue, type StatusChangeInput } from "@/lib/admin/publications/status";
import QuickPublish from "@/components/admin/publishing/QuickPublish";
import "./publication-status.css";

/** The parent keys this editor by the server revision after a refreshed list. */
export default function PublicationStatus({ item }: { item: Publication }) {
  const router = useRouter();
  const fieldId = useId(), feedbackId = useId();
  const lock = useRef(false);
  const [saved, setSaved] = useState({ status: item.status, updatedAt: item.updatedAt });
  const [value, setValue] = useState(item.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const shared = ["article", "analysis", "case"].includes(item.type);
  const changed = value !== saved.status;
  const needsPublisher = shared && value === "published" && changed;

  async function save() {
    if (lock.current || !changed || needsPublisher || !isPublicationStatus(value)) return;
    lock.current = true; setBusy(true); setError(""); setNotice(""); setConflict(false);
    const input: StatusChangeInput = { id: item.id, status: value as PublicationStatusValue, updatedAt: saved.updatedAt };
    try {
      let result = await changePublicationStatus(input);
      if (result.ok && result.value.confirmation_required) {
        const sites = result.value.sites.map(site => site === "meridian" ? "Meridian" : site === "avera" ? "Amparis" : site).join(" en ");
        const prompt = result.value.action === "publish"
          ? `De opgeslagen versie van “${item.title}” publiceren op ${sites}?`
          : `“${item.title}” staat live op ${sites}. De status wijzigen naar ${optionLabel(publicationStatuses, value)} haalt het artikel offline op alle websites waarop het is gepubliceerd. De tekst blijft bewaard. Doorgaan?`;
        if (!window.confirm(prompt)) return;
        result = await changePublicationStatus({ ...input, confirmed: true });
      }
      if (!result.ok) { setError(result.message); setConflict(!!result.conflict); return; }
      if (result.value.confirmation_required) { setError("De publicatie is veranderd. Ververs het overzicht."); setConflict(true); return; }
      setSaved({ status: result.value.status, updatedAt: result.value.updated_at });
      setValue(result.value.status);
      setNotice("Status opgeslagen.");
      router.refresh(); // Retain the current URL, including search, filters and page.
    } catch {
      setError("De verbinding is onderbroken. Ververs het overzicht om de opgeslagen status te controleren.");
      setConflict(true);
    } finally { lock.current = false; setBusy(false); }
  }

  return <div className="publication-status-editor" aria-busy={busy}>
    <label htmlFor={fieldId} className="sr-only">Status van {item.title}</label>
    <select id={fieldId} value={value} disabled={busy} aria-describedby={feedbackId}
      onChange={event => { setValue(event.target.value); setError(""); setNotice(""); setConflict(false); }}>
      {!isPublicationStatus(value) && <option value={value}>{value}</option>}
      {publicationStatuses.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
    </select>
    {needsPublisher ? <QuickPublish id={item.id} revision="" dirty={false} refreshRevisionOnOpen onReload={() => router.refresh()} />
      : changed && <button type="button" disabled={busy || conflict} onClick={() => void save()}>{busy ? "Opslaan…" : "Opslaan"}</button>}
    <div id={feedbackId} className="publication-status-feedback">
      {error ? <p role="alert">{error}</p> : notice ? <p role="status">{notice}</p> : changed ? <p>{needsPublisher ? "Kies Publiceren om de websites te bevestigen." : "Nog niet opgeslagen."}</p> : null}
      {conflict && <button type="button" disabled={busy} onClick={() => router.refresh()}>Ververs overzicht</button>}
    </div>
  </div>;
}
