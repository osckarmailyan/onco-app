import type { MetadataRoute } from "next";
import { indexableSitePaths, siteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableSitePaths.map(path => ({
    url: siteUrl(path),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/about" ? 0.7 : 0.3,
  }));
}
