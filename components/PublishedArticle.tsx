import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { PublishedContent } from "@/lib/content";
import type { Locale } from "@/lib/site-data";

const labels = {
  ru: { back: "Назад", verification: "Проверка", confidence: "Уверенность", reviewed: "Обновлено", sources: "Источники", revision: "Ревизия", ai: "Материал подготовлен автоматизированной редакционной системой и прошёл проверку источников." },
  en: { back: "Back", verification: "Verification", confidence: "Confidence", reviewed: "Last reviewed", sources: "Sources", revision: "Revision", ai: "This publication was prepared by an automated editorial system and passed source validation." }
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
  const sourceById = new Map(sources.map((source, index) => [source.id, { source, number: index + 1 }]));
  const citationByClaim = new Map(citations.map((citation) => [citation.claim_id, citation]));
  const renderedBody = body.replace(/\[\^([A-Za-z0-9_-]+)\]/g, (marker, claimId: string) => {
    const citation = citationByClaim.get(claimId);
    const target = citation ? sourceById.get(citation.source_id) : undefined;
    return target ? `[${target.number}](${target.source.url} "${target.source.title.replaceAll('"', "'")}")` : marker;
  });
  const jsonLd = buildJsonLd(locale, section, content);
  return (
    <article className="shell object-page published-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="back-link" href={`/${locale}/${section}`}>← {text.back}</Link>
      <header className="object-header">
        <div><p className="eyebrow">{metadata.content_type.replaceAll("_", " ")} · {metadata.content_id}</p><h1>{metadata.title}</h1><p>{metadata.summary}</p>{metadata.content_type === "analysis" && <p className="article-byline">{metadata.author}</p>}</div>
        <aside className="trust-panel" aria-label={text.verification}>
          <div><span>{text.verification}</span><strong>{metadata.verification_state.replaceAll("_", " ")}</strong></div>
          <div><span>{text.confidence}</span><strong>{Math.round(metadata.confidence_score * 100)}%</strong></div>
          <div><span>{text.reviewed}</span><strong>{metadata.last_reviewed}</strong></div>
          <div><span>{text.revision}</span><strong>{metadata.source_revision}</strong></div>
        </aside>
      </header>
      {metadata.hero_image && <figure className="article-hero">
        <Image alt={metadata.hero_image.alt} height={941} priority sizes="(max-width: 1280px) 100vw, 1216px" src={metadata.hero_image.src} width={1672} />
        <figcaption>{metadata.hero_image.caption} <span>{metadata.hero_image.credit}</span></figcaption>
      </figure>}
      <div className="article-layout">
        <div className="article-copy"><ReactMarkdown components={{ a: ({ children, ...props }) => <a {...props} rel="noreferrer" target="_blank">{children}</a> }}>{renderedBody}</ReactMarkdown></div>
        <aside className="source-rail"><h2>{text.sources}</h2><ol>{sources.map((source) => <li key={source.id}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a><small>{source.publisher} · {source.accessed_at}</small></li>)}</ol><p className="ai-note">{text.ai}</p></aside>
      </div>
    </article>
  );
}
