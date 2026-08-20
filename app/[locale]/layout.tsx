import { notFound } from "next/navigation";
import { fontVariables } from "@/app/fonts";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales } from "@/lib/site-data";
import { siteMetadata } from "@/lib/site-metadata";
import "../globals.css";

export const metadata = siteMetadata;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html className={fontVariables} lang={locale}>
      <head>
        <link href="/feed.xml" rel="alternate" title="VANSMITHLAB — new materials" type="application/rss+xml" />
        <link href="/collections.xml" rel="alternate" title="VANSMITHLAB — collections" type="application/atom+xml" />
      </head>
      <body>
        <SiteHeader locale={locale} />
        <main>{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
