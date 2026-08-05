import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./site-data";

export type ContentMetadata = {
  content_id: string; primary_object_id: string; content_type: string; locale: Locale; slug: string; title: string; summary: string;
  state: "published"; source_locale: "ru"; source_revision: number; verification_state: "verified" | "multi_source_verified";
  confidence_score: number; claim_ids: string[]; source_ids: string[]; last_reviewed: string; author: string; body_hash: string;
  hero_image?: { src: string; alt: string; caption: string; credit: string; origin: "ai_illustration" | "licensed" | "public_domain" };
  translation?: { source_locale: "ru"; source_revision: number; semantic_validated: boolean; review_run_id: string };
};
export type KnowledgeSource = { id: string; title: string; url: string; publisher: string; source_tier: number; accessed_at: string };
export type KnowledgeCitation = { id: string; claim_id: string; source_id: string; locator: string; support: string };
export type PublishedContent = { metadata: ContentMetadata; body: string; sources: KnowledgeSource[]; citations: KnowledgeCitation[] };

const contentRoot = path.join(process.cwd(), "content");
const knowledgeRoot = path.join(process.cwd(), "knowledge", "objects");
const publicSections = new Set(["encyclopedia", "glossary", "articles", "analysis", "timeline", "collection", "collections"]);
const normalizedSection = (section: string) => section === "collections" ? "collection" : section;

export function listContent(locale?: Locale, section?: string): ContentMetadata[] {
  const items: ContentMetadata[] = [];
  for (const currentLocale of locale ? [locale] : (["ru", "en"] as Locale[])) {
    const localeDir = path.join(contentRoot, currentLocale);
    if (!fs.existsSync(localeDir)) continue;
    const sectionDirs = section ? [...new Set([section, normalizedSection(section)])] : fs.readdirSync(localeDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    for (const sectionDir of sectionDirs) {
      if (!publicSections.has(sectionDir) && section) continue;
      const dir = path.join(localeDir, sectionDir);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".json"))) {
        const metadata = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as ContentMetadata;
        if (metadata.state === "published") items.push(metadata);
      }
    }
  }
  return items.sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed));
}

export function getContent(locale: Locale, section: string, slug: string): PublishedContent | null {
  for (const sectionDir of [...new Set([section, normalizedSection(section)])]) {
    const base = path.join(contentRoot, locale, sectionDir, slug);
    if (!fs.existsSync(`${base}.json`) || !fs.existsSync(`${base}.md`)) continue;
    const metadata = JSON.parse(fs.readFileSync(`${base}.json`, "utf8")) as ContentMetadata;
    const body = fs.readFileSync(`${base}.md`, "utf8");
    const knowledge = JSON.parse(fs.readFileSync(path.join(knowledgeRoot, `${metadata.primary_object_id}.json`), "utf8")) as { sources: KnowledgeSource[]; citations: KnowledgeCitation[] };
    return {
      metadata,
      body,
      sources: knowledge.sources.filter((source) => metadata.source_ids.includes(source.id)),
      citations: (knowledge.citations || []).filter((citation) => metadata.claim_ids.includes(citation.claim_id) && metadata.source_ids.includes(citation.source_id))
    };
  }
  return null;
}
