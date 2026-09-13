import type { ReactNode } from "react";

export default function AdminModuleState({ kind, children }: {
  kind: "loading" | "empty" | "error";
  children: ReactNode;
}) {
  return <div className={kind === "error" ? "member-notice member-error" : "admin-module-state"} role={kind === "error" ? "alert" : "status"} aria-busy={kind === "loading"}>{children}</div>;
}
