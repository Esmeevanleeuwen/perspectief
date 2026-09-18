import { Suspense } from "react";
import AdminModuleLayout from "../modules/AdminModuleLayout";
import AdminModuleState from "../modules/AdminModuleState";
import AdminPageHeading from "../AdminPageHeading";
import PublicationActions from "./PublicationActions";
import PublicationFilters from "./PublicationFilters";
import PublicationNotice from "./PublicationNotice";
import PublicationsData from "./PublicationsData";
import PublicationsResults from "./PublicationsResults";
import { publicationColumns } from "./publication-columns";
import type { PublicationFilters as Filters } from "@/lib/admin/publications/model";

/** Publication management is separate from the personal writing workspace. */
export default function PublicationsModule({ filters, deleted = false }: { filters: Filters; deleted?: boolean }) {
  return (
    <AdminModuleLayout
      accent="#63469c"
      header={<AdminPageHeading title="Publicaties" description="Beheer status, controles en plaatsing. Schrijven doe je in de Werkplek."><PublicationActions /></AdminPageHeading>}
      filters={<PublicationFilters key={JSON.stringify(filters)} value={filters} action="/admin/content" />}
      notice={<PublicationNotice deleted={deleted} />}
    >
      <Suspense key={JSON.stringify(filters)} fallback={<AdminModuleState kind="loading">Publicaties laden…</AdminModuleState>}>
        <PublicationsData filters={filters}>
          {result => <PublicationsResults result={result} filters={filters} basePath="/admin/content" columns={publicationColumns} />}
        </PublicationsData>
      </Suspense>
    </AdminModuleLayout>
  );
}
