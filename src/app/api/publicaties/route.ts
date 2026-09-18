import { NextResponse } from "next/server";
import { isPlatform } from "@/lib/publishing/model";
import { readCatalog, readReportCatalog, readSharedArticle, readSharedReport } from "@/lib/publishing/public";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams, platform = p.get("platform");
  const headers = { "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff" };
  if (!isPlatform(platform)) return NextResponse.json({error:"Ongeldig platform"},{status:400,headers});
  const slug = p.get("slug"), report = p.get("report");
  if ((slug && !/^[a-z0-9-]{1,180}$/.test(slug)) || (report && !/^[a-z0-9-]{1,180}$/.test(report))) return NextResponse.json({error:"Ongeldig adres"},{status:400,headers});
  try {
    const offset = Number(p.get("offset") || 0), limit = Number(p.get("limit") || 100);
    if(!Number.isSafeInteger(offset) || offset<0 || !Number.isSafeInteger(limit) || limit<1 || limit>1000) return NextResponse.json({error:"Ongeldige paginering"},{status:400,headers});
    const data = slug ? await readSharedArticle(platform,slug) : report ? await readSharedReport(platform,report) : p.get("reports") === "1" ? await readReportCatalog(platform) : await readCatalog(platform,offset,limit);
    return NextResponse.json(data,{status:data===null?404:200,headers});
  } catch { return NextResponse.json({error:"Publicaties tijdelijk niet beschikbaar"},{status:503,headers}); }
}
