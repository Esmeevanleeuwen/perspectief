import "server-only";
import type { ReactNode } from "react";
import { getPublications } from "@/lib/admin/publications/repository";
import type { PublicationFilters, PublicationsResult } from "@/lib/admin/publications/model";

/** Load once, then let the module choose how to render the result. */
export default async function PublicationsData({ filters, children }: {
  filters: PublicationFilters;
  children: (result: PublicationsResult) => ReactNode;
}) {
  return children(await getPublications(filters));
}
