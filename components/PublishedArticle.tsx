import Link from "next/link";
import Image from "next/image";
import { Children, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { contentHref, relatedContent, sectionForContentType, type InlineMediaReference, type PublishedContent } from "@/lib/content";
import { copy, type Locale } from "@/lib/site-data";
import { organizationId, organizationStructuredData, siteUrl, websiteId } from "@/lib/structured-data";
import { roleByRoute } from "@/lib/taxonomy";
import { sourceDisplayMeta, sourceDisplayTitle, uniqueSourcesByUrl } from "@/lib/source-display.mjs";
import { cleanReaderMarkdown } from "@/lib/reader-markdown-cleanup.mjs";

const labels = {
  ru: { back: "Назад", verification: "Проверка", confidence: "Уверенность", reviewed: "Обновлено", sources: "Источники", revision: "Версия", ai: "Материал подготовлен автоматической редакционной системой и прошёл проверку источников." },
  en: { back: "Back", verification: "Verification", confidence: "Confidence", reviewed: "Last reviewed", sources: "Sources", revision: "Revision", ai: "This publication was prepared by an automated editorial system and passed source validation." }
} as const;

function removeDuplicatedArticleIntro(body: string, title: string, summary: string) {
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex >= 0) {
    const firstLine = lines[firstContentIndex].trim();
    const markdownTitle = firstLine.startsWith("# ") ? firstLine.slice(2).trim() : "";
    if (markdownTitle === title.trim()) lines.splice(firstContentIndex, 1);
  }

  while (lines[0]?.trim() === "") lines.shift();

  const possibleSummary = lines[0]?.trim() ?? "";
  if (possibleSummary.startsWith("*") && possibleSummary.endsWith("*")) {
    const plainSummary = possibleSummary.slice(1, -1).trim();
    if (plainSummary === summary.trim()) lines.shift();
  }

  while (lines[0]?.trim() === "") lines.shift();
  return lines.join("\n");
}

function headingText(children: ReactNode) {
  return Children.toArray(children)
    .map((child) => typeof child === "string" || typeof child === "number" ? String(child) : "")
    .join("")
    .trim();
}

function InlineArticleFigure({ media, locale }: { media: InlineMediaReference; locale: Locale }) {
  const sourceLabel = locale === "ru" ? "Официальный пример" : "Official example";
  const disclosure = media.origin === "ai_illustration"
    ? (locale === "ru" ? "AI-иллюстрация" : "AI illustration")
    : media.origin === "editorial_diagram"
      ? (locale === "ru" ? "Редакционная диаграмма" : "Editorial diagram")
      : null;

  return (
    <figure className="article-inline-figure" aria-label={media.alt}>
      <span className="article-inline-media">
        <Image
          alt={media.alt}
          height={media.height}
          loading="lazy"
          sizes="(max-width: 920px) calc(100vw - 32px), 760px"
          src={media.src}
          width={media.width}
        />
      </span>
      <figcaption>
        <span className="article-inline-caption">{media.caption}</span>
        <span className="article-inline-credit">
          {media.credit}
          {disclosure ? <> · {disclosure}</> : null}
          {media.source_url ? <> · <a href={media.source_url} rel="noreferrer" target="_blank">{sourceLabel}</a></> : null}
        </span>
      </figcaption>
    </figure>
  );
}

