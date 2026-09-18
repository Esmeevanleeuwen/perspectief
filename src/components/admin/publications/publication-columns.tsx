import Link from "next/link";
import type { AdminColumn } from "../modules/AdminTable";
import { optionLabel, publicationTypes, publicationStatuses, type Publication } from "@/lib/admin/publications/model";
import { publicContentHref } from "@/lib/admin/content";

/** A document has one source; writing and publication management are separate views. */
export const publicationColumns: readonly AdminColumn<Publication>[] = [
  { id: "title", label: "Titel", render: item => <Link href={`/admin/content/${item.id}`}><strong>{item.title}</strong></Link> },
  { id: "type", label: "Type", render: item => optionLabel(publicationTypes, item.type) },
  { id: "status", label: "Status", render: item => <span className="admin-status" data-status={item.status}>{optionLabel(publicationStatuses, item.status)}</span> },
  { id: "placement", label: "Homepage-instelling", render: item => !item.placement.featured ? "Niet uitgelicht" : item.placement.position === "main" ? "Hoofditem" : item.placement.position === "side" ? "Zij-item" : "Uitgelicht" },
  { id: "updated", label: "Bewerkt", render: item => <time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" })}</time> },
  { id: "actions", label: "Acties", render: item => <div className="admin-row-actions"><Link href={`/admin/werkplek?open=${encodeURIComponent(`publication:${item.id}`)}`}>Schrijven</Link><Link href={`/admin/content/${item.id}`}>Instellingen</Link>{item.status === "published" && <Link href={item.type === "research" ? publicContentHref(item.type, item.slug) : `/lees/${item.id}`} target="_blank" rel="noopener noreferrer">Bekijk ↗</Link>}</div> },
];
