import Link from "next/link";
import type { Locale } from "@/lib/site-data";
import { copy } from "@/lib/site-data";

export function SiteHeader({ locale }: { locale: Locale }) {
  const content = copy[locale];
  const alternateLocale = locale === "ru" ? "en" : "ru";
  const menuLabel = locale === "ru" ? "Меню" : "Menu";
  const navigationLabel = locale === "ru" ? "Основная навигация" : "Primary navigation";

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href={`/${locale}`} aria-label="VANSMITHLAB home">
          VANSMITHLAB<span>®</span>
        </Link>
        <nav className="primary-nav" aria-label={navigationLabel}>
          {content.nav.map((item) => (
            <Link key={item.href} href={`/${locale}${item.href}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="search-link" href={`/${locale}/search`} aria-label={content.search}>
            <span aria-hidden="true">⌕</span>
            <span className="visually-hidden">{content.search}</span>
          </Link>
          <Link className="language-link" href={`/${alternateLocale}`} lang={alternateLocale}>
            {content.language}
          </Link>
          <details className="mobile-menu">
            <summary aria-label={menuLabel}>
              <span aria-hidden="true" className="menu-icon"><i /><i /></span>
              <span>{menuLabel}</span>
            </summary>
            <nav className="mobile-nav" aria-label={navigationLabel}>
              {content.nav.map((item, index) => (
                <Link key={item.href} href={`/${locale}${item.href}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
