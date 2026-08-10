import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale } from "@/lib/site-data";

const SECTION = "glossary/photographers";

export function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = copy[locale].section?.[SECTION] ?? { eyebrow: "Image makers", title: "Photographers", text: "" };
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title ?? "Photographers",
    description: page.text ?? "",
    alternates: {
      canonical: `/${locale}/${SECTION}`,
      languages: { [locale]: `/${locale}/${SECTION}`, [otherLocale]: `/${otherLocale}/${SECTION}`, "x-default": `/ru/${SECTION}` },
    },
  };
}

export default async function PhotographersListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const page = content.section?.[SECTION] ?? { eyebrow: "Image makers" + (locale === "ru" ? "" : ""), title: locale === "ru" ? "\u0424\u043e\u0442\u043e\u0433\u0440\u0430\u0444\u044b" : "Photographers", text: "" };
  const releases = listContent(locale, SECTION);
  const verifiedLabel = locale === "ru" ? "\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438" : "Verified publications";

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.text}</p></div>
        <TrustPanel locale={locale} />
      </div>
      <div className="listing-header"><p>{releases.length ? verifiedLabel : content.labels.comingSoon}</p><span>{(releases.length || 1).toString().padStart(2, "0")}</span></div>
      <div className="listing-grid">
        {releases.length ? releases.map((release, index) => (
          <Link className={`listing-card${release.hero_image ? " listing-card-with-media" : ""}`} href={`/${locale}/${SECTION}/${release.slug}`} key={release.content_id}>
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
        )) : (
          <article className="listing-card">
            <span className="listing-card-copy">
              <span className="listing-card-index">01</span>
              <h2>{locale === "ru" ? "\u0421\u043a\u043e\u0440\u043e" : "Coming soon"}</h2>
              <span className="listing-card-summary">{page.text}</span>
            </span>
          </article>
        )}
      </div>
    </section>
  );
}
