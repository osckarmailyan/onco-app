import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const origin=(process.env.NEXT_PUBLIC_SITE_URL || "https://www.oncoexperts.ru").replace(/\/$/, ""); return ["/","/about","/terms","/privacy","/consent"].map(path => ({url:origin+path, changeFrequency:"monthly", priority:path === "/" ? 1 : 0.5})); }
