import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { listContent } from "@/lib/content";
import { copy, isLocale } from "@/lib/site-data";
import { ROLES } from "@/lib/taxonomy";

export function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = copy[locale].section.glossary;
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title,
    description: page.text,
    alternates: {
      canonical: `/${locale}/glossary`,
      languages: { [locale]: `/${locale}/glossary`, [otherLocale]: `/${otherLocale}/glossary`, "x-default": "/ru/glossary" },
    },
  };
}

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const page = content.section.glossary;

  // Counts come from the corpus, never from a hand-maintained number. A role with
  // no entries is still listed: naming the empty branch is what turns an absence
  // into a commissionable gap rather than an invisible one.
  const sections = ROLES.map((role) => ({
    ...role,
    href: `/glossary/${role.route}`,
    count: listContent(locale, `glossary/${role.route}`).length,
  })).sort((a, b) => b.count - a.count);

  const filled = sections.filter((s) => s.count > 0);
  const planned = sections.filter((s) => s.count === 0);
  const entriesLabel = locale === "ru" ? "материалов" : "entries";

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
        <p>{locale === "ru" ? "Разделы глоссария" : "Glossary sections"}</p>
        <span>{String(filled.length).padStart(2, "0")}</span>
      </div>
      <div className="listing-grid">
        {filled.map((item, index) => (
          <Link className="listing-card" href={`/${locale}${item.href}`} key={item.role}>
            <span className="listing-card-copy">
              <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
              <h2>{locale === "ru" ? item.ru : item.en}</h2>
              <span className="listing-card-summary">{locale === "ru" ? item.descRu : item.descEn}</span>
              <span className="listing-card-meta">
                <small>{item.count} {entriesLabel}</small>
                <i>{content.labels.read} ↗</i>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {planned.length > 0 && (
        <>
          <div className="listing-header">
            <p>{locale === "ru" ? "Разделы без материалов" : "Sections with no entries yet"}</p>
            <span>{String(planned.length).padStart(2, "0")}</span>
          </div>
          <div className="listing-grid">
            {planned.map((item, index) => (
              <div className="listing-card" key={item.role}>
                <span className="listing-card-copy">
                  <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
                  <h2>{locale === "ru" ? item.ru : item.en}</h2>
                  <span className="listing-card-summary">{locale === "ru" ? item.descRu : item.descEn}</span>
                  <span className="listing-card-meta">
                    <small>0 {entriesLabel}</small>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
