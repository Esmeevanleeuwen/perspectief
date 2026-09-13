import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminContentList from "@/components/admin/AdminContentList";

export default async function ResearchListPage() {
  const { supabase } = await requireEditorialUser();
  const { data: items, error } = await supabase
    .from("content_items")
    .select("id,slug,title,summary,status,featured,updated_at,research_dossiers(central_question)")
    .eq("content_type", "research")
    .order("updated_at", { ascending: false });
  const rows = (items ?? []).map(item => {
    const dossier = Array.isArray(item.research_dossiers) ? item.research_dossiers[0] : item.research_dossiers;
    return { ...item, content_type: "research", description: dossier?.central_question || item.summary };
  });

  return (
    <div className="admin-page">
      <AdminPageHeading title="Onderzoeken" description="Werk aan onderzoeken en verdiepende dossiers.">
        <Link href="/admin/onderzoeken/nieuw" className="member-button">+ Nieuw onderzoek</Link>
      </AdminPageHeading>
      {error ? (
        <p className="member-notice member-error" role="alert">Onderzoeken laden lukte niet. Probeer de pagina opnieuw te openen.</p>
      ) : rows.length ? (
        <AdminContentList items={rows} />
      ) : (
        <div className="member-empty"><h2>Nog geen onderzoeken</h2><Link href="/admin/onderzoeken/nieuw">Maak het eerste onderzoek →</Link></div>
      )}
    </div>
  );
}
