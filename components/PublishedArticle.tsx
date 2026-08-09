import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { PublishedContent } from "@/lib/content";
import { copy, type Locale } from "@/lib/site-data";

const labels = {
  ru: { back: "Назад", verification: "Проверка", confidence: "Уверенность", reviewed: "Обновлено", sources: "Источники", revision: "Версия", ai: "Материал подготовлен автоматической редакционной системой и прошёл проверку источников.", related: "Связанные темы", nextReading: "Дальнейшее чтение", fact: "Факт", interpretation: "Интерпретация" },
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
  const renderedBody = body
    // Convert [N] bare citation references to clickable cite elements with tooltip
    .replace(/\[(\d+)\](?!\()/g, (match, num: string) => {
      const sourceIndex = parseInt(num) - 1;
      const source = sources[sourceIndex];
      if (source) {
        return `<a href="${source.url}" target="_blank" rel="noreferrer" class="citation-link" title="${source.title.replace(/"/g, '&quot;')} — ${source.publisher}">[${num}]</a>`;
      }
      return `<a href="#evidence-sources" class="citation-link citation-unmapped" title="${locale === "ru" ? "Источник не сопоставлен; открыть список источников" : "Source not mapped; open the source list"}">[${num}]</a>`;
    })
    // Convert [^claim_id] to linked citations
    .replace(/\[\^([A-Za-z0-9_-]+)\]/g, (marker, claimId: string) => {
    const citation = citationByClaim.get(claimId);
    const target = citation ? sourceById.get(citation.source_id) : undefined;
    return target
      ? `[${target.number}](${target.source.url} "${target.source.title.replaceAll('"', "'")}")`
      : `<a href="#evidence-sources" class="citation-link citation-unmapped" title="${locale === "ru" ? "Источник не сопоставлен; открыть список источников" : "Source not mapped; open the source list"}">[${locale === "ru" ? "источник" : "source"}]</a>`;
  });
  const jsonLd = buildJsonLd(locale, section, content);
  const backLabel = copy[locale].section[section]?.title ?? text.back;

  return (
    <article className="shell object-page published-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link className="back-link" href={`/${locale}/${section}`}>{"\u2190"} {backLabel}</Link>

      <header className="object-header">
        <div>
          <p className="eyebrow">{metadata.content_type.replaceAll("_", " ")}</p>
          <h1>{metadata.title}</h1>
          <p>{metadata.summary}</p>
          {isAnalysis && <p className="article-byline">{metadata.author} · {metadata.last_reviewed}</p>}
          {isProfile && <p className="article-byline">{locale === "ru" ? "Биографический профиль" : "Biographical profile"} · {metadata.last_reviewed}</p>}
        </div>
      </header>

      {/* Translation status banner */}
      {metadata.translation && metadata.translation.source_locale === "ru" && (
        <div className="translation-banner">
          {locale === "ru" ? (
            <p>Русский оригинал · английская адаптация ревизии {metadata.source_revision} · <Link href={`/en/${section}/${content.metadata.slug}`}>Английская адаптация доступна</Link></p>
          ) : (
            <p>
              English adaptation based on Russian revision {metadata.translation.source_revision}
              {metadata.source_revision > metadata.translation.source_revision && (
                <> · <strong>The Russian original has been updated (revision {metadata.source_revision}). This adaptation may not reflect the latest changes.</strong></>
              )}
            </p>
          )}
        </div>
      )}
      {!metadata.translation && locale === "ru" && metadata.source_locale === "ru" && (
        <div className="translation-banner">
          <p>Русский оригинал · английская адаптация ожидается</p>
        </div>
      )}

      {metadata.hero_image && (
        <figure className="article-hero" aria-label={locale === "ru" ? "Главный визуальный материал" : "Primary visual material"}>
          <Image alt={metadata.hero_image.alt} height={941} priority sizes="(max-width: 1280px) 100vw, 1216px" src={metadata.hero_image.src} width={1672} />
          <figcaption>
            <span className="article-hero-caption">{metadata.hero_image.caption}</span>
            <span className="article-hero-credit">
              {metadata.hero_image.credit}
              {metadata.hero_image.origin === "ai_illustration" && (
                <> · <abbr title={locale === "ru" ? "Изображение сгенерировано AI" : "AI-generated"}>{locale === "ru" ? "AI" : "AI"}</abbr></>
              )}
            </span>
          </figcaption>
        </figure>
      )}

      <div className="article-layout">
        <div className="article-copy">
          {isAnalysis && (
            <div className="analysis-disclaimer" style={{ marginBottom: 28, padding: "14px 18px", borderLeft: "3px solid var(--accent)", background: "var(--canvas)", fontSize: 12, lineHeight: 1.6, color: "var(--muted)" }}>
              <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>{locale === "ru" ? "Аналитическое эссе" : "Analytical essay"}</strong>
              {locale === "ru" ? "В этом тексте факты, интерпретация и мнение автора разделены. Утверждения со ссылками на источники помечены как факт, авторские суждения как интерпретация. Все ссылки ведут к проверяемым источникам." : "In this text, facts, interpretation and the author's opinion are distinguished. Claims with source references are marked as fact, authorial judgments as interpretation. All references lead to verifiable sources."}
            </div>
          )}
          <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
            a: ({ children, ...props }) => <a {...props} rel="noreferrer" target="_blank" title={props.title || undefined}>{children}</a>,
            cite: ({ children, title }) => <cite className="citation-link" title={title} style={{ cursor: "help", borderBottom: "1px dotted var(--accent)", fontStyle: "normal" }}>{children}</cite>
          }}>{renderedBody}</ReactMarkdown>
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
            <div className="evidence-section" id="evidence-sources">
              <h2>{text.sources}</h2>
              <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {sources.map((source) => (
                  <li key={source.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 12, lineHeight: 1.45 }}>
                    <a href={source.url} rel="noreferrer" target="_blank">{source.title}</a>
                    <small style={{ display: "block", marginTop: 5, color: "var(--muted)" }}>{source.publisher} · {source.accessed_at}</small>
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
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{locale === "ru" ? "Связанные темы и объекты появятся здесь после подключения knowledge engine." : "Related objects and topics will appear here once the knowledge engine is connected."}</p>
          </div>
          <div>
            <p className="eyebrow">{text.nextReading}</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{locale === "ru" ? "Рекомендации на основе knowledge graph." : "Recommendations based on the knowledge graph."}</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
