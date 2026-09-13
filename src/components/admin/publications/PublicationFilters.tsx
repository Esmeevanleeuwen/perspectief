import AdminFilterBar from "../modules/AdminFilterBar";
import { publicationTypes, publicationStatuses, publicationPlacements, type PublicationFilters as Filters } from "@/lib/admin/publications/model";

export default function PublicationFilters({ value, action }: { value: Filters; action: string }) {
  return (
    <AdminFilterBar action={action}>
      <label className="member-grow">Zoek publicatie<input name="q" type="search" defaultValue={value.q} maxLength={100} placeholder="Zoek op titel…" /></label>
      <label>Type<select name="type" defaultValue={value.type}><option value="">Alle types</option>{publicationTypes.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={value.status}><option value="">Alle statussen</option>{publicationStatuses.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label>Homepage-instelling<select name="placement" defaultValue={value.placement}><option value="">Alle plaatsingen</option>{publicationPlacements.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </AdminFilterBar>
  );
}
