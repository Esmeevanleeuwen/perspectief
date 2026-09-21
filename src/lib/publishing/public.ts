import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Catalog, Platform, PublicReport, SharedArticle } from "./model";

/** No session, service key, fallback to drafts, or cross-deployment cache. */
async function call<T>(name: string, args: Record<string, unknown>, empty: T): Promise<T> {
  if (!isSupabaseConfigured()) return empty;
  // Publications are request-time data. Keep Next's prerender bailout outside
  // the SDK: PostgREST catches fetch errors, including Next's no-store signal.
  await connection();
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, {
    auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error("Gepubliceerde inhoud kon niet worden geladen.");
  return data as T;
}
export const readSharedArticle = cache((platform: Platform, slug: string) => call<SharedArticle | null>("publishing_article", {p_platform:platform,p_slug:slug},null));
export const readSharedReport = (platform: Platform, slug: string) => call<PublicReport | null>("publishing_public_report", {p_platform:platform,p_slug:slug},null);
export const readReportCatalog = (platform: Platform) => call<PublicReport[]>("publishing_report_catalog", {p_platform:platform},[]);
export const readCatalog = (platform: Platform, offset = 0, limit = 100) => call<Catalog>("publishing_catalog", {p_platform:platform,p_offset:offset,p_limit:limit},{items:[],total:0,origin:null});
export const readCatalogAll = cache(async function readCatalogAll(platform: Platform): Promise<SharedArticle[]> {
  const first = await readCatalog(platform,0,1000), items = [...first.items];
  for(let offset=1000; offset<first.total; offset+=1000) items.push(...(await readCatalog(platform,offset,1000)).items);
  return items;
});
export const readArticleAddress = (id:string) => call<{platform:Platform;slug:string;origin:string|null}|null>("publishing_article_address",{p_id:id},null);

export type ReleasedResearchLink = {
  id: string; slug: string; title: string; summary: string | null;
  content_type: string; relation: string; position: number;
};
/** An identical public projection for signed-out readers and signed-in editors. */
export const readResearchLinks = (researchId: string) =>
  call<ReleasedResearchLink[]>("publishing_research_links", {p_research_id: researchId}, []);
