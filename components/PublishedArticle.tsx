import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { PublishedContent } from "@/lib/content";
import type { Locale } from "@/lib/site-data";

const labels = {
  ru: { back: "Назад", verification: "Проверка", confidence: "Уверенность", reviewed: "Обновлено", sources: "Источники", revision: "Ревизия", ai: "Материал подготовлен автоматизированной редакционной системой и прошёл проверку источников." },
  en: { back: "Back", verification: "Verification", confidence: "Confidence", reviewed: "Last reviewed", sources: "Sources", revision: "Revision", ai: "This publication was prepared by an automated editorial system and passed source validation." }
} as const;

export function PublishedArticle({ locale, section, content }: { locale: Locale; section: string; content: PublishedContent }) {
  const { metadata, body, sources } = content;
  const text = labels[locale];
  return (
    <article className="shell object-page published-article">
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
      <div className="article-layout">
        <div className="article-copy"><ReactMarkdown>{body}</ReactMarkdown></div>
        <aside className="source-rail"><h2>{text.sources}</h2><ol>{sources.map((source) => <li key={source.id}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a><small>{source.publisher} · {source.accessed_at}</small></li>)}</ol><p className="ai-note">{text.ai}</p></aside>
      </div>
    </article>
  );
}
