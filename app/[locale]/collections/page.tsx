import type { Metadata } from "next";
import { SectionPage, sectionGenerateMetadata, sectionGenerateStaticParams } from "@/components/SectionPage";

const SECTION = "collections";

export { sectionGenerateStaticParams as generateStaticParams };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return sectionGenerateMetadata(locale, SECTION);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <SectionPage locale={locale} section={SECTION} config={{ key: SECTION, searchForm: false }} />;
}
