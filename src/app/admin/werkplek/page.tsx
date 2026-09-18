import Link from "next/link";
import { Suspense } from "react";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminModuleLayout from "@/components/admin/modules/AdminModuleLayout";
import AdminModuleState from "@/components/admin/modules/AdminModuleState";
import WritingWorkspaceData from "@/components/admin/publications/workspace/WritingWorkspaceData";
import { parsePublicationFilters, type PublicationSearchParams } from "@/lib/admin/publications/filters";
import { isItemKey } from "@/lib/admin/writing/model";

export default async function WorkplekPage({ searchParams }: { searchParams: Promise<PublicationSearchParams> }) {
  const params = await searchParams;
  const filters = parsePublicationFilters(params);
  const requested = Array.isArray(params.open) ? params.open[0] : params.open;
  const openKey = isItemKey(requested) ? requested : undefined;
  return (
    <AdminModuleLayout
      accent="#63469c"
      header={<AdminPageHeading title="Werkplek" description="Schrijf, verzamel en vergelijk. Je mappen en sessies blijven bewaard."><Link className="member-secondary" href="/admin/content">Publicaties beheren →</Link></AdminPageHeading>}
    >
      <Suspense key={JSON.stringify([filters, openKey])} fallback={<AdminModuleState kind="loading">Werkplek laden…</AdminModuleState>}>
        <WritingWorkspaceData filters={filters} openKey={openKey} />
      </Suspense>
    </AdminModuleLayout>
  );
}
