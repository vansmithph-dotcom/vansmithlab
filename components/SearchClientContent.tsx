"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { copy, isLocale, type Locale } from "@/lib/site-data";

export default function SearchClientContent({ locale: localeStr, allContent }: { locale: string; allContent: any[] }) {
  const locale = isLocale(localeStr) ? (localeStr as Locale) : "ru";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const content = copy[locale];
  const page = content.section["search"];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = allContent.filter((item) => {
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.slug?.toLowerCase().includes(q)
      );
    });
    setResults(filtered);
  }, [query, allContent]);

  return (
    <>
      <form className="search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input">{content.search}</label>
        <div>
          <input
            id="search-input"
            type="text"
            placeholder={content.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span aria-label={content.search}>⌕</span>
        </div>
      </form>

      {query.trim() && (
        <div className="listing-header">
          <p>
            {locale === "ru"
              ? `Результаты поиска по "${query}"`
              : `Search results for "${query}"`}
          </p>
          <span>{String(results.length).padStart(2, "0")}</span>
        </div>
      )}

      {query.trim() ? (
        results.length > 0 ? (
          <div className="listing-grid">
            {results.map((item) => (
              <Link
                className="listing-card listing-card-with-media"
                href={`/${locale}/${item.slug}`}
                key={item.content_id}
              >
                <span className="listing-card-copy">
                  <h2>{item.title}</h2>
                  <span className="listing-card-summary">{item.summary}</span>
                  {item.verification_state && (
                    <span className="listing-card-meta">
                      <small>
                        {item.verification_state.replaceAll("_", " ")} ·{" "}
                        {Math.round(item.confidence_score * 100)}%
                      </small>
                      <i>{content.labels.read} →</i>
                    </span>
                  )}
                </span>
                {item.hero_image && (
                  <span className="listing-card-media">
                    <Image
                      alt={item.hero_image.alt}
                      fill
                      sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 1280px) 50vw, 608px"
                      src={item.hero_image.src}
                    />
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="listing-grid">
            <article className="listing-card">
              <span className="listing-card-copy">
                <p>
                  {locale === "ru"
                    ? `По запросу "${query}" ничего не найдено`
                    : `No results found for "${query}"`}
                </p>
              </span>
            </article>
          </div>
        )
      ) : (
        <div className="listing-grid">
          <article className="listing-card">
            <span className="listing-card-copy">
              <span className="listing-card-summary">
                {locale === "ru"
                  ? "Введите запрос для поиска"
                  : "Enter a search query"}
              </span>
            </span>
          </article>
        </div>
      )}
    </>
  );
}
