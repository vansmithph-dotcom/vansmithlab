import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { PublishedContent } from "@/lib/content";
import { copy, type Locale } from "@/lib/site-data";

const labels = {
  ru: { back: "Р СњР В°Р В·Р В°Р Т‘", verification: "Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚Р С”Р В°", confidence: "Р Р€Р Р†Р ВµРЎР‚Р ВµР Р…Р Р…Р С•РЎРѓРЎвЂљРЎРЉ", reviewed: "Р С›Р В±Р Р…Р С•Р Р†Р В»Р ВµР Р…Р С•", sources: "Р ВРЎРѓРЎвЂљР С•РЎвЂЎР Р…Р С‘Р С”Р С‘", revision: "Р В Р ВµР Р†Р С‘Р В·Р С‘РЎРЏ", ai: "Р СљР В°РЎвЂљР ВµРЎР‚Р С‘Р В°Р В» Р С—Р С•Р Т‘Р С–Р С•РЎвЂљР С•Р Р†Р В»Р ВµР Р… Р В°Р Р†РЎвЂљР С•Р СР В°РЎвЂљР С‘Р В·Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р Р…Р С•Р в„– РЎР‚Р ВµР Т‘Р В°Р С”РЎвЂ Р С‘Р С•Р Р…Р Р…Р С•Р в„– РЎРѓР С‘РЎРѓРЎвЂљР ВµР СР С•Р в„– Р С‘ Р С—РЎР‚Р С•РЎв‚¬РЎвЂР В» Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚Р С”РЎС“ Р С‘РЎРѓРЎвЂљР С•РЎвЂЎР Р…Р С‘Р С”Р С•Р Р†.", related: "Р РЋР Р†РЎРЏР В·Р В°Р Р…Р Р…РЎвЂ№Р Вµ РЎвЂљР ВµР СРЎвЂ№", nextReading: "Р В§РЎвЂљР С• РЎвЂЎР С‘РЎвЂљР В°РЎвЂљРЎРЉ Р Т‘Р В°Р В»РЎРЉРЎв‚¬Р Вµ", fact: "Р В¤Р В°Р С”РЎвЂљ", interpretation: "Р ВР Р…РЎвЂљР ВµРЎР‚Р С—РЎР‚Р ВµРЎвЂљР В°РЎвЂ Р С‘РЎРЏ" },
  en: { back: "Back", verification: "Verification", confidence: "Confidence", reviewed: "Last reviewed", sources: "Sources", revision: "Revision", ai: "This publication was prepared by an automated editorial system and passed source validation.", related: "Related subjects", nextReading: "Further reading", fact: "Fact", interpretation: "Interpretation" }
} as const;

const siteUrl = "https://vansmithlab.com";

function buildJsonLd(locale: Locale, section: string, content: PublishedContent) {
  const { metadata } = content;
  const url = `${siteUrl}/${locale}/${section}/${metadata.slug}/`;
  const image = metadata.hero_image ? `${siteUrl}${metadata.hero_image.src}` : undefined;
  const organization = { "@type": "Organization" as const, name: "VANSMITHLAB", url: siteUrl };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.summary,
    inLanguage: locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(image ? { image: [image] } : {}),
    datePublished: metadata.last_reviewed,
    dateModified: metadata.last_reviewed,
    author: metadata.content_type === "analysis" ? { "@type": "Person", name: metadata.author } : organization,
    publisher: organization,
    ...(metadata.content_type === "designer_profile" ? { about: { "@type": "Person", name: metadata.title } } : {}),
  };
}

