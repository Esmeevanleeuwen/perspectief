import Link from "next/link";
import { requireEditorialUser } from "@/lib/admin/roles";
import styles from "./publication-navigation.module.css";

export default async function PublicationNavigation({ active }: { active: "website" | "members" }) {
  const { role } = await requireEditorialUser();
  return (
    <nav className={styles.navigation} aria-label="Publicatieomgeving">
      <Link href="/admin/content" aria-current={active === "website" ? "page" : undefined}>Website</Link>
      {["owner", "admin"].includes(role) && (
        <Link href="/admin/ledencontent" aria-current={active === "members" ? "page" : undefined}>Leden & persoonlijk</Link>
      )}
    </nav>
  );
}
