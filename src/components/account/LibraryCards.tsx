import Link from "next/link";
import { publicationHref } from "@/lib/members";
import WorkspaceIcon from "./WorkspaceIcon";
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
          <span
            className={`workspace-feature-icon ${item.kind === "text" ? "orange" : "violet"}`}
          >
            <WorkspaceIcon name={item.kind === "text" ? "write" : "library"} />
          </span>
          <div>
            <div className="member-card-top">
              <span className="member-eyebrow">
                {item.kind === "text" ? "Tekst" : "Artikel"}
              </span>
              <span
                className={`member-badge${item.audience === "selected" ? " member-badge-personal" : ""}`}
              >
                {item.audience === "selected" ? "Voor jou" : "Voor leden"}
              </span>
            </div>
            <h2>{item.title}</h2>
            {item.summary && <p>{item.summary}</p>}
          </div>
          <span className="member-card-arrow">
            <WorkspaceIcon name="arrow" />
          </span>
        </Link>
      ))}
    </div>
  );
}
