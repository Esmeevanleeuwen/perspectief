import type { ReactNode } from "react";
import PublicationNavigation from "@/components/admin/publications/PublicationNavigation";

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <><PublicationNavigation active="website" />{children}</>;
}
