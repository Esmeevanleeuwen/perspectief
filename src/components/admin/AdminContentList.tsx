import Link from "next/link";
import { publicContentHref } from "@/lib/admin/content";

const typeLabels: Record<string, string> = {
  article: "Artikel", analysis: "Analyse", case: "Casus", research: "Onderzoek",
};
const statusLabels: Record<string, string> = {
  idea: "Idee", researching: "In onderzoek", draft: "Concept", source_check: "Broncheck",
  editorial_review: "Redactiecheck", ready: "Klaar voor publicatie", published: "Gepubliceerd", archived: "Gearchiveerd",
};

type ContentRow = {
  id: string; title: string; slug: string; content_type: string; status: string;
  updated_at: string; featured?: boolean; description?: string | null;
};

export default function AdminContentList({ items }: { items: ContentRow[] }) {
  return (
    <ul className="admin-content-list">
      {items.map(item => (
        <li key={item.id} className="admin-content-row">
          <div className="admin-content-title">
            <Link href={`/admin/content/${item.id}`}>{item.title}</Link>
            {item.description && <p className="admin-content-description">{item.description}</p>}
            <p className="admin-content-meta">
              <span>{typeLabels[item.content_type] ?? item.content_type}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={item.updated_at}>{new Date(item.updated_at).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" })}</time>
              {item.featured && <><span aria-hidden="true">·</span><span>Uitgelicht op de homepage</span></>}
            </p>
          </div>
          <span className="admin-status" data-status={item.status}>{statusLabels[item.status] ?? item.status.replaceAll("_", " ")}</span>
          <div className="admin-row-actions">
            <Link href={`/admin/content/${item.id}`} aria-label={`Bewerk ${item.title}`}>Bewerken</Link>
            {item.status === "published" && <Link href={item.content_type === "research" ? publicContentHref(item.content_type, item.slug) : `/lees/${item.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk ${item.title} op de site`}>Bekijk ↗</Link>}
          </div>
        </li>
      ))}
    </ul>
  );
}
