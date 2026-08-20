import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/site-data";
import { contentHrefForObject, listTimelineYears } from "@/lib/timeline";

const SECTION = "timeline";

export function generateStaticParams() {
  return ["ru", "en"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = copy[locale].section[SECTION];
  const otherLocale = locale === "ru" ? "en" : "ru";
  return {
    title: page.title,
    description: page.text,
    alternates: {
      canonical: `/${locale}/${SECTION}`,
      languages: { [locale]: `/${locale}/${SECTION}`, [otherLocale]: `/${otherLocale}/${SECTION}`, "x-default": `/ru/${SECTION}` },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const page = content.section[SECTION];
  const years = listTimelineYears(locale);

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
        </div>
      </div>

      <div className="listing-header">
        <p>{locale === "ru" ? "Датированные события и периоды" : "Dated events and periods"}</p>
        <span>{String(years.reduce((sum, year) => sum + year.events.length, 0)).padStart(2, "0")}</span>
      </div>

      {years.length === 0 ? (
        <div className="listing-grid">
          <article className="listing-card">
            <span className="listing-card-copy">
              <span className="listing-card-summary">{content.labels.comingSoon}</span>
            </span>
          </article>
        </div>
      ) : (
        <div className="timeline-axis">
          {years.map((yearGroup) => (
            <div className="timeline-year" key={yearGroup.year}>
              <div className="timeline-year-label">{yearGroup.year}</div>
              <div className="timeline-year-events">
                {yearGroup.events.map((ev, index) => {
                  const href = contentHrefForObject(locale, ev);
                  const wording = locale === "ru" ? ev.wording_ru : (ev.wording_en || ev.wording_ru);
                  const title = locale === "en" && ev.object_title_en ? ev.object_title_en : ev.object_title;
                  const label = href ? (
                    <Link href={href}>{title}</Link>
                  ) : (
                    <span className="timeline-object-title">{title}</span>
                  );
                  return (
                    <article className="timeline-event" key={`${ev.object_id}-${ev.claim_id}-${index}`}>
                      <span className="timeline-event-object">{label}</span>
                      <p className="timeline-event-wording">{wording}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
