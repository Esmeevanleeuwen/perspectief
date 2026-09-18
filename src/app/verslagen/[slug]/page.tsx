import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { readSharedReport } from "@/lib/publishing/public";
import { articleOrigin } from "@/lib/publishing/seo";
import ReportView from "@/components/publishing/ReportView";
export const dynamic = "force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> { const report=await readSharedReport("meridian",(await params).slug); const origin=report && articleOrigin(report); return report ? {title:report.title,description:`Inhoudsopgave van ${report.title}`,alternates:origin?{canonical:`${origin}/verslagen/${report.slug}`}:undefined,robots:{index:report.indexable&&!!origin&&process.env.VERCEL_ENV!=="preview"}} : {robots:{index:false}}; }
export default async function Page({params}:Props) { const report=await readSharedReport("meridian",(await params).slug); if(!report) notFound(); return <ReportView report={report}/>; }
