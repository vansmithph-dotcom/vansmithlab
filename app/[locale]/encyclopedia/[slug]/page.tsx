import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { PublishedArticle } from "@/components/PublishedArticle";
import { findTranslation, getContent, listContent, localeAlternates } from "@/lib/content";
import { copy, isLocale, objectSamples } from "@/lib/site-data";

export function generateStaticParams() {
  const samples = objectSamples.flatMap((object) => ["ru", "en"].map((locale) => ({ locale, slug: object.slug })));
  const releases = listContent().filter((item) => item.content_type === "encyclopedia").map((item) => ({ locale: item.locale, slug: item.slug }));
  return [...samples, ...releases].filter((item, index, all) => all.findIndex((candidate) => candidate.locale === item.locale && candidate.slug === item.slug) === index);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const published = getContent(locale, "encyclopedia", slug);
  const canonical = `/${locale}/encyclopedia/${slug}`;
  if (published) {
    const { title, summary, hero_image: heroImage, content_id: contentId } = published.metadata;
    const images = heroImage ? [{ url: heroImage.src, alt: heroImage.alt }] : undefined;
    const translation = findTranslation(contentId, locale === "ru" ? "en" : "ru");
    return {
      title,
      description: summary,
      alternates: { canonical, languages: localeAlternates(locale, canonical, translation) },
      openGraph: { title, description: summary, type: "article", images },
      twitter: { card: "summary_large_image", title, description: summary, images: images?.map((image) => image.url) },
    };
  }
  const object = objectSamples.find((item) => item.slug === slug);
  if (!object) return {};
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: object.title[locale],
    description: object.summary[locale],
    alternates: {
      canonical,
      languages: { [locale]: canonical, [otherLocale]: `/${otherLocale}/encyclopedia/${slug}`, "x-default": `/ru/encyclopedia/${slug}` },
    },
    robots: { index: false, follow: true },
  };
}

export default async function ObjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const published = getContent(locale, "encyclopedia", slug);
  if (published) return <PublishedArticle locale={locale} section="encyclopedia" content={published} />;
  const object = objectSamples.find((item) => item.slug === slug);
  if (!object) notFound();
  const labels = copy[locale].labels;

  return (
    <article className="shell object-page">
      <Link className="back-link" href={`/${locale}/encyclopedia`}>← {locale === "ru" ? "Энциклопедия" : "Encyclopedia"}</Link>
      <header className="object-header"><div><p className="eyebrow">{object.type[locale]} · VSL / {object.slug.toUpperCase()}</p><h1>{object.title[locale]}</h1><p>{object.summary[locale]}</p></div><TrustPanel locale={locale} /></header>
      <div className="object-body"><section><p className="eyebrow">{locale === "ru" ? "Статус объекта" : "Object status"}</p><h2>{labels.comingSoon}</h2><p>{locale === "ru" ? "Эта страница демонстрирует будущую структуру энциклопедии. После подключения knowledge engine здесь появятся проверенные claims, источники, хронология, локализации и связанные объекты." : "This page demonstrates the future encyclopedia structure. After the knowledge engine is connected, it will display verified claims, sources, chronology, localizations and related objects."}</p></section><section className="object-facts"><div><span>{labels.sources}</span><strong>—</strong></div><div><span>{labels.related}</span><strong>—</strong></div><div><span>{labels.reviewed}</span><strong>—</strong></div></section></div>
    </article>
  );
}