function buildJsonLd(locale: Locale, section: string, content: PublishedContent, related: ReturnType<typeof relatedContent>) {
  const { metadata } = content;
  const url = `${siteUrl}/${locale}/${section}/${metadata.slug}/`;
  const image = metadata.hero_image ? `${siteUrl}${metadata.hero_image.src}` : undefined;
  const imageId = image ? `${image}#image` : undefined;
  const mediaRightsPage = `${siteUrl}/${locale}/about/#media-rights`;
  const originalMedia = metadata.hero_image?.rights_state === "original_owned" || metadata.hero_image?.rights_status === "ai_generated";
  const license = metadata.hero_image?.licence_url ?? (originalMedia ? mediaRightsPage : undefined);
  const acquireLicensePage = metadata.hero_image?.acquire_license_page ?? (originalMedia ? mediaRightsPage : undefined);
  const sectionKey = section === "collection" ? "collections" : section;
  const sectionCopy = copy[locale].section[sectionKey];
  const role = section.startsWith("glossary/") ? roleByRoute(section.split("/").at(-1) ?? "") : undefined;
  const sectionName = sectionCopy?.title ?? (role ? role[locale] : (locale === "ru" ? "Публикации" : "Publications"));
  const trail = [
    { name: locale === "ru" ? "Главная" : "Home", url: `${siteUrl}/${locale}/` },
    ...(section.startsWith("glossary/")
      ? [
          { name: copy[locale].section.glossary.title, url: `${siteUrl}/${locale}/glossary/` },
          { name: sectionName, url: `${siteUrl}/${locale}/${section}/` },
        ]
      : [{ name: sectionName, url: `${siteUrl}/${locale}/${section}/` }]),
    { name: metadata.title, url },
  ];
  const aboutType = metadata.content_type.endsWith("_profile")
    ? "Person"
    : metadata.kind === "organization"
      ? "Organization"
      : "Thing";
  const keywords = [...(metadata.discipline ?? []), ...(metadata.categories ?? [])];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: metadata.title,
        description: metadata.summary,
        inLanguage: locale,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@id": websiteId },
        articleSection: sectionName,
        ...(keywords.length ? { keywords } : {}),
        ...(imageId ? { image: [{ "@id": imageId }], thumbnailUrl: image } : {}),
        ...(related.length ? { isRelatedTo: related.map((item) => `${siteUrl}${contentHref(item)}/`) } : {}),
        datePublished: metadata.last_reviewed,
        dateModified: metadata.last_reviewed,
        author: metadata.content_type === "analysis"
          ? { "@type": "Person", name: metadata.author }
          : { "@id": organizationId },
        publisher: { "@id": organizationId },
        about: { "@type": aboutType, name: metadata.title },
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: metadata.title,
        description: metadata.summary,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": `${url}#article` },
        ...(imageId ? { primaryImageOfPage: { "@id": imageId } } : {}),
      },
      ...(image && imageId ? [{
        "@type": "ImageObject",
        "@id": imageId,
        url: image,
        contentUrl: image,
        name: `${metadata.title} — VANSMITHLAB`,
        description: metadata.hero_image?.alt || metadata.summary,
        caption: metadata.hero_image?.caption,
        creditText: metadata.hero_image?.credit,
        representativeOfPage: true,
        ...(metadata.hero_image?.mime_type ? { encodingFormat: metadata.hero_image.mime_type } : {}),
        ...(metadata.hero_image?.width ? { width: metadata.hero_image.width } : {}),
        ...(metadata.hero_image?.height ? { height: metadata.hero_image.height } : {}),
        ...(license ? { license } : {}),
        ...(acquireLicensePage ? { acquireLicensePage } : {}),
        creator: { "@id": organizationId },
      }] : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      organizationStructuredData,
    ],
  };
}

