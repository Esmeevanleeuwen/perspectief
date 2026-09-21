"use server";
import { revalidatePath, updateTag } from "next/cache";
import { queueDiscoveryNotice } from "@/lib/publishing/discovery-notify";
import { requireEditorialUser } from "@/lib/admin/roles";
import { PUBLIC_CONTENT_CACHE_TAG, DOSSIER_CACHE_TAG } from "@/lib/public-cache";
import { uuidPattern, type ArticleChoice, type Platform, type PublishingConfig, type PublishingContext } from "@/lib/publishing/model";
import type { Result } from "@/lib/admin/writing/model";
function message(code?: string, detail?: string) {
  if(code === "40001") return "Dit is intussen gewijzigd. Sla je tekst op en laad de laatste versie voordat je opnieuw probeert.";
  if(code === "42501") return "Je hebt geen rechten om dit artikel te beheren.";
  if(code === "23505") return "Dit webadres is al in gebruik of gereserveerd. Kies een ander adres.";
  if(code === "P0002") return "Dit artikel of verslag is niet meer beschikbaar.";
  const known:Record<string,string> = {
    "Write article content before publishing":"Schrijf eerst inhoud voordat je publiceert.",
    "Set the canonical site address first":"Vul eerst het adres van de gekozen canonieke website in.",
    "Publish the primary edition first":"Publiceer eerst de gekozen hoofdversie, of publiceer beide tegelijk.",
    "Circular canonical setting":"Beide websites kunnen niet naar elkaar wijzen als hoofdversie.",
    "Detach from the other report first":"Dit artikel hoort al bij een ander verslag. Ontkoppel het daar eerst.",
    "Article already in a report":"Dit artikel hoort al bij een verslag.",
    "Invalid site settings":"Controleer de webadressen: gebruik kleine letters, cijfers en streepjes.",
    "Invalid image URL":"Gebruik een https-afbeeldingsadres of een pad zoals /afbeelding.jpg.",
  };
  return (detail && known[detail]) || "Dit lukte niet. Controleer de gegevens en probeer opnieuw.";
}
async function invoke<T>(name:string, args:Record<string,unknown>):Promise<Result<T>> {
  const {supabase}=await requireEditorialUser();
  try { const {data,error}=await supabase.rpc(name,args); return error ? {ok:false,message:message(error.code,error.message),conflict:error.code==="40001"} : {ok:true,value:data as T}; }
  catch { return {ok:false,message:"De verbinding is onderbroken. Je wijzigingen blijven in het formulier."}; }
}
const invalid = ():Result<never> => ({ok:false,message:"Ongeldig artikel."});
export async function loadPublishingContext(id:string):Promise<Result<PublishingContext>> { return uuidPattern.test(id) ? invoke("publishing_context",{p_id:id}) : invalid(); }
export async function searchPublishingArticles(query:string):Promise<Result<ArticleChoice[]>> { return typeof query === "string" && query.length<=100 ? invoke("publishing_search",{p_query:query}) : invalid(); }
export async function savePublishingConfig(id:string,version:number,config:PublishingConfig):Promise<Result<number>> { return uuidPattern.test(id) ? invoke("publishing_save",{p_id:id,p_version:version,p_config:config}) : invalid(); }
export async function changePublishingReport(input:{id:string;action:string;report?:string;version?:number;title?:string;order?:string[]}):Promise<Result<{report_id:string;new_content_id?:string}>> {
  if(!uuidPattern.test(input.id)) return invalid();
  return invoke("publishing_report_change",{p_id:input.id,p_action:input.action,p_report:input.report??null,p_version:input.version??null,p_title:input.title??null,p_order:input.order??null});
}
export async function setPublishingOrigin(site:Platform,origin:string):Promise<Result<null>> { return invoke("publishing_set_origin",{p_site:site,p_origin:origin.replace(/\/$/,"")}); }
function invalidate() { updateTag(PUBLIC_CONTENT_CACHE_TAG); updateTag(DOSSIER_CACHE_TAG); for (const path of ["/", "/artikelen", "/admin/content", "/sitemap.xml", "/artikelen/sitemap.xml", "/feed.xml"]) revalidatePath(path); }
export async function publishSharedArticle(input:{id:string;sites:Platform[];version:number;revision:string;reportVersion:number|null}):Promise<Result<{revision_id:string}>> {
  if(!uuidPattern.test(input.id)) return invalid();
  const result=await invoke<{revision_id:string}>("publishing_publish",{p_id:input.id,p_sites:input.sites,p_version:input.version,p_revision:input.revision,p_report_version:input.reportVersion});
  if(result.ok) { invalidate(); if (input.sites.includes("meridian")) queueDiscoveryNotice(input.id); } return result;
}
export async function withdrawSharedArticle(id:string,site:Platform):Promise<Result<null>> {
  if(!uuidPattern.test(id)) return invalid();
  const result=await invoke<null>("publishing_withdraw",{p_id:id,p_site:site}); if(result.ok) invalidate(); return result;
}
