import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { publicationHref, relationOne } from "@/lib/member-saved";
import BookmarkButton from "@/components/account/BookmarkButton";
export default async function Page() {
  const { supabase, user } = await requireUser("/account/opgeslagen");
  const [bookmarks, legacy] = await Promise.all([
    supabase
      .from("member_bookmarks")
      .select("publication_id,member_publications!inner(id,slug,title,kind)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_items")
      .select("id,title,item_type,item_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <p className="member-eyebrow">Voor later</p>
      <h1>Opgeslagen</h1>
      <p className="member-intro">
        De publicaties waar je naar terug wilt keren. Teksten waarvoor je geen
        toegang meer hebt, verdwijnen automatisch uit dit overzicht.
      </p>
      {bookmarks.error ? (
        <p role="alert" className="member-notice member-error">
          Je opgeslagen publicaties konden niet worden geladen.
        </p>
      ) : bookmarks.data?.length ? (
        bookmarks.data.map((b) => {
          const p = relationOne(b.member_publications);
          return p ? (
            <div key={b.publication_id} className="member-saved-row">
              <Link href={publicationHref(p.slug)}>
                <h2>{p.title}</h2>
              </Link>
              <BookmarkButton id={p.id} saved />
            </div>
          ) : null;
        })
      ) : (
        <div className="member-empty">
          <h2>Nog niets opgeslagen.</h2>
          <p>
            Gebruik ‘Bewaren voor later’ tijdens het lezen van een
            ledenpublicatie.
          </p>
          <Link href="/account/bibliotheek">Bekijk mijn bibliotheek →</Link>
        </div>
      )}
      {Boolean(legacy.data?.length) && (
        <section className="mt-12">
          <h2>Eerder opgeslagen routes</h2>
          {legacy.data?.map((item) => (
            <div key={item.id} className="member-saved-row">
              <div>
                <span className="member-eyebrow">{item.item_type}</span>
                <h2>{item.title}</h2>
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
