import Link from "next/link";
import { requireEditor } from "@/lib/auth/roles";
export default async function AdminLayout({children}:{children:React.ReactNode}){
  const {role}=await requireEditor();
  return <main className="min-h-screen bg-[#f6f3ee] text-[#102633]"><header className="border-b border-[#102633]/10 bg-[#fbfaf7]"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-6 px-6 py-5"><Link href="/" className="font-serif text-2xl no-underline">MERIDIAN</Link><span className="text-xs uppercase tracking-[0.16em] text-[#ad6540]">redactie</span><nav className="ml-auto flex flex-wrap gap-5 text-sm"><Link href="/admin">Dashboard</Link><Link href="/admin/content">Content</Link><Link href="/admin/bronnen">Bronnen</Link><Link href="/admin/claims">Claims</Link><Link href="/admin/graph">Graph</Link><Link href="/account">Account</Link></nav><span className="text-xs opacity-40">{role}</span></div></header>{children}</main>;
}
