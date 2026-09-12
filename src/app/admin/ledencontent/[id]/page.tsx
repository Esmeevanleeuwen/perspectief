import { notFound } from "next/navigation";
import { requireMemberAdmin } from "@/lib/auth/user";
import MemberEditor from "@/components/account/MemberEditor";
import type { MemberPublication, Member } from "@/lib/members";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { supabase } = await requireMemberAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const [itemResult, recipientResult, memberResult] = await Promise.all([
    supabase.from("member_publications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("member_publication_recipients")
      .select("user_id")
      .eq("publication_id", id),
    supabase.rpc("member_directory"),
  ]);
  if (itemResult.error || recipientResult.error || memberResult.error)
    throw new Error("De publicatie kon niet worden geladen.");
  if (!itemResult.data) notFound();
  let recipients: Member[] = [];
  if (recipientResult.data?.length) {
    const { data, error } = await supabase.rpc("member_directory", {
      p_ids: recipientResult.data.map((r) => r.user_id),
    });
    if (error) throw new Error("Ontvangers konden niet worden geladen.");
    recipients = data ?? [];
  }
  return (
    <>
      {saved && (
        <p className="member-notice" role="status">
          Opgeslagen.{" "}
          {itemResult.data.status === "published"
            ? "De publicatie is beschikbaar voor de gekozen lezers."
            : "Dit concept is alleen zichtbaar voor beheerders."}
        </p>
      )}
      <MemberEditor
        key={itemResult.data.updated_at}
        item={itemResult.data as MemberPublication}
        recipients={recipients}
        members={memberResult.data ?? []}
      />
    </>
  );
}
