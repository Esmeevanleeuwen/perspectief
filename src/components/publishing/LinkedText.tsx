import { inlineParts, type LinkTarget } from "@/lib/publishing/model";
import { sourceLinks } from "@/lib/publishing/discovery-links";
export default function LinkedText({ text, targets = {} }: { text: string | null; targets?: Record<string, LinkTarget> }) {
  if (!text) return null;
  const parts = inlineParts(text, targets).flatMap(part => part.href ? [part] : sourceLinks(part.text));
  return <>{parts.map((part, i) => part.href ? <a key={i} href={part.href} className="pub-inline-link">{part.text}</a> : <span key={i}>{part.text}</span>)}</>;
}
