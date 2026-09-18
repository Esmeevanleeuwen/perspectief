import { inlineParts, type LinkTarget } from "@/lib/publishing/model";
export default function LinkedText({ text, targets = {} }: { text: string | null; targets?: Record<string, LinkTarget> }) {
  if (!text) return null;
  return <>{inlineParts(text, targets).map((part, i) => part.href ? <a key={i} href={part.href} className="pub-inline-link">{part.text}</a> : <span key={i}>{part.text}</span>)}</>;
}
