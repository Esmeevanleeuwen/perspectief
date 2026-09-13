import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import AdminContentList from "@/components/admin/AdminContentList";

export default async function AdminPage() {
  const { supabase } = await requireEditorialUser();
  const { data: recent, error } = await supabase
    .from("content_items")
    .select("id,slug,title,content_type,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <div className="admin-page">
      <AdminPageHeading title="Overzicht" description="Je redactionele werkruimte.">
        <Link href="/admin/content/nieuw" className="member-button">+ Nieuwe publicatie</Link>
      </AdminPageHeading>
      <section aria-labelledby="recent-publications">
        <div className="admin-section-heading">
          <h2 id="recent-publications">Recente publicaties</h2>
          <Link href="/admin/content">Alle publicaties →</Link>
        </div>
        {error ? (
          <p className="member-notice member-error" role="alert">Publicaties laden lukte niet. Probeer de pagina opnieuw te openen.</p>
        ) : recent?.length ? (
          <AdminContentList items={recent} />
        ) : (
          <div className="member-empty"><h2>Nog geen publicaties</h2><Link href="/admin/content/nieuw">Maak de eerste publicatie →</Link></div>
        )}
      </section>
    </div>
  );
}
