import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { copy, isLocale, objectSamples, sectionKeys } from "@/lib/site-data";

export function generateStaticParams() {
  return sectionKeys.flatMap((section) => ["ru", "en"].map((locale) => ({ locale, section })));
}

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in copy[locale].section)) notFound();
  const content = copy[locale];
  const page = content.section[section];
  const isSearch = section === "search";

  return (
    <section className="shell page-shell">
      <div className="page-intro">
        <div><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.text}</p></div>
        <TrustPanel locale={locale} />
      </div>
      {isSearch && <form className="search-form" role="search"><label htmlFor="query">{content.search}</label><div><input id="query" name="q" placeholder={content.search} /><button type="submit">↗</button></div></form>}
      <div className="listing-header"><p>{content.labels.comingSoon}</p><span>{page.items.length.toString().padStart(2, "0")}</span></div>
      <div className="listing-grid">
        {page.items.map((item, index) => {
          const sample = objectSamples[index % objectSamples.length];
          const href = section === "encyclopedia" ? `/${locale}/encyclopedia/${sample.slug}` : `/${locale}/${section}`;
          return <Link className="listing-card" href={href} key={`${item}-${index}`}><span>0{index + 1}</span><h2>{item}</h2><p>{section === "encyclopedia" ? sample.summary[locale] : page.text}</p><div><small>{section === "analysis" ? "ESSAY" : "KNOWLEDGE"}</small><i>{content.labels.read} ↗</i></div></Link>;
        })}
      </div>
    </section>
  );
}
