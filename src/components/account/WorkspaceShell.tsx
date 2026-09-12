"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import WorkspaceIcon, { type WorkspaceIconName } from "./WorkspaceIcon";
export type WorkspaceLink = {
  href: string;
  label: string;
  icon: WorkspaceIconName;
};
export default function WorkspaceShell({
  children,
  items,
  mode = "account",
  footer,
  switcher,
}: {
  children: React.ReactNode;
  items: WorkspaceLink[];
  mode?: "account" | "admin" | "welcome";
  footer?: React.ReactNode;
  switcher?: React.ReactNode;
}) {
  const path = usePathname();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = items.findLast(
    (item) =>
      path === item.href ||
      (item.href !== "/account" &&
        item.href !== "/admin" &&
        path.startsWith(item.href + "/")),
  );
  const label =
    mode === "admin"
      ? "Redactie"
      : mode === "welcome"
        ? "Welkom bij Meridian"
        : "Mijn Meridian";
  return (
    <main
      className={`member-shell workspace-shell workspace-${mode}${compact ? " workspace-compact" : ""}${mobileOpen ? " workspace-menu-open" : ""}`}
    >
      <a className="member-skip" href="#workspace-content">
        Naar de inhoud
      </a>
      <header className="workspace-header">
        <Link
          className="workspace-brand"
          href="/"
          aria-label="Meridian homepage"
        >
          <span className="workspace-mark" aria-hidden="true">
            m<span>•</span>
          </span>
          <span>MERIDIAN</span>
        </Link>
        <div className="workspace-topbar">
          <button
            type="button"
            className="workspace-icon-button workspace-collapse"
            onClick={() => setCompact(!compact)}
            aria-expanded={!compact}
            aria-controls="workspace-sidebar"
            aria-label={
              compact ? "Navigatie uitklappen" : "Navigatie inklappen"
            }
          >
            <WorkspaceIcon name="panel" />
          </button>
          <button
            type="button"
            className="workspace-icon-button workspace-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="workspace-sidebar"
            aria-label="Navigatie openen of sluiten"
          >
            <WorkspaceIcon name="panel" />
          </button>
          <div className="workspace-breadcrumb">
            <span>{label}</span>
            {active && (
              <>
                <span aria-hidden="true">/</span>
                <strong>{active.label}</strong>
              </>
            )}
          </div>
          <div className="workspace-top-actions">
            {switcher}
            <Link href="/" className="workspace-site-link">
              Naar de site <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </header>
      <aside
        id="workspace-sidebar"
        className="workspace-sidebar"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMobileOpen(false);
            document
              .querySelector<HTMLButtonElement>(".workspace-mobile-toggle")
              ?.focus();
          }
        }}
      >
        <p className="workspace-nav-label">
          {mode === "admin"
            ? "Werkruimte"
            : mode === "welcome"
              ? "Ontdekken"
              : "Jouw werkruimte"}
        </p>
        <nav aria-label={label}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={compact ? item.label : undefined}
              aria-label={item.label}
              aria-current={active?.href === item.href ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <WorkspaceIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {mode === "welcome" && (
          <div className="workspace-sidebar-note">
            <span className="workspace-status-dot" />
            Alles hangt samen.
            <p>Jouw plek om verbanden te ontdekken en verder te lezen.</p>
          </div>
        )}
        <div className="workspace-sidebar-footer">
          {footer ?? (
            <Link href="/methode">
              <WorkspaceIcon name="globe" />
              <span>Over Meridian</span>
            </Link>
          )}
        </div>
      </aside>
      <div id="workspace-content" className="workspace-content" tabIndex={-1}>
        {children}
      </div>
    </main>
  );
}
