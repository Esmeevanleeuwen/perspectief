import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { signOut } from "@/app/(auth)/actions";
import SubmitButton from "@/components/account/SubmitButton";
import WorkspaceShell from "@/components/account/WorkspaceShell";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
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
    <WorkspaceShell
      items={[
        { href: "/account", label: "Overzicht", icon: "overview" },
        { href: "/account/bibliotheek", label: "Bibliotheek", icon: "library" },
        { href: "/account/opgeslagen", label: "Opgeslagen", icon: "bookmark" },
        {
          href: "/account/profiel",
          label: "Profiel & privacy",
          icon: "profile",
        },
      ]}
      switcher={editorial ? <Link href="/admin">Beheer</Link> : undefined}
      footer={
        <>
          <Link href="/artikelen">
            <WorkspaceIcon name="globe" />
            <span>Ontdek Meridian</span>
          </Link>
          <form action={signOut}>
            <SubmitButton className="member-text-button">
              Uitloggen
            </SubmitButton>
          </form>
        </>
      }
    >
      <div className="member-container">{children}</div>
    </WorkspaceShell>
  );
}
