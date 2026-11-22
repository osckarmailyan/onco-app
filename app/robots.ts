import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /request stays crawlable so search engines can read its noindex metadata.
      // Payment tokens, historic request URLs and private routes remain excluded.
      disallow: ["/admin", "/api/", "/success", "/result/"],
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
