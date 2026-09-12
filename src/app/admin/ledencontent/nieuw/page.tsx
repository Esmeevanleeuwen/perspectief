import { requireMemberAdmin } from "@/lib/auth/user";
import MemberEditor from "@/components/account/MemberEditor";
import type { Member } from "@/lib/members";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ gebruiker?: string }>;
}) {
  const { supabase } = await requireMemberAdmin();
  const { gebruiker } = await searchParams;
  const { data: members, error } = await supabase.rpc("member_directory");
  if (error) throw new Error("Gebruikers konden niet worden geladen.");
  let recipients: Member[] = [];
  if (gebruiker && /^[a-f0-9-]{36}$/i.test(gebruiker)) {
    const { data } = await supabase.rpc("member_directory", {
      p_ids: [gebruiker],
    });
    recipients = data ?? [];
  }
  return <MemberEditor members={members ?? []} recipients={recipients} />;
}
