import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { signOut } from "@/app/(auth)/actions";
import AccountNav from "@/components/account/AccountNav";
import SubmitButton from "@/components/account/SubmitButton";
import "@/app/member.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mijn Meridian",
  robots: { index: false, follow: false },
};
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const editorial = [
    "owner",
    "admin",
    "editor",
    "researcher",
    "fact_checker",
  ].includes(data?.role ?? "");
  return (
    <main className="member-shell">
      <a className="member-skip" href="#account-content">
        Naar de inhoud
      </a>
      <header className="member-header">
        <Link className="member-brand" href="/">
          MERIDIAN<span>Jouw eigen perspectief.</span>
        </Link>
        <div className="member-header-actions">
          <Link href="/artikelen">Ontdek Meridian ↗</Link>
          {editorial && <Link href="/admin">Beheer</Link>}
          <form action={signOut}>
            <SubmitButton className="member-text-button">
              Uitloggen
            </SubmitButton>
          </form>
        </div>
      </header>
      <AccountNav />
      <div id="account-content" className="member-container">
        {children}
      </div>
    </main>
  );
}
