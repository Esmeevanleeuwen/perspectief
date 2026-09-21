import "server-only";
import { after } from "next/server";
import { readCatalogAll } from "./public";
import { discoveryUrl } from "./discovery";
import config from "./discovery-config.json";

/** Best-effort immediate notification. The scheduled sitemap sweep retries misses.
 * Only called after a confirmed successful publication. No private data or session
 * is sent to a search engine; 200/202 means received, never "indexed".
 */
export function queueDiscoveryNotice(id: string) {
  if (process.env.VERCEL_ENV !== "production") return;
  try {
    after(async () => {
      try {
        const item = (await readCatalogAll("meridian")).find(article => article.id === id);
        const url = item && discoveryUrl(item);
        if (!url || new URL(url).origin !== config.origin) return;
        const response = await fetch(config.endpoint, {
          method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ host: config.host, key: config.key, keyLocation: `${config.origin}/${config.key}.txt`, urlList: [url] }),
          signal: AbortSignal.timeout(8000), cache: "no-store", redirect: "error",
        });
        console.info("article_discovery", { url, httpStatus: response.status,
          received: response.status === 200 || response.status === 202, indexed: "unknown" });
      } catch { console.warn("article_discovery: notification failed; scheduled sweep will retry."); }
    });
  } catch { console.warn("article_discovery: after-response hook unavailable; scheduled sweep will retry."); }
}
