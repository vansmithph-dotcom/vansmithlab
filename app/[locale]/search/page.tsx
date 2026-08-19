import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/site-data";
import { SectionPage, sectionGenerateMetadata, sectionGenerateStaticParams } from "@/components/SectionPage";
import { listContent } from "@/lib/content";

const SECTION = "search";

export { sectionGenerateStaticParams as generateStaticParams };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return sectionGenerateMetadata(locale, SECTION);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeStr } = await params;
  const locale = isLocale(localeStr) ? (localeStr as Locale) : "ru";

  // Load all searchable content server-side
  const sections = ["encyclopedia", "glossary", "articles", "analysis", "timeline", "collections"];
  let allContent: any[] = [];
  for (const section of sections) {
    try {
      const items = listContent(locale, section);
      allContent = allContent.concat(items);
    } catch {
      // Section might not exist or have no content
    }
  }

  return <SectionPage locale={locale} section={SECTION} config={{ key: SECTION, searchForm: true, searchData: allContent }} />;
}
