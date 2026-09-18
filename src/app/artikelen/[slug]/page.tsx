import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import SharedArticleView from "@/components/publishing/SharedArticleView";
import { readSharedArticle } from "@/lib/publishing/public";
import { articleMetadata } from "@/lib/publishing/seo";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{slug:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> { const item = await readSharedArticle("meridian",(await params).slug); return item ? articleMetadata(item) : {title:"Artikel niet gevonden",robots:{index:false}}; }
export default async function Page({params}:Props) {
  const {slug}=await params, item=await readSharedArticle("meridian",slug);
  if(!item) notFound();
  if(item.slug!==slug) permanentRedirect(`/artikelen/${item.slug}`);
  return <SharedArticleView article={item}/>;
}
