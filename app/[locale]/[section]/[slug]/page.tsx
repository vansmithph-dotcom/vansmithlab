import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArticle } from "@/components/PublishedArticle";
import { getContent, listContent } from "@/lib/content";
import { contentPageMetadata } from "@/lib/content-page-metadata";
import { isLocale } from "@/lib/site-data";

export function generateStaticParams() {
  const releases = listContent().filter((item) => item.content_type !== "encyclopedia" && !item.content_type.endsWith("_profile")).map((item) => ({ locale: item.locale, section: item.content_type === "research" || item.content_type === "case_study" || item.content_type === "visual_analysis" ? "articles" : item.content_type === "collection" ? "collections" : item.content_type, slug: item.slug }));
  return releases.length ? releases : [{ locale: "ru", section: "articles", slug: "__empty" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string; slug: string }> }): Promise<Metadata> {
  const { locale, section, slug } = await params;
  if (!isLocale(locale)) return {};
  const content = getContent(locale, section, slug);
  if (!content) return {};
  return contentPageMetadata(locale, section, content.metadata);
}

export default async function ContentPage({ params }: { params: Promise<{ locale: string; section: string; slug: string }> }) {
  const { locale, section, slug } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale, section, slug);
  if (!content) notFound();
  return <PublishedArticle locale={locale} section={section} content={content} />;
}
