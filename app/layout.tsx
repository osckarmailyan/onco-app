import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SiteNav } from "./components/site-nav";
import { AnalyticsEvents } from "./components/analytics-events";
import { meetingConfig } from "@/lib/meeting-config";
import { createPageMetadata, siteDescription, siteOrigin, siteTitle } from "@/lib/site-metadata";
import "./globals.css";

const defaultMetadata = createPageMetadata({ title: siteTitle, description: siteDescription, path: "/" });
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: siteTitle, template: "%s | OncoExperts" },
  description: siteDescription,
  openGraph: defaultMetadata.openGraph,
  twitter: defaultMetadata.twitter,
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f7f3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>
    <a className="skip-link" href="#main-content">Перейти к содержимому</a>
    <AnalyticsEvents />
    <SiteNav />
    <div id="main-content" tabIndex={-1}>{children}</div>
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top"><div><Link href="/" className="wordmark">onco<span>experts</span><span className="brand-spark" aria-hidden="true">✳</span></Link><p>Есть вещи, о которых легче говорить с тем, кто понимает.</p></div><a data-analytics-event="contact_click" data-analytics-placement="footer" className="footer-contact" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a></div>
        <div className="service-boundary"><p>OncoExperts — индивидуальная беседа, информационное общение и поддержка. Встреча не предназначена для постановки диагноза, назначения или изменения лечения и не заменяет приём лечащего врача.</p><p>Это не экстренная помощь. При состояниях, требующих срочного вмешательства, обращайтесь в медицинские службы. Мы не гарантируем улучшения физического или психологического состояния.</p></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} OncoExperts</span><nav aria-label="Правовая информация"><Link href="/terms">Условия услуг</Link><Link href="/privacy">Конфиденциальность</Link><Link href="/consent">Согласие на обработку данных</Link></nav></div>
      </div>
    </footer>
  </body></html>;
}
