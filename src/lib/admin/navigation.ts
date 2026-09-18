import type { WorkspaceLink } from "@/components/account/WorkspaceShell";

/** Main navigation describes work areas, not content types or audiences. */
export function adminNavigation(role: string): WorkspaceLink[] {
  return [
    { href: "/admin", label: "Overzicht", icon: "overview" },
    { href: "/admin/werkplek", label: "Werkplek", icon: "write" },
    { href: "/admin/onderzoeken", label: "Onderzoeken", icon: "research" },
    { href: "/admin/content", label: "Publicaties", icon: "library" },
    ...(["owner", "admin"].includes(role)
      ? [{ href: "/admin/gebruikers", label: "Gebruikers", icon: "users" as const }]
      : []),
  ];
}

export function activeAdminItem(path: string, items: WorkspaceLink[]) {
  // Member editions keep their own protected routes, but belong to Publicaties.
  const canonical = path === "/admin/ledencontent" || path.startsWith("/admin/ledencontent/")
    ? "/admin/content"
    : path;
  return items.findLast(item => canonical === item.href ||
    (item.href !== "/admin" && canonical.startsWith(item.href + "/")));
}
