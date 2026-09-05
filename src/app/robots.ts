import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview } from "@/lib/dossier-platforms";

export default function robots(): MetadataRoute.Robots {
  return isPreview
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/account/", "/auth/"] },
        sitemap: absoluteUrl("/sitemap.xml"),
      };
}
