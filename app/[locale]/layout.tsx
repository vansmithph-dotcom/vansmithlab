import { notFound } from "next/navigation";
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
    <html lang={locale}>
      <body>
        <SiteHeader locale={locale} />
        <main>{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
