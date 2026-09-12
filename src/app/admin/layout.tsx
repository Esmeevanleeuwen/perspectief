import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import { signOut } from "@/app/(auth)/actions";
import SubmitButton from "@/components/account/SubmitButton";
import WorkspaceShell, {
  type WorkspaceLink,
} from "@/components/account/WorkspaceShell";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
import "@/app/member.css";
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { role } = await requireEditorialUser();
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
    <WorkspaceShell
      mode="admin"
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
    </WorkspaceShell>
  );
}
