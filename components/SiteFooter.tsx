import Link from "next/link";
import type { Locale } from "@/lib/site-data";
import { copy } from "@/lib/site-data";
import { pinterestUrl } from "@/lib/structured-data";

export function SiteFooter({ locale }: { locale: Locale }) {
  const content = copy[locale];

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="footer-wordmark">VANSMITHLAB<span>®</span></p>
          <p>{content.footerText}</p>
        </div>
        <div className="footer-links">
          <Link href={`/${locale}/about`}>{locale === "ru" ? "Метод" : "Method"}</Link>
          <Link href={`/${locale}/glossary`}>{locale === "ru" ? "Глоссарий" : "Glossary"}</Link>
          <Link href={`/${locale}/search`}>{content.search}</Link>
          <Link href={`/${locale}/privacy`}>{locale === "ru" ? "Конфиденциальность" : "Privacy"}</Link>
          <a href={pinterestUrl} rel="me noreferrer" target="_blank">Pinterest ↗</a>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} VANSMITHLAB</p>
      </div>
    </footer>
  );
}
