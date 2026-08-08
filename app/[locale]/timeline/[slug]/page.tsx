import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArticle } from "@/components/PublishedArticle";
import { findTranslation, getContent, listContent, localeAlternates } from "@/lib/content";
import { isLocale } from "@/lib/site-data";

const SECTION = "timeline";

export function generateStaticParams() {
  const releases = listContent().filter((item) => {
    const ct = item.content_type;
    if (SECTION === "timeline") return ct === "timeline";
    return false;
  }).map((item) => ({ locale: item.locale, slug: item.slug }));
  return releases.length ? releases : [{ locale: "ru", slug: "__empty" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const content = getContent(locale, SECTION, slug);
  if (!content) return {};
  const { title, summary, hero_image: heroImage, content_id: contentId } = content.metadata;
  const images = heroImage ? [{ url: heroImage.src, alt: heroImage.alt }] : undefined;
  const canonical = `/${locale}/${SECTION}/${slug}`;
  const translation = findTranslation(contentId, locale === "ru" ? "en" : "ru");
  return {
    title,
    description: summary,
    alternates: { canonical, languages: localeAlternates(locale, canonical, translation) },
    openGraph: { title, description: summary, type: "article", images },
    twitter: { card: "summary_large_image", title, description: summary, images: images?.map((image) => image.url) },
  };
}

export default async function SectionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale, SECTION, slug);
  if (!content) notFound();
  return <PublishedArticle locale={locale} section={SECTION} content={content} />;
}
