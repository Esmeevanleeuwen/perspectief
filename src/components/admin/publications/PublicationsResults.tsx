import Link from "next/link";
import AdminModuleState from "../modules/AdminModuleState";
import type { AdminColumn } from "../modules/AdminTable";
import PublicationsTable from "./PublicationsTable";
import PublicationsPagination from "./PublicationsPagination";
import { publicationSearchParams } from "@/lib/admin/publications/filters";
import type { Publication, PublicationFilters, PublicationsResult } from "@/lib/admin/publications/model";

export default function PublicationsResults({ result, filters, basePath, columns }: {
  result: PublicationsResult; filters: PublicationFilters; basePath: string; columns: readonly AdminColumn<Publication>[];
}) {
  if (!result.ok) return <AdminModuleState kind="error"><p>{result.message}</p><a href={`${basePath}?${publicationSearchParams(filters)}`}>Opnieuw proberen</a></AdminModuleState>;
  if (!result.items.length) return <AdminModuleState kind="empty"><h2>Geen publicaties gevonden</h2><p>Pas je filters aan of maak een nieuwe publicatie.</p>{(filters.q || filters.type || filters.status || filters.placement) && <Link href={basePath} scroll={false}>Filters wissen</Link>}</AdminModuleState>;
  return <><PublicationsTable items={result.items} columns={columns} /><PublicationsPagination filters={filters} basePath={basePath} page={result.page} pageSize={result.pageSize} total={result.total} /></>;
}
