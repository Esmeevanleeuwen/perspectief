import Link from "next/link";
import { publicationHref } from "@/lib/members";
export default function LibraryCards({
  items,
}: {
  items: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    kind: string;
    audience: string;
  }[];
}) {
  return (
    <div className="member-cards">
      {items.map((item) => (
        <Link
          className="member-card"
          href={publicationHref(item.slug)}
          key={item.id}
        >
          <div className="member-card-top">
            <span className="member-eyebrow">
              {item.kind === "text" ? "Tekst" : "Artikel"}
            </span>
            <span className="member-badge">
              {item.audience === "selected" ? "Voor jou" : "Voor leden"}
            </span>
          </div>
          <h2>{item.title}</h2>
          {item.summary && <p>{item.summary}</p>}
          <span className="member-card-link">
            Lees verder <span aria-hidden="true">↗</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
