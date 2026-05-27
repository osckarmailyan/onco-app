import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.oncoexperts.ru",
  ),
  title: {
    default: "OncoExperts - второе мнение онколога",
    template: "%s | OncoExperts",
  },
  description:
    "Независимое второе мнение онколога-уролога по медицинским документам, диагнозу и плану лечения.",
  openGraph: {
    title: "OncoExperts - второе мнение онколога",
    description:
      "Разбор медицинских документов и плана лечения онкологом-урологом.",
    url: "/",
    siteName: "OncoExperts",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  );
}
