import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArticle } from "@/components/PublishedArticle";
import { getContent, listContent } from "@/lib/content";
import { contentPageMetadata } from "@/lib/content-page-metadata";
import { isLocale } from "@/lib/site-data";

const SECTION = "glossary/designers";

export function generateStaticParams() {
  const releases = listContent().filter((item) => item.content_type === "designer_profile").map((item) => ({ locale: item.locale, slug: item.slug }));
  return releases.length ? releases : [{ locale: "ru", slug: "__empty" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const content = getContent(locale, SECTION, slug);
  if (!content) return {};
  return contentPageMetadata(locale, SECTION, content.metadata);
}

export default async function DesignerProfilePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale, SECTION, slug);
  if (!content) notFound();
  return <PublishedArticle locale={locale} section={SECTION} content={content} />;
}
