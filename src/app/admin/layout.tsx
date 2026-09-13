import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import { signOut } from "@/app/(auth)/actions";
import SubmitButton from "@/components/account/SubmitButton";
import type { WorkspaceLink } from "@/components/account/WorkspaceShell";
import SharedAdminShell from "@/components/admin/SharedAdminShell";
import type { FeatureAccess } from "@olympus/workspace-ui/model";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
import "@/app/member.css";
import "@olympus/workspace-ui/styles.css";
import "./shared-sidebar.css";
import "./admin.css";
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { role, supabase } = await requireEditorialUser();
  const { data: featureAccess } = await supabase.from("suite_feature_access").select("platform_id,feature_id,enabled,revision,updated_at").eq("platform_id", "meridian");
  const items: WorkspaceLink[] = [
    { href: "/admin", label: "Overzicht", icon: "overview" },
    { href: "/admin/content", label: "Publicaties", icon: "library" },
    { href: "/admin/onderzoeken", label: "Onderzoeken", icon: "research" },
    ...(["owner", "admin"].includes(role)
      ? [
          {
            href: "/admin/ledencontent",
            label: "Ledenpublicaties",
            icon: "write" as const,
          },
          {
            href: "/admin/gebruikers",
            label: "Gebruikers",
            icon: "users" as const,
          },
        ]
      : []),
  ];
  return (
    <SharedAdminShell
      initialRows={(featureAccess ?? []) as FeatureAccess[]}
      items={items}
      switcher={<Link href="/account">Mijn account</Link>}
      footer={
        <>
          <Link href="/account">
            <WorkspaceIcon name="profile" />
            <span>Mijn account</span>
          </Link>
          <form action={signOut}>
            <SubmitButton className="member-text-button">
              Uitloggen
            </SubmitButton>
          </form>
        </>
      }
    >
      <div className="workspace-admin-content">{children}</div>
    </SharedAdminShell>
  );
}
