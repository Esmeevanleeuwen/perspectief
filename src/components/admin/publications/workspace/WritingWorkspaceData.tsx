import "server-only";
import { requireEditorialUser } from "@/lib/admin/roles";
import type { PublicationFilters } from "@/lib/admin/publications/model";
import { readWritingSpace, readWritingPage, readWritingDocument } from "@/lib/admin/writing/repository";
import { openItem, type ItemKey } from "@/lib/admin/writing/model";
import AdminModuleState from "../../modules/AdminModuleState";
import WritingWorkspace from "./WritingWorkspace";

export default async function WritingWorkspaceData({ filters, openKey }: { filters: PublicationFilters; openKey?: ItemKey }) {
  const { supabase, user } = await requireEditorialUser();
  let props: Parameters<typeof WritingWorkspace>[0] | null = null;
  try {
    const { state, version } = await readWritingSpace(supabase, user.id);
    if (filters.q || filters.type || filters.status || filters.placement)
      state.view = { ...state.view, query: filters.q, type: filters.type, status: filters.status, placement: filters.placement, collection: "all" };
    if (openKey) {
      if (!state.view.tabs.includes(openKey) && state.view.tabs.length >= 50)
        return <AdminModuleState kind="error"><h2>Er staan al 50 teksten open</h2><p>Sluit eerst een tabblad. Je teksten blijven bewaard.</p><a href="/admin/werkplek">Open je werkplek</a></AdminModuleState>;
      state.view = { ...openItem(state.view, openKey), reference: null, mode: "overview" };
    }
    const page = await readWritingPage(supabase, state, filters.page);
    if (!state.view.active && page.items[0]) state.view = openItem(state.view, page.items[0].key);
    const keys = [...new Set([state.view.active, state.view.reference].filter(key => key !== null))];
    const loaded = await Promise.allSettled(keys.map(key => readWritingDocument(supabase, user.id, key)));
    const documents = loaded.flatMap(result => result.status === "fulfilled" ? [result.value] : []);
    props = { initialState: state, initialVersion: version, initialPage: page, initialDocuments: documents, initialDetail: Boolean(openKey) };
  } catch {
    // A failed read must never overwrite an existing saved workspace with an empty one.
  }
  if (!props) return (
    <AdminModuleState kind="error">
      <h2>Je werkplek kon niet worden geladen</h2>
      <p>Je stukken blijven bewaard. Probeer de pagina opnieuw te openen.</p>
      <form method="get" action="/admin/werkplek"><button type="submit">Opnieuw laden</button></form>
    </AdminModuleState>
  );
  return <WritingWorkspace {...props} />;
}