export function PublishedArticle({ locale, section, content }: { locale: Locale; section: string; content: PublishedContent }) {
  const { metadata, body, sources, citations } = content;
  const text = labels[locale];
  const isAnalysis = metadata.content_type === "analysis";
  const isProfile = metadata.content_type === "designer_profile" || metadata.content_type === "artist_profile";
  const sourceById = new Map(sources.map((source, index) => [source.id, { source, number: index + 1 }]));
  const citationByClaim = new Map(citations.map((citation) => [citation.claim_id, citation]));
  const renderedBody = body.replace(/\[\^([A-Za-z0-9_-]+)\]/g, (marker, claimId: string) => {
    const citation = citationByClaim.get(claimId);
    const target = citation ? sourceById.get(citation.source_id) : undefined;
    return target ? `[${target.number}](${target.source.url} "${target.source.title.replaceAll('"', "'")}")` : marker;
  });
  const jsonLd = buildJsonLd(locale, section, content);
  const backLabel = copy[locale].section[section]?.title ?? text.back;

  return (
    <article className="shell object-page published-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="back-link" href={`/${locale}/${section}`}>РІвЂ С’ {backLabel}</Link>

      <header className="object-header">
        <div>
          <p className="eyebrow">{metadata.content_type.replaceAll("_", " ")}</p>
          <h1>{metadata.title}</h1>
          <p>{metadata.summary}</p>
          {isAnalysis && <p className="article-byline">{metadata.author} Р’В· {metadata.last_reviewed}</p>}
          {isProfile && <p className="article-byline">{locale === "ru" ? "Р вЂР С‘Р С•Р С–РЎР‚Р В°РЎвЂћР С‘РЎвЂЎР ВµРЎРѓР С”Р С‘Р в„– Р С—РЎР‚Р С•РЎвЂћР С‘Р В»РЎРЉ" : "Biographical profile"} Р’В· {metadata.last_reviewed}</p>}
        </div>
      </header>

      {/* Translation status banner */}
      {metadata.translation && metadata.translation.source_locale === "ru" && (
        <div className="translation-banner">
          {locale === "ru" ? (
            <p>Р СѓСЃСЃРєРёР№ РѕСЂРёРіРёРЅР°Р» В· СЂРµРІРёР·РёСЏ {metadata.source_revision} В· <Link href={`/en/${section}/${content.metadata.slug}`}>Р°РЅРіР»РёР№СЃРєР°СЏ Р°РґР°РїС‚Р°С†РёСЏ РґРѕСЃС‚СѓРїРЅР°</Link></p>
          ) : (
            <p>
              РђРЅРіР»РёР№СЃРєР°СЏ Р°РґР°РїС‚Р°С†РёСЏ РЅР° РѕСЃРЅРѕРІРµ СЂСѓСЃСЃРєРѕР№ СЂРµРІРёР·РёРё {metadata.translation.source_revision}
              {metadata.source_revision > metadata.translation.source_revision && (
                <> В· <strong>Р СѓСЃСЃРєРёР№ РѕСЂРёРіРёРЅР°Р» РѕР±РЅРѕРІР»С‘РЅ (СЂРµРІРёР·РёСЏ {metadata.source_revision}). РђРґР°РїС‚Р°С†РёСЏ РјРѕР¶РµС‚ РЅРµ РѕС‚СЂР°Р¶Р°С‚СЊ РїРѕСЃР»РµРґРЅРёРµ РёР·РјРµРЅРµРЅРёСЏ.</strong></>
              )}
            </p>
          )}
        </div>
      )}
      {!metadata.translation && locale === "ru" && metadata.source_locale === "ru" && (
        <div className="translation-banner">
          <p>Р СѓСЃСЃРєРёР№ РѕСЂРёРіРёРЅР°Р» В· Р°РЅРіР»РёР№СЃРєР°СЏ Р°РґР°РїС‚Р°С†РёСЏ РѕР¶РёРґР°РµС‚СЃСЏ</p>
        </div>
      )}

      {metadata.hero_image && (
        <figure className="article-hero">
          <Image alt={metadata.hero_image.alt} height={941} priority sizes="(max-width: 1280px) 100vw, 1216px" src={metadata.hero_image.src} width={1672} />
          <figcaption>
            {metadata.hero_image.caption}
            <span>
              {metadata.hero_image.credit}
              {metadata.hero_image.origin === "ai_illustration" && (
                <> Р’В· <abbr title={locale === "ru" ? "Р РЋР С–Р ВµР Р…Р ВµРЎР‚Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р С• AI" : "AI-generated"}>{locale === "ru" ? "AI" : "AI"}</abbr></>
              )}
            </span>
          </figcaption>
        </figure>
      )}

      <div className="article-layout">
        <div className="article-copy">
          {isAnalysis && (
            <div className="analysis-disclaimer" style={{ marginBottom: 28, padding: "14px 18px", borderLeft: "3px solid var(--accent)", background: "var(--canvas)", fontSize: 12, lineHeight: 1.6, color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{locale === "ru" ? "Р С’Р Р…Р В°Р В»Р С‘РЎвЂљР С‘РЎвЂЎР ВµРЎРѓР С”Р С•Р Вµ РЎРЊРЎРѓРЎРѓР Вµ" : "Analytical essay"}</strong>
              {locale === "ru" ? "Р вЂ™ РЎРЊРЎвЂљР С•Р С РЎвЂљР ВµР С”РЎРѓРЎвЂљР Вµ РЎвЂћР В°Р С”РЎвЂљРЎвЂ№, Р С‘Р Р…РЎвЂљР ВµРЎР‚Р С—РЎР‚Р ВµРЎвЂљР В°РЎвЂ Р С‘РЎРЏ Р С‘ Р СР Р…Р ВµР Р…Р С‘Р Вµ Р В°Р Р†РЎвЂљР С•РЎР‚Р В° Р С•Р В±Р С•Р В·Р Р…Р В°РЎвЂЎР ВµР Р…РЎвЂ№ Р С•РЎвЂљР Т‘Р ВµР В»РЎРЉР Р…Р С•. Р Р€РЎвЂљР Р†Р ВµРЎР‚Р В¶Р Т‘Р ВµР Р…Р С‘РЎРЏ РЎРѓР С• РЎРѓРЎРѓРЎвЂ№Р В»Р С”Р В°Р СР С‘ Р Р…Р В° Р С‘РЎРѓРЎвЂљР С•РЎвЂЎР Р…Р С‘Р С”Р С‘ Р С•РЎвЂљР СР ВµРЎвЂЎР ВµР Р…РЎвЂ№ Р СР В°РЎР‚Р С”Р ВµРЎР‚Р С•Р С Р’В«РЎвЂћР В°Р С”РЎвЂљР’В», Р В°Р Р†РЎвЂљР С•РЎР‚РЎРѓР С”Р С‘Р Вµ РЎРѓРЎС“Р В¶Р Т‘Р ВµР Р…Р С‘РЎРЏ РІР‚вЂќ Р СР В°РЎР‚Р С”Р ВµРЎР‚Р С•Р С Р’В«Р С‘Р Р…РЎвЂљР ВµРЎР‚Р С—РЎР‚Р ВµРЎвЂљР В°РЎвЂ Р С‘РЎРЏР’В». Р вЂ™РЎРѓР Вµ РЎРѓРЎРѓРЎвЂ№Р В»Р С”Р С‘ Р Р†Р ВµР Т‘РЎС“РЎвЂљ Р С” Р С—РЎР‚Р С•Р Р†Р ВµРЎР‚РЎРЏР ВµР СРЎвЂ№Р С Р С‘РЎРѓРЎвЂљР С•РЎвЂЎР Р…Р С‘Р С”Р В°Р С." : "In this text, facts, interpretation and the author's opinion are distinguished. Claims with source references are marked as fact, authorial judgments as interpretation. All references lead to verifiable sources."}
            </div>
          )}
          <ReactMarkdown components={{ a: ({ children, ...props }) => <a {...props} rel="noreferrer" target="_blank">{children}</a> }}>{renderedBody}</ReactMarkdown>
        </div>

        <aside className="evidence-rail">
          <div className="evidence-section">
            <h2>{text.verification}</h2>
            <dl>
              <dt>{text.verification}</dt>
              <dd>{metadata.verification_state.replaceAll("_", " ")}</dd>
              <dt>{text.confidence}</dt>
              <dd>{Math.round(metadata.confidence_score * 100)}%</dd>
              <dt>{text.reviewed}</dt>
              <dd>{metadata.last_reviewed}</dd>
              <dt>{text.revision}</dt>
              <dd>{metadata.source_revision}</dd>
            </dl>
          </div>

          {sources.length > 0 && (
            <div className="evidence-section">
              <h2>{text.sources}</h2>
              <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {sources.map((source) => (
                  <li key={source.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 12, lineHeight: 1.45 }}>
                    <a href={source.url} rel="noreferrer" target="_blank">{source.title}</a>
                    <small style={{ display: "block", marginTop: 5, color: "var(--muted)" }}>{source.publisher} Р’В· {source.accessed_at}</small>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="evidence-section">
            <p className="ai-note" style={{ margin: 0, color: "var(--muted)", fontSize: 11, lineHeight: 1.55 }}>{text.ai}</p>
          </div>
        </aside>
      </div>

      <footer className="discovery-footer" style={{ marginTop: 80, paddingTop: 48, borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div>
            <p className="eyebrow">{text.related}</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{locale === "ru" ? "Р РЋР Р†РЎРЏР В·Р В°Р Р…Р Р…РЎвЂ№Р Вµ Р С•Р В±РЎР‰Р ВµР С”РЎвЂљРЎвЂ№ Р С‘ РЎвЂљР ВµР СРЎвЂ№ Р С—Р С•РЎРЏР Р†РЎРЏРЎвЂљРЎРѓРЎРЏ Р В·Р Т‘Р ВµРЎРѓРЎРЉ Р С—Р С•РЎРѓР В»Р Вµ Р С—Р С•Р Т‘Р С”Р В»РЎР‹РЎвЂЎР ВµР Р…Р С‘РЎРЏ knowledge engine." : "Related objects and topics will appear here once the knowledge engine is connected."}</p>
          </div>
          <div>
            <p className="eyebrow">{text.nextReading}</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{locale === "ru" ? "Р В Р ВµР С”Р С•Р СР ВµР Р…Р Т‘Р В°РЎвЂ Р С‘Р С‘ Р Р…Р В° Р С•РЎРѓР Р…Р С•Р Р†Р Вµ Р С–РЎР‚Р В°РЎвЂћР В° Р В·Р Р…Р В°Р Р…Р С‘Р в„–." : "Recommendations based on the knowledge graph."}</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
