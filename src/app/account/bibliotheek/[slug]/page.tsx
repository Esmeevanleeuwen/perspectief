import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { publicationHref, type MemberPublication } from "@/lib/members";
import BookmarkButton from "@/components/account/BookmarkButton";
export const metadata = {
  title: "Ledenpublicatie | Meridian",
  robots: { index: false, follow: false },
};
export default async function ReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { supabase, user } = await requireUser(publicationHref(slug));
  const { data, error } = await supabase
    .from("member_publications")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("De publicatie kon niet worden geladen.");
  if (!data) notFound();
  const item = data as MemberPublication;
  const { data: bookmark } = await supabase
    .from("member_bookmarks")
    .select("publication_id")
    .eq("publication_id", item.id)
    .eq("user_id", user.id)
    .maybeSingle();
  const readingTime = Math.max(
    1,
    Math.ceil(item.body.split(/\s+/).length / 220),
  );
  return (
    <article className="member-reading">
      <Link href="/account/bibliotheek" className="member-back">
        ← Mijn bibliotheek
      </Link>
      <header>
        <p className="member-eyebrow">
          {item.kind === "text" ? "Tekst" : "Artikel"} ·{" "}
          {item.audience === "selected"
            ? "Persoonlijk met jou gedeeld"
            : "Voor leden"}
        </p>
        <h1>{item.title}</h1>
        {item.summary && <p className="member-lead">{item.summary}</p>}
        <div className="member-reading-meta">
          <span>
            {item.published_at &&
              new Date(item.published_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
            · {readingTime} min leestijd
          </span>
          <BookmarkButton id={item.id} saved={Boolean(bookmark)} />
        </div>
      </header>
      <div className="member-reading-body">
        {item.body.split(/\n\s*\n/).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      <footer>
        <Link href="/account/bibliotheek">← Verder ontdekken</Link>
      </footer>
    </article>
  );
}
