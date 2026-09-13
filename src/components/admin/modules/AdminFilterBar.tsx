import Form from "next/form";
import type { ReactNode } from "react";
import SubmitButton from "@/components/account/SubmitButton";

export default function AdminFilterBar({ action, children }: { action: string; children: ReactNode }) {
  return (
    <Form action={action} scroll={false} className="member-search admin-module-filter-bar">
      {children}
      <SubmitButton className="member-secondary" pendingLabel="Laden…">Filteren</SubmitButton>
    </Form>
  );
}
