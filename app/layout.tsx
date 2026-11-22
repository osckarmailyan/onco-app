import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SiteNav } from "./components/site-nav";
import { meetingConfig } from "@/lib/meeting-config";
import "./globals.css";

const description = "Индивидуальная поддержка людей, столкнувшихся с онкологическим заболеванием. Спокойный онлайн-разговор с врачом о переживаниях, вопросах и жизни после диагноза.";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.oncoexperts.ru"),
  title: { default: "OncoExperts — с диагнозом не обязательно оставаться один на один", template: "%s | OncoExperts" },
  description,
  openGraph: { title: "OncoExperts — пространство для разговора и поддержки", description, url: "/", siteName: "OncoExperts", locale: "ru_RU", type: "website" },
  twitter: { card: "summary", title: "OncoExperts — разговор и поддержка", description },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f7f3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>
    <a className="skip-link" href="#main-content">Перейти к содержимому</a>
    <SiteNav />
    <div id="main-content" tabIndex={-1}>{children}</div>
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top"><div><Link href="/" className="wordmark">onco<span>experts</span><span className="brand-spark" aria-hidden="true">✳</span></Link><p>Есть вещи, о которых легче говорить с тем, кто понимает.</p></div><a className="footer-contact" href={`mailto:${meetingConfig.supportEmail}`}>{meetingConfig.supportEmail}</a></div>
        <div className="service-boundary"><p>OncoExperts — индивидуальная беседа, информационное общение и поддержка. Встреча не предназначена для постановки диагноза, назначения или изменения лечения и не заменяет приём лечащего врача.</p><p>Это не экстренная помощь. При состояниях, требующих срочного вмешательства, обращайтесь в медицинские службы. Мы не гарантируем улучшения физического или психологического состояния.</p></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} OncoExperts</span><nav aria-label="Правовая информация"><Link href="/terms">Условия услуг</Link><Link href="/privacy">Конфиденциальность</Link><Link href="/consent">Согласие на обработку данных</Link></nav></div>
      </div>
    </footer>
  </body></html>;
}
