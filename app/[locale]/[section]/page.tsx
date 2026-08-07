import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale, objectSamples, sectionKeys } from "@/lib/site-data";

export function generateStaticParams() {
  return sectionKeys.flatMap((section) => ["ru", "en"].map((locale) => ({ locale, section })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in copy[locale].section)) return {};
  const page = copy[locale].section[section];
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title,
    description: page.text,
    alternates: {
      canonical: `/${locale}/${section}`,
      languages: { [locale]: `/${locale}/${section}`, [otherLocale]: `/${otherLocale}/${section}`, "x-default": `/ru/${section}` },
    },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in copy[locale].section)) notFound();
  const content = copy[locale];
  const page = content.section[section];
  const isSearch = section === "search";
  const releases = listContent(locale, section);

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.text}</p></div>
        <TrustPanel locale={locale} />
      </div>
      {isSearch && <form className="search-form" role="search"><label htmlFor="query">{content.search}</label><div><input id="query" name="q" placeholder={content.search} /><button type="submit">↗</button></div></form>}
      <div className="listing-header"><p>{releases.length ? (locale === "ru" ? "Проверенные публикации" : "Verified publications") : content.labels.comingSoon}</p><span>{(releases.length || page.items.length).toString().padStart(2, "0")}</span></div>
      <div className="listing-grid">
        {releases.length ? releases.map((release, index) => (
          <Link className={`listing-card${release.hero_image ? " listing-card-with-media" : ""}`} href={`/${locale}/${section}/${release.slug}`} key={release.content_id}>
            <span className="listing-card-copy">
              <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{release.title}</h2>
              <span className="listing-card-summary">{release.summary}</span>
              <span className="listing-card-meta"><small>{release.verification_state.replaceAll("_", " ")} · {Math.round(release.confidence_score * 100)}%</small><i>{content.labels.read} →</i></span>
            </span>
            {release.hero_image && <span className="listing-card-media">
              <Image alt={release.hero_image.alt} fill sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 1280px) 50vw, 608px" src={release.hero_image.src} />
            </span>}
          </Link>
        )) : page.items.map((item, index) => {
          const sample = objectSamples[index % objectSamples.length];
          const href = section === "encyclopedia" ? `/${locale}/encyclopedia/${sample.slug}` : `/${locale}/${section}`;
          return <Link className="listing-card" href={href} key={`${item}-${index}`}>
            <span className="listing-card-copy">
              <span className="listing-card-index">0{index + 1}</span>
              <h2>{item}</h2>
              <span className="listing-card-summary">{section === "encyclopedia" ? sample.summary[locale] : page.text}</span>
              <span className="listing-card-meta"><small>{section === "analysis" ? "ESSAY" : "KNOWLEDGE"}</small><i>{content.labels.read} ↗</i></span>
            </span>
          </Link>;
        })}
      </div>
    </section>
  );
}
