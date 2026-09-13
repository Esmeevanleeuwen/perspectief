import AdminTable, { type AdminColumn } from "../modules/AdminTable";
import type { Publication } from "@/lib/admin/publications/model";

export default function PublicationsTable({ items, columns }: { items: Publication[]; columns: readonly AdminColumn<Publication>[] }) {
  return <AdminTable label="Publicaties" items={items} columns={columns} rowKey={item => item.id} />;
}
