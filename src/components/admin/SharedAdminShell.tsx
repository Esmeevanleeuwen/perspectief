"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { WorkspaceAccessProvider, useWorkspaceAccess } from "@olympus/workspace-ui/access";
import { SharedSidebar } from "@olympus/workspace-ui/sidebar";
import type { FeatureAccess } from "@olympus/workspace-ui/model";
import { createClient } from "@/lib/supabase/client";
import MeridianMark from "@/components/brand/MeridianMark";
import WorkspaceIcon from "@/components/account/WorkspaceIcon";
import type { WorkspaceLink } from "@/components/account/WorkspaceShell";

type Props = { children: ReactNode; items: WorkspaceLink[]; footer: ReactNode; switcher?: ReactNode; initialRows: FeatureAccess[] };
function Shell({ children, items, footer, switcher }: Props) {
  const path = usePathname();
  const access = useWorkspaceAccess();
  const active = items.findLast(item => path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/")));
  return <main className={`meridian-admin ${access.collapsed ? "is-collapsed" : ""}`} style={{ "--os-width": access.preferences.width === "wide" ? "280px" : "240px", "--admin-sidebar-space": access.collapsed ? "0px" : access.preferences.width === "wide" ? "280px" : "240px" } as React.CSSProperties}>
    <a className="member-skip" href="#workspace-content">Naar de inhoud</a>
    <header className="meridian-admin-header"><Link href="/" className="meridian-admin-brand" aria-label="Meridian homepage"><MeridianMark className="workspace-mark" /><span>MERIDIAN</span></Link><div className="meridian-admin-header-actions">{switcher}<Link href="/">Naar de site ↗</Link></div></header>
    <SharedSidebar id="meridian-admin-sidebar" label="Redactie" brand={<span>Beheer<small>Meridian</small></span>}
      items={items.map(item => ({ id: item.href, href: item.href, label: item.label, icon: <WorkspaceIcon name={item.icon}/>, active: active?.href === item.href }))}
      collapsed={access.collapsed} onCollapse={access.setCollapsed} flags={access.flags} preferences={access.preferences}
      onPreferences={access.savePreferences} saving={access.saving} canSave={!!access.userId} footer={footer}/>
    <div id="workspace-content" className="meridian-admin-main" tabIndex={-1}>
      <div className="meridian-admin-breadcrumb">Redactie <span aria-hidden="true">/</span> <strong>{active?.label ?? "Werkruimte"}</strong></div>
      {access.error && <p className="meridian-admin-notice" role="status">{access.error}</p>}
      {children}
    </div>
  </main>;
}
export default function SharedAdminShell(props: Props) {
  const [client] = useState(createClient);
  return <WorkspaceAccessProvider client={client} platform="meridian" initialRows={props.initialRows}><Shell {...props}/></WorkspaceAccessProvider>;
}
