import { notFound, redirect } from "next/navigation";
import { readArticleAddress } from "@/lib/publishing/public";
import { safeOrigin, uuidPattern } from "@/lib/publishing/model";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;if(!uuidPattern.test(id))notFound();
 const address=await readArticleAddress(id);if(!address)notFound();
 if(address.platform==="meridian")redirect(`/artikelen/${address.slug}`);
 const origin=safeOrigin(address.origin);if(!origin)notFound();redirect(`${origin}/artikelen/${address.slug}`);
}
