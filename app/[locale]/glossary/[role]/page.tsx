import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale } from "@/lib/site-data";
import { ROLES, roleByRoute } from "@/lib/taxonomy";

// Roles that already have their own page file are excluded here: a static
// sibling and a generated dynamic route would produce the same path twice
// during export.
const dynamicRoles = ROLES.filter((role) => !role.hasStaticPage);

export function generateStaticParams() {
  return ["ru", "en"].flatMap((locale) => dynamicRoles.map((role) => ({ locale, role: role.route })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; role: string }> }): Promise<Metadata> {
  const { locale, role } = await params;
  const def = roleByRoute(role);
  if (!isLocale(locale) || !def) return {};
  const title = locale === "ru" ? def.ru : def.en;
  const description = locale === "ru" ? def.descRu : def.descEn;
  const otherLocale = locale === "ru" ? "en" : "ru";
  const path = `/${locale}/glossary/${role}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { [locale]: path, [otherLocale]: `/${otherLocale}/glossary/${role}`, "x-default": `/ru/glossary/${role}` },
    },
  };
}

export default async function RoleListingPage({ params }: { params: Promise<{ locale: string; role: string }> }) {
  const { locale, role } = await params;
  const def = roleByRoute(role);
  if (!isLocale(locale) || !def) notFound();
  const content = copy[locale];
  const section = `glossary/${def.route}`;
  const releases = listContent(locale, section);
  const title = locale === "ru" ? def.ru : def.en;
  const description = locale === "ru" ? def.descRu : def.descEn;

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{content.section.glossary.eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <TrustPanel locale={locale} />
      </div>
      <div className="listing-header">
        <p>{releases.length ? (locale === "ru" ? "Материалы раздела" : "Entries in this section") : content.labels.comingSoon}</p>
        <span>{String(releases.length).padStart(2, "0")}</span>
      </div>
      <div className="listing-grid">
        {releases.map((release, index) => (
          <Link className={`listing-card${release.hero_image ? " listing-card-with-media" : ""}`} href={`/${locale}/${section}/${release.slug}`} key={release.content_id}>
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
        ))}
      </div>
    </section>
  );
}
