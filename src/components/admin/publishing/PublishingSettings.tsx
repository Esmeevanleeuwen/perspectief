"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWritingDocument } from "@/app/admin/content/workspace-actions";
import AdvancedPublishingPanel from "./AdvancedPublishingPanel";
import QuickPublish from "./QuickPublish";

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
  return <div className="pub-settings-entry">
    {error ? <p role="alert">{error} <button onClick={() => void reload()}>Opnieuw laden</button></p>
      : revision ? <>
        <QuickPublish id={id} revision={revision} dirty={false} inline refreshRevisionOnOpen onReload={reload} />
        <div className="article-advanced-entry"><AdvancedPublishingPanel id={id} revision={revision} dirty={false} onReload={reload}
          onOpen={key => router.push(`/admin/werkplek?open=publication:${key}`)} />
          <a href={`/admin/werkplek?open=publication:${id}`}>Verder schrijven in de Werkplek →</a></div>
      </> : <p role="status">Artikel laden…</p>}
  </div>;
}
