import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { copy, isLocale } from "@/lib/site-data";

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

const glossaryNav = {
  ru: [
    { title: "Дизайнеры и архитекторы", text: "Биографические и визуально-аналитические материалы об авторах, чей метод стал частью языка дизайна.", href: "/glossary/designers", count: "50+" },
    { title: "Художники", text: "Биографические и визуально-аналитические материалы о художниках, чьи методы и образы стали частью языка визуальной культуры.", href: "/glossary/artists", count: "12" },
    { title: "Термины", text: "Точные определения для понятий, которые связывают дисциплины дизайна — силуэт, материал, конструкция, визуальная идентичность, типографика, ремесло.", href: "", count: "—" },
  ],
  en: [
    { title: "Designers and Architects", text: "Biographical and visual-analytical profiles of authors whose method became part of the language of design.", href: "/glossary/designers", count: "50+" },
    { title: "Artists", text: "Biographical and visual-analytical profiles of artists whose methods and images became part of the language of visual culture.", href: "/glossary/artists", count: "12" },
    { title: "Terms", text: "Precise definitions for concepts that connect design disciplines — silhouette, material, construction, visual identity, typography, craft.", href: "", count: "—" },
  ],
};

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];
  const page = content.section.glossary;
  const nav = glossaryNav[locale];

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
        <span>{String(nav.length).padStart(2, "0")}</span>
      </div>
      <div className="listing-grid">
        {nav.map((item, index) => (
          item.href ? (
            <Link className="listing-card" href={`/${locale}${item.href}`} key={item.title}>
              <span className="listing-card-copy">
                <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
                <h2>{item.title}</h2>
                <span className="listing-card-summary">{item.text}</span>
                <span className="listing-card-meta">
                  <small>{item.count} {locale === "ru" ? "материалов" : "entries"}</small>
                  <i>{content.labels.read} ↗</i>
                </span>
              </span>
            </Link>
          ) : (
            <div className="listing-card" key={item.title}>
              <span className="listing-card-copy">
                <span className="listing-card-index">{String(index + 1).padStart(2, "0")}</span>
                <h2>{item.title}</h2>
                <span className="listing-card-summary">{item.text}</span>
                <span className="listing-card-meta">
                  <small>{content.labels.comingSoon}</small>
                </span>
              </span>
            </div>
          )
        ))}
      </div>
    </section>
  );
}
