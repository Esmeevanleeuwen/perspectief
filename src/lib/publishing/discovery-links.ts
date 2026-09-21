import { safeHref, type InlinePart } from "./model";
/** Turn plain source addresses into real links without changing the stored text. */
export function sourceLinks(text: string): InlinePart[] {
  const result: InlinePart[] = [];
  const expression = /https?:\/\/[^\s<>"']+/g;
  let offset = 0;
  for (const match of text.matchAll(expression)) {
    const start = match.index!;
    if (start > offset) result.push({ text: text.slice(offset, start), href: null });
    let address = match[0].replace(/[.,;!]+$/, "");
    while (address.endsWith(")") && (address.match(/\)/g)?.length ?? 0) > (address.match(/\(/g)?.length ?? 0)) address = address.slice(0, -1);
    result.push({ text: address, href: safeHref(address) });
    if (address.length < match[0].length) result.push({ text: match[0].slice(address.length), href: null });
    offset = start + match[0].length;
  }
  if (offset < text.length) result.push({ text: text.slice(offset), href: null });
  return result;
}
