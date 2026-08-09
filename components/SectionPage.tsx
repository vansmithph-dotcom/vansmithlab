import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale, objectSamples } from "@/lib/site-data";

export type SectionConfig = {
  key: string;
  noDetailRoutes?: boolean;
  searchForm?: boolean;
};

export function sectionGenerateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function sectionGenerateMetadata(
  locale: string,
  section: string
): Promise<Metadata> {
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

export function SectionPage({ locale, section, config }: { locale: string; section: string; config: SectionConfig }) {
  if (!isLocale(locale) || !(section in copy[locale].section)) notFound();
  const content = copy[locale];
  const page = content.section[section];
  const releases = listContent(locale, section);
  const hasContent = releases.length > 0;

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

      {config.searchForm && (
        <form className="search-form" role="search" action={`/${locale}/search`} method="get">
          <label htmlFor="section-query">{content.search}</label>
          <div>
            <input id="section-query" name="q" placeholder={content.search} />
            <button type="submit" aria-label={content.search}>⌕</button>
          </div>
        </form>
      )}

      <div className="listing-header">
        <p>
          {hasContent
            ? (locale === "ru" ? "Проверенные публикации" : "Verified publications")
            : content.labels.comingSoon}
        </p>
        <span>{(releases.length || page.items.length).toString().padStart(2, "0")}</span>
      </div>

      <div className="listing-grid">
        {hasContent
          ? releases.map((release, index) => (
              <Link
                className="listing-card listing-card-with-media"
                href={`/${locale}/${section}/${release.slug}`}
                key={release.content_id}
              >
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
                {!release.hero_image && (
                  <span className="listing-card-visual-placeholder" aria-label={locale === "ru" ? "Визуальный материал готовится" : "Visual material in preparation"}>
                    <span className="listing-card-placeholder-mark" aria-hidden="true" />
                    <small>{locale === "ru" ? "Визуальный материал" : "Visual material"}</small>
                  </span>
                )}
              </Link>
            ))
          : page.items.map((item, index) => {
              const sample = objectSamples[index % objectSamples.length];
              const href = config.noDetailRoutes ? `/${locale}/${section}` : `/${locale}/${section}/${sample.slug}`;
              return (
                <Link className="listing-card" href={href} key={`${item}-${index}`}>
                  <span className="listing-card-copy">
                    <span className="listing-card-index">0{index + 1}</span>
                    <h2>{item}</h2>
                    <span className="listing-card-summary">{section === "analysis" ? "ESSAY" : "KNOWLEDGE"}</span>
                    <span className="listing-card-meta">
                      <small>{section === "analysis" ? "ESSAY" : "KNOWLEDGE"}</small>
                      <i>{content.labels.comingSoon}</i>
                    </span>
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
