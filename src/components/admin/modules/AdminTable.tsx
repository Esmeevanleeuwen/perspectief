import type { Key, ReactNode } from "react";

export type AdminColumn<T> = {
  id: string;
  label: string;
  render: (item: T) => ReactNode;
};

/** A server-rendered table; column renderers stay on the server. */
export default function AdminTable<T>({ items, columns, rowKey, label }: {
  items: T[];
  columns: readonly AdminColumn<T>[];
  rowKey: (item: T) => Key;
  label: string;
}) {
  return (
    <div className="member-table-wrap admin-module-table-wrap">
      <table className="member-table admin-module-table">
        <caption className="sr-only">{label}</caption>
        <thead><tr>{columns.map(column => <th scope="col" key={column.id}>{column.label}</th>)}</tr></thead>
        <tbody>{items.map(item => (
          <tr key={rowKey(item)}>{columns.map(column => (
            <td key={column.id} data-label={column.label}>{column.render(item)}</td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
