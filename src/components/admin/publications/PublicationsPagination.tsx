import Link from "next/link";
import { publicationSearchParams } from "@/lib/admin/publications/filters";
import type { PublicationFilters } from "@/lib/admin/publications/model";

export default function PublicationsPagination({ filters, page, pageSize, total, basePath }: {
  filters: PublicationFilters; page: number; pageSize: number; total: number; basePath: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const href = (n: number) => `${basePath}?${publicationSearchParams(filters, n)}`;
  return (
    <nav className="member-pagination" aria-label="Publicatiepagina’s">
      {page > 1 && <Link href={href(page - 1)} scroll={false}>← Vorige</Link>}
      <span>{total} {total === 1 ? "publicatie" : "publicaties"} · Pagina {page} van {pageCount}</span>
      {page < pageCount && <Link href={href(page + 1)} scroll={false}>Volgende →</Link>}
    </nav>
  );
}
