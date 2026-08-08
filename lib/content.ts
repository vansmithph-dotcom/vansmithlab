import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./site-data";

export type ContentMetadata = {
  content_id: string; primary_object_id: string; content_type: string; locale: Locale; slug: string; title: string; summary: string;
  state: "published"; source_locale: "ru"; source_revision: number; verification_state: "verified" | "multi_source_verified" | "partially_verified";
  confidence_score: number; claim_ids: string[]; source_ids: string[]; last_reviewed: string; author: string; body_hash: string;
  hero_image?: { src: string; alt: string; caption: string; credit: string; origin: "ai_illustration" | "licensed" | "public_domain" | "editorial_diagram" };
  translation?: { source_locale: "ru"; source_revision: number; semantic_validated: boolean; review_run_id: string };
};
export type KnowledgeSource = { id: string; title: string; url: string; publisher: string; source_tier: number; accessed_at: string };
export type KnowledgeCitation = { id: string; claim_id: string; source_id: string; locator: string; support: string };
export type PublishedContent = { metadata: ContentMetadata; body: string; sources: KnowledgeSource[]; citations: KnowledgeCitation[] };

const contentRoot = path.join(process.cwd(), "content");
const knowledgeRoot = path.join(process.cwd(), "knowledge", "objects");
const publicSections = new Set(["encyclopedia", "glossary", "glossary/designers", "glossary/artists", "articles", "analysis", "timeline", "collection", "collections"]);
const normalizedSection = (section: string) => section === "collections" ? "collection" : section;

// Section directories can nest one level deep (e.g. "glossary/designers"). We walk each
// public section directory and, if it holds no content files directly, look one level
// further down for a recognised nested section instead of silently returning nothing.
function readJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
}

export function listContent(locale?: Locale, section?: string): ContentMetadata[] {
  const items: ContentMetadata[] = [];
  for (const currentLocale of locale ? [locale] : (["ru", "en"] as Locale[])) {
    const localeDir = path.join(contentRoot, currentLocale);
    if (!fs.existsSync(localeDir)) continue;
    const sectionDirs = section
      ? [...new Set([section, normalizedSection(section)])]
      : [...publicSections].filter((candidate) => fs.existsSync(path.join(localeDir, candidate)));
    for (const sectionDir of sectionDirs) {
      if (!publicSections.has(sectionDir) && section) continue;
      const dir = path.join(localeDir, sectionDir);
      for (const file of readJsonFiles(dir)) {
        const metadata = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as ContentMetadata;
        if (metadata.state === "published") items.push(metadata);
      }
    }
  }
  return items.sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed));
}

export function sectionForContentType(contentType: string): string {
  if (contentType === "encyclopedia") return "encyclopedia";
  if (contentType === "designer_profile") return "glossary/designers";
  if (contentType === "artist_profile") return "glossary/artists";
  if (contentType === "research" || contentType === "case_study" || contentType === "visual_analysis") return "articles";
  if (contentType === "collection") return "collections";
  return contentType;
}

// Translations share a content_id across locales even though their slug and content_type-derived
// section string are independent, so this is the only reliable way to find a page's counterpart.
export function findTranslation(contentId: string, targetLocale: Locale): ContentMetadata | undefined {
  return listContent(targetLocale).find((item) => item.content_id === contentId);
}

// Builds the `alternates.languages` (hreflang) map for a content page. Only includes a locale
// once its page actually exists вЂ” a hreflang link to a non-existent translation is worse than
// no hreflang at all. Russian is the editorial source of truth, so it is always x-default.
export function localeAlternates(locale: Locale, canonical: string, translation?: ContentMetadata): Record<string, string> {
  const otherLocale: Locale = locale === "ru" ? "en" : "ru";
  const languages: Record<string, string> = { [locale]: canonical };
  if (translation) languages[otherLocale] = `/${otherLocale}/${sectionForContentType(translation.content_type)}/${translation.slug}`;
  languages["x-default"] = locale === "ru" ? canonical : (languages.ru ?? canonical);
  return languages;
}

export function getContent(locale: Locale, section: string, slug: string): PublishedContent | null {
  for (const sectionDir of [...new Set([section, normalizedSection(section)])]) {
    const base = path.join(contentRoot, locale, sectionDir, slug);
    if (!fs.existsSync(`${base}.json`) || !fs.existsSync(`${base}.md`)) continue;
    const metadata = JSON.parse(fs.readFileSync(`${base}.json`, "utf8")) as ContentMetadata;
    const body = fs.readFileSync(`${base}.md`, "utf8");
    let knowledge: { sources: KnowledgeSource[]; citations: KnowledgeCitation[] } = { sources: [], citations: [] };
    try {
      knowledge = JSON.parse(fs.readFileSync(path.join(knowledgeRoot, `${metadata.primary_object_id}.json`), "utf8"));
    } catch { /* knowledge object not yet created — return empty sources */ }

    return {
      metadata,
      body,
      sources: knowledge.sources.filter((source) => metadata.source_ids.includes(source.id)),
      citations: (knowledge.citations || []).filter((citation) => metadata.claim_ids.includes(citation.claim_id) && metadata.source_ids.includes(citation.source_id))
    };
  }
  return null;
}
