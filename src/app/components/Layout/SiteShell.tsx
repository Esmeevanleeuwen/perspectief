"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/account") ||
    [
      "/login",
      "/registreren",
      "/bevestigen",
      "/wachtwoord-vergeten",
      "/wachtwoord-instellen",
    ].includes(pathname);

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
