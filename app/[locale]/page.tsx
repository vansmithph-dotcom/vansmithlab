import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedAnalysisRotator } from "@/components/FeaturedAnalysisRotator";
import { SubscriptionPanel } from "@/components/SubscriptionPanel";
import { contentHref, listContent } from "@/lib/content";
import { copy, isLocale } from "@/lib/site-data";

export function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = copy[locale];
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: content.heroEyebrow,
    description: content.heroText,
    alternates: {
      canonical: `/${locale}`,
      languages: { [locale]: `/${locale}`, [otherLocale]: `/${otherLocale}`, "x-default": "/ru" },
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const allContent = listContent(locale);
  const heroArtAlt = locale === "ru"
    ? "Скульптурная композиция объединяет ткань, архитектурный макет, стекло, металл, фотоплёнку и инструменты проектирования."
    : "A sculptural composition brings together textile, an architectural model, glass, metal, photographic film and design tools.";
  const heroArtCaption = locale === "ru" ? "VANSMITHLAB · AI-иллюстрация" : "VANSMITHLAB · AI illustration";
  const featuredAnalysis = allContent.filter((item) => item.content_type === "analysis" && item.hero_image)
    .sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed)).slice(0, 5)
    .map((item) => ({ content_id: item.content_id, title: item.title, summary: item.summary, hero_image: item.hero_image, href: contentHref(item) }));
  const firstRoutes = ["encyclopedia", "articles", "analysis", "glossary", "collections"]
    .map((section) => allContent.filter((item) => contentHref(item).startsWith(`/${locale}/${section}/`))
      .sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed))[0])
    .filter((item) => item !== undefined);

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">{content.heroEyebrow}</p>
          <h1>{content.heroTitle}</h1>
          <p className="hero-text">{content.heroText}</p>
          <div className="hero-actions">
            <Link className="button button-dark" href={`/${locale}/encyclopedia`}>{content.explore}<span>↗</span></Link>
            <Link className="text-link" href={`/${locale}/about`}>{content.methodology}<span>→</span></Link>
          </div>
        </div>
        <figure className="hero-art">
          <Image
            alt={heroArtAlt}
            fill
            preload
            sizes="(max-width: 900px) calc(100vw - 32px), 42vw"
            src="/images/site/homepage-research-object-hero-v1.webp"
          />
          <figcaption>{heroArtCaption}</figcaption>
        </figure>
      </section>

      <section className="trust-section">
        <div className="shell trust-layout"><div><p className="eyebrow">VANSMITHLAB OS</p><h2>{content.trustTitle}</h2></div><p>{content.trustText}</p></div>
      </section>

      <section className="shell section-block process-block">
        <div className="section-heading"><div><p className="eyebrow">Method</p><h2>{content.processTitle}</h2></div></div>
        <div className="process-grid">{content.process.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </section>

      <FeaturedAnalysisRotator items={featuredAnalysis} locale={locale} />

      <section className="shell sample-section">
        <div className="section-heading"><div><p className="eyebrow">{locale === "ru" ? "Начать исследование" : "Start exploring"}</p><h2>{locale === "ru" ? "Маршруты по базе" : "Routes through the library"}</h2></div><p>{locale === "ru" ? "Пять входов в разные типы знаний: понятие, исследование, эссе, автор и коллекция." : "Five entry points into different kinds of knowledge: a concept, research, an essay, a maker and a collection."}</p></div>
        <div className="route-grid">{firstRoutes.map((item, index) => <Link className="route-card" href={contentHref(item)} key={item.content_id}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.summary}</p><i>{locale === "ru" ? "Открыть" : "Open"} →</i></Link>)}</div>
      </section>

      <div className="shell"><SubscriptionPanel locale={locale} /></div>
    </>
  );
}
