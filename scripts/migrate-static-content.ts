import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { articles } from "../src/app/data/articles";
import { research } from "../src/app/data/research";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key) throw new Error("NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn lokaal vereist.");
const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

async function main(){
  for(const r of research){
    const {data:item,error}=await supabase.from("content_items").upsert({slug:r.slug,content_type:"research",title:r.title,eyebrow:r.label,summary:r.summary,hero_image:r.image,image_alt:r.imageAlt,featured:r.featured,status:"published"},{onConflict:"slug"}).select("id").single(); if(error) throw error;
    await supabase.from("research_dossiers").upsert({content_id:item.id,central_question:r.question,method:r.method,dimensions:r.dimensions});
    await supabase.from("content_sections").delete().eq("content_id",item.id); let pos=0;
    for(const s of r.sections){if(s.title) await supabase.from("content_sections").insert({content_id:item.id,section_type:"heading",position:pos++,title:s.title,data:{eyebrow:s.eyebrow,id:s.id}}); if(s.intro) await supabase.from("content_sections").insert({content_id:item.id,section_type:"intro",position:pos++,body:s.intro}); for(const p of s.paragraphs) await supabase.from("content_sections").insert({content_id:item.id,section_type:"paragraph",position:pos++,body:p});}
  }
  for(const a of articles){
    const {data:item,error}=await supabase.from("content_items").upsert({slug:a.slug,content_type:a.label==="CASUS"?"case":"article",title:a.title,eyebrow:a.label,summary:a.description,hero_image:a.image,featured:a.featured,featured_position:a.featuredPosition??null,status:"published"},{onConflict:"slug"}).select("id").single(); if(error) throw error;
    await supabase.from("content_sections").delete().eq("content_id",item.id);
    for(let i=0;i<a.content.length;i++) await supabase.from("content_sections").insert({content_id:item.id,section_type:a.content[i].type,position:i,body:a.content[i].text});
    if(a.researchSlug){const {data:parent}=await supabase.from("content_items").select("id").eq("slug",a.researchSlug).eq("content_type","research").maybeSingle(); if(parent) await supabase.from("research_children").upsert({research_content_id:parent.id,child_content_id:item.id,relation:"part_of"});}
  }
  console.log("Static content migrated.");
}
main().catch(e=>{console.error(e);process.exit(1)});
