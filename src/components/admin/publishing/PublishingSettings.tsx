"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWritingDocument } from "@/app/admin/content/workspace-actions";
import PublishingPanel from "./PublishingPanel";

export default function PublishingSettings({ id }: { id: string }) {
  const [revision, setRevision] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  async function reload() {
    const result = await loadWritingDocument(`publication:${id}`);
    if (result.ok) { setRevision(result.value.revision); setError(""); }
    else setError(result.message);
  }
  useEffect(() => {
    let cancelled = false;
    void loadWritingDocument(`publication:${id}`).then(result => {
      if (cancelled) return;
      if (result.ok) setRevision(result.value.revision); else setError(result.message);
    }).catch(() => { if (!cancelled) setError("Laden lukte niet."); });
    return () => { cancelled = true; };
  }, [id]);
  return <section className="pub-settings-entry">
    <h2>Artikel publiceren</h2>
    <p>Sla de formulieren hieronder eerst op. Via Publiceren kies je een afbeelding vanaf je apparaat en zet je de opgeslagen tekst live. Hoofdstukken en SEO staan bij Structuur & publicatie.</p>
    {error ? <p role="alert">{error} <button onClick={() => void reload()}>Opnieuw laden</button></p>
      : revision ? <PublishingPanel id={id} revision={revision} dirty={false} refreshRevisionOnOpen onReload={reload}
        onOpen={key => router.push(`/admin/werkplek?open=publication:${key}`)} /> : <p role="status">Artikel laden…</p>}
    <p><a href={`/admin/werkplek?open=publication:${id}`}>Verder schrijven in de Werkplek →</a></p>
  </section>;
}
