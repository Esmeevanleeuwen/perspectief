import type { ReactNode } from "react";
import { requireMemberAdmin } from "@/lib/auth/user";
import PublicationNavigation from "@/components/admin/publications/PublicationNavigation";

export default async function MemberContentLayout({ children }: { children: ReactNode }) {
  await requireMemberAdmin();
  return <><PublicationNavigation active="members" />{children}</>;
}
