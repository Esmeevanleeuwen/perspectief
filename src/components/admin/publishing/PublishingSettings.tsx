"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWritingDocument } from "@/app/admin/content/workspace-actions";
import PublishingPanel from "./PublishingPanel";
export default function PublishingSettings({id}:{id:string}) {
  const [revision,setRevision]=useState(""),[error,setError]=useState("");const router=useRouter();
  async function reload(){const result=await loadWritingDocument(`publication:${id}`);if(result.ok){setRevision(result.value.revision);setError("");}else setError(result.message);}
  useEffect(()=>{let cancelled=false;void loadWritingDocument(`publication:${id}`).then(r=>{if(cancelled)return;if(r.ok)setRevision(r.value.revision);else setError(r.message);}).catch(()=>{if(!cancelled)setError("Laden lukte niet.");});return()=>{cancelled=true;};},[id]);
  return <section className="pub-settings-entry">
    <h2>Gedeeld artikel</h2><p>De formulieren hieronder bewaren het concept. Hoofdstukken, verwijzingen, websiteadressen en publiceren op Meridian of Amparis beheer je via het zijpaneel.</p>
    {error?<p role="alert">{error} <button onClick={()=>void reload()}>Opnieuw laden</button></p>:revision?<PublishingPanel id={id} revision={revision} dirty={false} onReload={reload} onOpen={key=>router.push(`/admin/werkplek?open=publication:${key}`)}/>:<p role="status">Artikel laden…</p>}
    <p><a href={`/admin/werkplek?open=publication:${id}`}>Verder schrijven in de Werkplek →</a></p>
  </section>;
}
