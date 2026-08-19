import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/site-data";
import { SectionPage, sectionGenerateMetadata, sectionGenerateStaticParams } from "@/components/SectionPage";
import { listContent, sectionForContentType, type ContentMetadata } from "@/lib/content";
import { GLOSSARY_SECTIONS } from "@/lib/taxonomy";

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
  const sections = ["encyclopedia", "glossary", ...GLOSSARY_SECTIONS, "articles", "analysis", "timeline", "collections"];
  let allContent: ContentMetadata[] = [];
  for (const section of sections) {
    try {
      const items = listContent(locale, section);
      allContent = allContent.concat(items);
    } catch {
      // Section might not exist or have no content
    }
  }

  const searchData = allContent.map((item) => ({
    ...item,
    href: `/${locale}/${sectionForContentType(item.content_type)}/${item.slug}`,
  }));

  return <SectionPage locale={locale} section={SECTION} config={{ key: SECTION, searchForm: true, searchData }} />;
}
