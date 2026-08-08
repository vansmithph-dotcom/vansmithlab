import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale, objectSamples } from "@/lib/site-data";

export function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = copy[locale].section.encyclopedia;
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title,
    description: page.text,
    alternates: {
      canonical: `/${locale}/encyclopedia`,
      languages: { [locale]: `/${locale}/encyclopedia`, [otherLocale]: `/${otherLocale}/encyclopedia`, "x-default": "/ru/encyclopedia" },
    },
  };
}

export default async function EncyclopediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const page = content.section.encyclopedia;
  const releases = listContent(locale, "encyclopedia");

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
        </div>
        <TrustPanel locale={locale} />
      </div>
      <div className="listing-header">
        <p>{releases.length ? (locale === "ru" ? "Проверенные публикации" : "Verified publications") : content.labels.comingSoon}</p>
        <span>{(releases.length || page.items.length).toString().padStart(2, "0")}</span>
      </div>
      <div className="listing-grid">
        {releases.length
          ? releases.map((release, index) => (
              <Link className={`listing-card${release.hero_image ? " listing-card-with-media" : ""}`} href={`/${locale}/encyclopedia/${release.slug}`} key={release.content_id}>
                <span className="listing-card-copy">
                  <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
                  <h2>{release.title}</h2>
                  <span className="listing-card-summary">{release.summary}</span>
                  <span className="listing-card-meta">
                    <small>{release.verification_state.replaceAll("_", " ")} · {Math.round(release.confidence_score * 100)}%</small>
                    <i>{content.labels.read} →</i>
                  </span>
                </span>
                {release.hero_image && (
                  <span className="listing-card-media">
                    <Image alt={release.hero_image.alt} fill sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 1280px) 50vw, 608px" src={release.hero_image.src} />
                  </span>
                )}
              </Link>
            ))
          : page.items.map((item, index) => {
              const sample = objectSamples[index % objectSamples.length];
              return (
                <Link className="listing-card" href={`/${locale}/encyclopedia/${sample.slug}`} key={`${item}-${index}`}>
                  <span className="listing-card-copy">
                    <span className="listing-card-index">0{index + 1}</span>
                    <h2>{item}</h2>
                    <span className="listing-card-summary">{sample.summary[locale]}</span>
                    <span className="listing-card-meta">
                      <small>KNOWLEDGE</small>
                      <i>{content.labels.read} ↗</i>
                    </span>
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