export function PublishedArticle({ locale, section, content }: { locale: Locale; section: string; content: PublishedContent }) {
  const { metadata, body, sources, citations } = content;
  const text = labels[locale];
  const isAnalysis = metadata.content_type === "analysis";
  const isProfile = metadata.content_type.endsWith("_profile");
  const related = relatedContent(metadata);
  const displayedSources = uniqueSourcesByUrl(sources);
  const sourceById = new Map(sources.map((source, index) => [source.id, { source, number: index + 1 }]));
  const citationByClaim = new Map(citations.map((citation) => [citation.claim_id, citation]));
  const renderedBody = cleanReaderMarkdown(
    removeDuplicatedArticleIntro(body, metadata.title, metadata.summary),
    locale,
  )
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
    // Legacy content sometimes has claim markers in the body but an empty
    // metadata.claim_ids/citations array. Preserve the editorial source order
    // as a deterministic fallback so a citation still opens the real source.
    const legacyNumber = /^clm_(\d+)$/.exec(claimId)?.[1];
    const legacySource = legacyNumber ? sources[Number(legacyNumber) - 1] : undefined;
    const target = citation ? sourceById.get(citation.source_id) : (legacySource ? { source: legacySource, number: Number(legacyNumber) } : undefined);
    return target
      ? `[${target.number}](${target.source.url} "${target.source.title.replaceAll('"', "'")}")`
      : `<a href="#evidence-sources" class="citation-link citation-unmapped" title="${locale === "ru" ? "Источник не сопоставлен; открыть список источников" : "Source not mapped; open the source list"}">[${locale === "ru" ? "источник" : "source"}]</a>`;
    })
    // Render [CALLOUT type="..."] blocks as labelled editorial callouts.
    // DOCX_SCHEMA 6a: an analysis document must carry at least one
    // interpretation callout.
    .replace(
      /\[CALLOUT\s+type="([a-z-]+)"\]\n([\s\S]*?)\n\[\/CALLOUT\]/g,
      (_match, type: string, content: string) => {
        const calloutLabels: Record<string, { ru: string; en: string }> = {
          interpretation: { ru: "Интерпретация", en: "Interpretation" },
          "critical-context": { ru: "Критический контекст", en: "Critical context" },
          dispute: { ru: "Спорное утверждение", en: "Disputed claim" },
        };
        const label = calloutLabels[type]?.[locale] ?? type;
        const cleanedContent = content.trim().replace(/^(Интерпретация|Interpretation)\s*/i, "");
        return `<aside class="callout callout-${type}" aria-label="${label}"><strong>${label}</strong>${cleanedContent}</aside>`;
      }
    );
  const jsonLd = buildJsonLd(locale, section, content, related);
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
          <span className="article-hero-media">
            <Image alt={metadata.hero_image.alt} fill priority sizes="(max-width: 1280px) 100vw, 1216px" src={metadata.hero_image.src} />
          </span>
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
      {metadata.portrait_image && (
        <figure className="article-inline-portrait">
          <Image alt={metadata.portrait_image.alt} height={768} src={metadata.portrait_image.src} width={512} />
          <figcaption>
            <span>{metadata.portrait_image.caption}</span>
            <span>{metadata.portrait_image.credit}{metadata.portrait_image.origin === "ai_illustration" ? " · AI illustration" : ""}</span>
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
            cite: ({ children, title }) => <cite className="citation-link" title={title} style={{ cursor: "help", borderBottom: "1px dotted var(--accent)", fontStyle: "normal" }}>{children}</cite>,
            h2: ({ children }) => {
              const heading = headingText(children);
              const figures = (metadata.inline_media ?? []).filter((media) => media.after_heading === heading);
              return <><h2>{children}</h2>{figures.map((media) => <InlineArticleFigure key={media.asset_id} locale={locale} media={media} />)}</>;
            },
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

          {displayedSources.length > 0 && (
            <div className="evidence-section" id="evidence-sources">
              <h2>{text.sources}</h2>
              <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {displayedSources.map((source) => {
                  const meta = sourceDisplayMeta(source);
                  return (
                    <li key={source.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 12, lineHeight: 1.45 }}>
                      <a href={source.url} rel="noreferrer" target="_blank">{sourceDisplayTitle(source)}</a>
                      {meta && <small style={{ display: "block", marginTop: 5, color: "var(--muted)" }}>{meta}</small>}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div className="evidence-section">
            <p className="ai-note" style={{ margin: 0, color: "var(--muted)", fontSize: 11, lineHeight: 1.55 }}>{text.ai}</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="article-related" aria-labelledby="related-heading">
          <div className="article-related-heading">
            <p className="eyebrow">{locale === "ru" ? "Связи базы" : "Library connections"}</p>
            <h2 id="related-heading">{locale === "ru" ? "Материалы по теме" : "Related publications"}</h2>
          </div>
          <div className="article-related-grid">
            {related.map((item) => (
              <Link className="article-related-card" href={contentHref(item)} key={item.content_id}>
                <span>{copy[locale].section[sectionForContentType(item.content_type).split("/")[0]]?.title ?? item.content_type.replaceAll("_", " ")}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <i>{locale === "ru" ? "Открыть" : "Open"} →</i>
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
