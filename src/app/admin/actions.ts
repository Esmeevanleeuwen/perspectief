"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/roles";

const text=(fd:FormData,k:string)=>String(fd.get(k)??"").trim();
const slugify=(v:string)=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);

export async function createContent(fd:FormData){
  const {supabase,user}=await requireEditor(); const title=text(fd,"title"); const type=text(fd,"content_type")||"article";
  const {data,error}=await supabase.from("content_items").insert({title,slug:slugify(text(fd,"slug")||title),content_type:type,eyebrow:text(fd,"eyebrow")||null,summary:text(fd,"summary")||null,status:type==="research"?"researching":"draft",author_id:user.id}).select("id").single();
  if(error||!data) redirect(`/admin/content/nieuw?error=${encodeURIComponent(error?.message??"Aanmaken mislukt")}`);
  if(type==="research") await supabase.from("research_dossiers").insert({content_id:data.id,central_question:text(fd,"central_question")||title,method:text(fd,"method")||null,boundaries:text(fd,"boundaries")||null});
  redirect(`/admin/content/${data.id}`);
}

export async function updateContent(fd:FormData){
  const {supabase}=await requireEditor(); const id=text(fd,"id");
  await supabase.from("content_items").update({title:text(fd,"title"),slug:slugify(text(fd,"slug")),eyebrow:text(fd,"eyebrow")||null,summary:text(fd,"summary")||null,hero_image:text(fd,"hero_image")||null,status:text(fd,"status"),featured:fd.get("featured")==="on",featured_position:text(fd,"featured_position")||null,updated_at:new Date().toISOString()}).eq("id",id);
  revalidatePath(`/admin/content/${id}`);
}

export async function updateResearch(fd:FormData){
  const {supabase}=await requireEditor(); const id=text(fd,"id");
  await supabase.from("research_dossiers").upsert({content_id:id,central_question:text(fd,"central_question"),method:text(fd,"method")||null,boundaries:text(fd,"boundaries")||null,working_theory:text(fd,"working_theory")||null,dimensions:text(fd,"dimensions").split("\n").map(v=>v.trim()).filter(Boolean),missing_information:text(fd,"missing_information").split("\n").map(v=>v.trim()).filter(Boolean),updated_at:new Date().toISOString()});
  revalidatePath(`/admin/content/${id}`);
}

export async function addSection(fd:FormData){
  const {supabase}=await requireEditor(); const contentId=text(fd,"content_id");
  const {data:last}=await supabase.from("content_sections").select("position").eq("content_id",contentId).order("position",{ascending:false}).limit(1).maybeSingle();
  await supabase.from("content_sections").insert({content_id:contentId,section_type:text(fd,"section_type")||"paragraph",title:text(fd,"title")||null,body:text(fd,"body")||null,position:(last?.position??-1)+1});
  revalidatePath(`/admin/content/${contentId}`);
}

export async function publishContent(fd:FormData){
  const {supabase}=await requireEditor(); const id=text(fd,"id");
  await supabase.from("content_items").update({status:"published",published_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id);
  revalidatePath(`/admin/content/${id}`); revalidatePath("/artikelen");
}

export async function addSource(fd:FormData){
  const {supabase,user}=await requireEditor();
  await supabase.from("sources").insert({source_type:text(fd,"source_type")||"url",title:text(fd,"title"),publisher:text(fd,"publisher")||null,url:text(fd,"url")||null,description:text(fd,"description")||null,notes:text(fd,"notes")||null,created_by:user.id});
  revalidatePath("/admin/bronnen");
}

export async function addClaim(fd:FormData){
  const {supabase,user}=await requireEditor(); const title=text(fd,"title");
  await supabase.from("claims").insert({slug:slugify(title),title,statement:text(fd,"statement"),claim_type:text(fd,"claim_type")||"factual",evidence_status:text(fd,"evidence_status")||"unverified",confidence:Number(text(fd,"confidence")||"0"),scope:text(fd,"scope")||null,created_by:user.id});
  revalidatePath("/admin/claims");
}

export async function addNode(fd:FormData){
  const {supabase,user}=await requireEditor(); const title=text(fd,"title");
  await supabase.from("knowledge_nodes").insert({slug:slugify(text(fd,"slug")||title),node_type:text(fd,"node_type"),title,description:text(fd,"description")||null,layer:text(fd,"layer")||"material",created_by:user.id});
  revalidatePath("/admin/graph");
}

export async function addRelation(fd:FormData){
  const {supabase,user}=await requireEditor();
  await supabase.from("knowledge_relations").upsert({from_node_id:text(fd,"from_node_id"),to_node_id:text(fd,"to_node_id"),relation_type:text(fd,"relation_type"),statement:text(fd,"statement")||null,certainty:text(fd,"certainty")||"hypothesis",scope:text(fd,"scope")||null,created_by:user.id},{onConflict:"from_node_id,to_node_id,relation_type"});
  revalidatePath("/admin/graph");
}
