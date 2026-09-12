import Link from "next/link";
import { research as staticResearch } from "@/app/data/research";
import { getPublishedResearch, mediaPath } from "@/lib/admin/content";

export const revalidate = 300;
export const metadata = {
  title: "Onderzoeken | Meridian",
  description: "Doorlopende Meridian-onderzoeken, opgebouwd uit vragen, bronnen, artikelen en zichtbare onzekerheid.",
};

export default async function ResearchIndexPage() {
  const cmsResearch = await getPublishedResearch();
  const known = new Set(cmsResearch.map((item) => item.slug));
  const items = [
    ...cmsResearch.map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary ?? "",
      eyebrow: item.eyebrow ?? "ONDERZOEK",
      image: mediaPath(item.hero_image),
      imageAlt: item.image_alt ?? item.title,
    })),
    ...staticResearch.filter((item) => !known.has(item.slug)).map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      eyebrow: item.label,
      image: item.image,
      imageAlt: item.imageAlt,
    })),
  ];

  return (
    <main className="mx-auto max-w-[1280px] pb-24 pt-16">
      <header className="border-b border-[#102534]/15 pb-14">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9a6748]">Meridian / onderzoeken</p>
        <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] md:text-7xl">Onderzoeken blijven open terwijl de informatie groeit.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#102534]/65">Bekijk de centrale vraag, methode, onderdelen en publicaties die binnen ieder onderzoek met elkaar verbonden zijn.</p>
      </header>

      <section className="grid gap-px bg-[#102534]/10 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.slug} href={`/onderzoek/${item.slug}`} className="group flex min-h-[420px] flex-col bg-[#fcfaf7] p-7 text-inherit no-underline hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#9a6748] md:p-9">
            {item.image ? <div className="aspect-[16/9] overflow-hidden bg-[#102534]/5"><img src={item.image} alt={item.imageAlt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" /></div> : <div className="aspect-[16/9] bg-[#102534]" />}
            <p className="mt-7 text-xs uppercase tracking-[0.18em] text-[#9a6748]">{item.eyebrow}</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.025em]">{item.title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#102534]/60">{item.summary}</p>
            <span className="mt-auto pt-8 text-sm">Open onderzoek →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
