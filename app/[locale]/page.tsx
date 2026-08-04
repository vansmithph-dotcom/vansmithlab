import Link from "next/link";
import { notFound } from "next/navigation";
import { TrustPanel } from "@/components/TrustPanel";
import { copy, fields, isLocale } from "@/lib/site-data";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = copy[locale];

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
        <div className="hero-art" aria-hidden="true"><span className="art-circle" /><span className="art-line art-line-one" /><span className="art-line art-line-two" /><span className="art-label">VSL / 001</span></div>
      </section>

      <section className="trust-section">
        <div className="shell trust-layout"><div><p className="eyebrow">VANSMITHLAB OS</p><h2>{content.trustTitle}</h2></div><p>{content.trustText}</p></div>
      </section>

      <section className="shell section-block">
        <div className="section-heading"><div><p className="eyebrow">Explore</p><h2>{content.fieldsTitle}</h2></div><p>{content.fieldsText}</p></div>
        <div className="field-grid">
          {fields[locale].map((field, index) => <Link className="field-card" href={`/${locale}${field.href}`} key={field.title}><span>0{index + 1}</span><h3>{field.title}</h3><p>{field.text}</p><i>↗</i></Link>)}
        </div>
      </section>

      <section className="shell section-block process-block">
        <div className="section-heading"><div><p className="eyebrow">Method</p><h2>{content.processTitle}</h2></div></div>
        <div className="process-grid">{content.process.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      </section>

      <section className="analysis-section"><div className="shell analysis-grid"><div><p className="eyebrow">{content.analysisEyebrow}</p><h2>{content.analysisHeadline}</h2><Link className="text-link" href={`/${locale}/analysis`}>{content.analysisLink}<span>→</span></Link></div><p>{content.analysisText}</p></div></section>

      <section className="shell sample-section">
        <div className="section-heading"><div><p className="eyebrow">Archive in progress</p><h2>{locale === "ru" ? "Первые маршруты базы" : "First routes through the library"}</h2></div><TrustPanel locale={locale} /></div>
        <div className="sample-marquee"><span>FASHION</span><span>OBJECT</span><span>IMAGE</span><span>SPACE</span><span>LANGUAGE</span></div>
      </section>
    </>
  );
}
