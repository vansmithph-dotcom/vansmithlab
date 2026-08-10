import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./site-data";
import { GLOSSARY_SECTIONS, ROLES } from "./taxonomy";

export type ContentMetadata = {
  content_id: string; primary_object_id: string; content_type: string; locale: Locale; slug: string; title: string; summary: string;
  state: "published" | "drafted"; source_locale: "ru"; source_revision: number; verification_state: "verified" | "multi_source_verified" | "partially_verified" | "unverified";
  categories?: string[];
  confidence_score: number; claim_ids: string[]; source_ids: string[]; last_reviewed: string; author: string; body_hash: string;
  hero_image?: MediaReference;
  portrait_image?: MediaReference;
  translation?: { source_locale: "ru"; source_revision: number; semantic_validated: boolean; review_run_id: string };
};
type MediaReference = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  origin: "original" | "official" | "licensed" | "public_domain" | "editorial" | "editorial_diagram" | "wikipedia" | "wikimedia_commons" | "ai_illustration" | "ai_reconstruction";
  rights_status?: "public_domain" | "licensed" | "attribution_required" | "editorial_basis_recorded" | "review_required" | "ai_generated" | "permission_confirmed" | "cc_by_sa";
  source_url?: string;
  licence_or_permission?: string;
};
export type KnowledgeSource = { id: string; title: string; url: string; publisher: string; source_tier: number; accessed_at: string };
export type KnowledgeCitation = { id: string; claim_id: string; source_id: string; locator: string; support: string };
export type PublishedContent = { metadata: ContentMetadata; body: string; sources: KnowledgeSource[]; citations: KnowledgeCitation[] };

const contentRoot = path.join(process.cwd(), "content");
const knowledgeRoot = path.join(process.cwd(), "knowledge", "objects");
const sourceRegistryPath = path.join(process.cwd(), "knowledge", "sources.json");
const publicSections = new Set([
  "encyclopedia", "glossary", ...GLOSSARY_SECTIONS,
  "articles", "analysis", "timeline", "collection", "collections",
]);
const normalizedSection = (section: string) => section === "collections" ? "collection" : section;

// Person profiles are keyed `<role>_profile` and derived from the taxonomy, so a
// new role needs no entry here. `designer_profile` predates the v2 split and is
// kept as an alias for fashion designers.
const contentSectionMap: Record<string, string> = {
  encyclopedia: "encyclopedia",
  designer_profile: "glossary/designers",
  research: "articles",
  case_study: "articles",
  visual_analysis: "articles",
  collection: "collections",
  ...Object.fromEntries(ROLES.map((role) => [`${role.role.replaceAll("-", "_")}_profile`, `glossary/${role.route}`])),
};

// Content JSON and knowledge objects use different id namespaces (the docx pipeline
// minted content ids, while knowledge objects carry their own ids). The reliable
// link is the slug: each knowledge object records slug_ru/slug_en that match the
// content slug for its canonical locale. We index once per process to avoid
// repeated filesystem walks during build.
let knowledgeIndex: Record<string, string> | null = null;
function knowledgeIdForSlug(slug: string): string | undefined {
  if (!knowledgeIndex) {
    knowledgeIndex = {};
    if (fs.existsSync(knowledgeRoot)) {
      for (const file of fs.readdirSync(knowledgeRoot)) {
        if (!file.endsWith(".json")) continue;
        try {
          const obj = JSON.parse(fs.readFileSync(path.join(knowledgeRoot, file), "utf8"));
          for (const key of ["slug_ru", "slug_en", "slug"]) {
            if (typeof obj[key] === "string" && obj[key]) knowledgeIndex[obj[key]] = obj.id ?? file.replace(/\.json$/, "");
          }
        } catch { /* skip malformed object */ }
      }
    }
  }
  return knowledgeIndex[slug];
}

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
        // `drafted` pages are listed as well: they carry their real
        // verification_state, so the badge tells the reader what has and has not
        // been through the evidence gate. Hiding them would leave the corpus
        // invisible while every page still claimed to be verified.
        if (metadata.state === "published" || metadata.state === "drafted") items.push(metadata);
      }
    }
  }
  return items.sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed));
}

export function sectionForContentType(contentType: string): string {
  return contentSectionMap[contentType] ?? contentType;
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
    const candidateIds = new Set<string>([metadata.primary_object_id]);
    const bySlug = knowledgeIdForSlug(slug);
    if (bySlug) candidateIds.add(bySlug);
    for (const candidateId of candidateIds) {
      const knowledgePath = path.join(knowledgeRoot, `${candidateId}.json`);
      if (fs.existsSync(knowledgePath)) {
        try {
          knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
          break;
        } catch { /* malformed — try next candidate */ }
      }
    }

    // Older encyclopedia releases have source_ids but no primary knowledge object.
    // Resolve those IDs against the canonical source registry instead of turning
    // every citation into a same-page fallback.
    if (knowledge.sources.length === 0 && metadata.source_ids.length > 0 && fs.existsSync(sourceRegistryPath)) {
      try {
        const registry = JSON.parse(fs.readFileSync(sourceRegistryPath, "utf8")) as { sources?: KnowledgeSource[] };
        knowledge.sources = (registry.sources || []).filter((source) => metadata.source_ids.includes(source.id));
      } catch { /* keep the empty source set and render an honest unmapped marker */ }
    }
    const matchedSources = knowledge.sources.filter((source) => metadata.source_ids.includes(source.id));
    const matchedCitations = (knowledge.citations || []).filter(
      (citation) => metadata.claim_ids.includes(citation.claim_id) && metadata.source_ids.includes(citation.source_id)
    );
    // The docx pipeline minted source/claim ids independently of the knowledge
    // objects, so the content's explicit ids may not match anything in the
    // object even though the object is the correct one for this slug. In that
    // case fall back to the object's full source/citation set so citations and
    // the evidence rail still render with real URLs.
    const sources = matchedSources.length > 0 ? matchedSources : (knowledge.sources || []);
    const citations = matchedCitations.length > 0 ? matchedCitations : (knowledge.citations || []);

    return {
      metadata,
      body,
      sources,
      citations,
    };
  }
  return null;
}
