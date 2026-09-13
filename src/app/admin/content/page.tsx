import PublicationsModule from "@/components/admin/publications/PublicationsModule";
import { parsePublicationFilters, type PublicationSearchParams } from "@/lib/admin/publications/filters";

export default async function ContentPage({ searchParams }: { searchParams: Promise<PublicationSearchParams> }) {
  const params = await searchParams;
  return <PublicationsModule filters={parsePublicationFilters(params)} deleted={params.deleted === "1"} />;
}
