import type { Metadata } from "next";

/** Public canonical URLs always use the production domain, including in previews. */
export const siteOrigin = "https://www.oncoexperts.ru";
export const siteDescription = "Индивидуальная онлайн-встреча с врачом-онкологом Оскаром Маиляном. Спокойный разговор о переживаниях, вопросах и жизни после онкологического диагноза.";
export const siteTitle = "OncoExperts — с диагнозом не обязательно оставаться один на один";
export const socialImageAlt = "OncoExperts — индивидуальная онлайн-встреча с врачом-онкологом";

export type PublicSitePath = "/" | "/about" | "/request" | "/terms" | "/privacy" | "/consent";
export const indexableSitePaths: PublicSitePath[] = ["/", "/about", "/terms", "/privacy", "/consent"];

export function siteUrl(path: PublicSitePath) {
  return new URL(path, siteOrigin).toString();
}

export function createPageMetadata({ title, description, path, index = true, follow = true }: {
  title: string;
  description: string;
  path: PublicSitePath;
  index?: boolean;
  follow?: boolean;
}): Metadata {
  const socialTitle = title.includes("OncoExperts") ? title : `${title} | OncoExperts`;
  const image = { url: `${siteOrigin}/opengraph-image`, width: 1200, height: 630, alt: socialImageAlt };
  return {
    title: title.includes("OncoExperts") ? { absolute: title } : title,
    description,
    alternates: { canonical: siteUrl(path) },
    robots: { index, follow },
    openGraph: {
      title: socialTitle,
      description,
      url: siteUrl(path),
      siteName: "OncoExperts",
      locale: "ru_RU",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
  };
}
