import { Suspense } from "react";
import AdminModuleLayout from "../modules/AdminModuleLayout";
import AdminModuleState from "../modules/AdminModuleState";
import AdminPageHeading from "../AdminPageHeading";
import PublicationNotice from "./PublicationNotice";
import WritingWorkspaceData from "./workspace/WritingWorkspaceData";
import type { PublicationFilters as Filters } from "@/lib/admin/publications/model";

/** Start here: this file only assembles the building blocks for this screen. */
export default function PublicationsModule({
  filters,
  deleted = false,
}: {
  filters: Filters;
  deleted?: boolean;
}) {
  return (
    <AdminModuleLayout
      accent="#63469c"
      header={
        <AdminPageHeading
          title="Publicaties"
          description="Je teksten, op één plek."
        />
      }
      notice={<PublicationNotice deleted={deleted} />}
    >
      <Suspense
        key={JSON.stringify(filters)}
        fallback={
          <AdminModuleState kind="loading">Publicaties laden…</AdminModuleState>
        }
      >
        <WritingWorkspaceData filters={filters} />
      </Suspense>
    </AdminModuleLayout>
  );
}
