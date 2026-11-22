import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent:"*", allow:"/", disallow:["/admin", "/api/", "/success", "/result/", "/request"] }, sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.oncoexperts.ru").replace(/\/$/, "")}/sitemap.xml` }; }
