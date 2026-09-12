import { requireMemberAdmin } from "@/lib/auth/user";
import "@/app/member.css";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMemberAdmin();
  return <div className="member-admin">{children}</div>;
}
