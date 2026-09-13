import type { CSSProperties, ReactNode } from "react";
import "./modules.css";

/** The shared frame: arrange slots here without touching any module's data. */
export default function AdminModuleLayout({ header, filters, notice, children, accent }: {
  header: ReactNode;
  filters?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="admin-page admin-module" style={accent ? { "--module-accent": accent } as CSSProperties : undefined}>
      <header className="admin-module-header">{header}</header>
      {notice}
      {filters && <div className="admin-module-filters">{filters}</div>}
      <div className="admin-module-content">{children}</div>
    </div>
  );
}
