import type { ReactNode } from "react";

export default function AdminPageHeading({ title, description, children }: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {children}
    </div>
  );
}
