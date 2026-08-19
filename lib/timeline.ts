import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./site-data";

const knowledgeRoot = path.join(process.cwd(), "knowledge", "objects");
const contentRoot = path.join(process.cwd(), "content");

export type TimelineEvent = {
  claim_id: string;
  object_id: string;
  slug_ru?: string;
  object_title: string;
  object_title_en?: string;
  object_type: string;
  wording_ru: string;
  wording_en: string;
  date_start: string;
  date_end: string | null;
  date_precision: string;
};

export type TimelineYear = {
  year: number;
  events: TimelineEvent[];
};

type KnowledgeClaim = {
  id: string;
  wording_ru?: string;
  wording_en?: string;
  date_start?: string | number | null;
  date_end?: string | null;
  date_precision?: string;
};

type KnowledgeObject = {
  id?: string;
  slug_ru?: string;
  title_ru?: string;
  title_en?: string;
  type?: string;
  claims?: KnowledgeClaim[];
};

// Every date is stored as a year (possibly with a month/day suffix); the axis
// groups by the leading year and sorts newest first.
function yearOf(date: string | null): number | null {
  if (!date) return null;
  const m = /^\s*(\d{4})/.exec(date);
  return m ? Number(m[1]) : null;
}

let cache: TimelineEvent[] | null = null;

function loadEvents(): TimelineEvent[] {
  if (cache) return cache;
  const events: TimelineEvent[] = [];
  if (!fs.existsSync(knowledgeRoot)) {
    cache = events;
    return events;
  }
  for (const file of fs.readdirSync(knowledgeRoot)) {
    if (!file.endsWith(".json")) continue;
    let obj: KnowledgeObject;
    try {
      obj = JSON.parse(fs.readFileSync(path.join(knowledgeRoot, file), "utf8"));
    } catch {
      continue;
    }
    const objectId = obj.id ?? file.replace(/\.json$/, "");
    const slugRu = obj.slug_ru;
    const titleRu = obj.title_ru ?? obj.slug_ru ?? objectId;
    const titleEn = obj.title_en;
    for (const claim of obj.claims ?? []) {
      if (!claim.date_start) continue;
      events.push({
        claim_id: claim.id,
        object_id: objectId,
        slug_ru: slugRu,
        object_title: titleRu,
        object_title_en: titleEn,
        object_type: obj.type ?? "",
        wording_ru: claim.wording_ru ?? "",
        wording_en: claim.wording_en ?? "",
        date_start: String(claim.date_start),
        date_end: claim.date_end ?? null,
        date_precision: claim.date_precision ?? "year",
      });
    }
  }
  cache = events;
  return events;
}

export function listTimelineYears(locale: Locale): TimelineYear[] {
  const events = loadEvents();
  const byYear = new Map<number, TimelineEvent[]>();
  for (const ev of events) {
    const y = yearOf(ev.date_start);
    if (y == null) continue;
    // The English timeline only shows events that have an English wording; the
    // legacy corpus has none, so it would otherwise render Russian text on an
    // English page. The Russian timeline shows everything.
    if (locale === "en" && !ev.wording_en) continue;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(ev);
  }
  const years: TimelineYear[] = [...byYear.entries()]
    .map(([year, evs]) => ({
      year,
      events: evs.sort((a, b) => a.object_id.localeCompare(b.object_id) || a.claim_id.localeCompare(b.claim_id)),
    }))
    .sort((a, b) => b.year - a.year);
  return years;
}

export function timelineStats(): { events: number; objects: number; yearMin: number | null; yearMax: number | null } {
  const events = loadEvents();
  const objects = new Set(events.map((e) => e.object_id));
  const years = events.map((e) => yearOf(e.date_start)).filter((y): y is number => y != null);
  return {
    events: events.length,
    objects: objects.size,
    yearMin: years.length ? Math.min(...years) : null,
    yearMax: years.length ? Math.max(...years) : null,
  };
}

// Resolve the content-page href for an object in a locale by looking for its
// JSON in every public section directory. The knowledge object's slug_ru/slug_en
// match the content slug, and the section is discoverable from the filesystem.
export function contentHrefForObject(locale: Locale, ev: TimelineEvent): string | null {
  const slug = ev.slug_ru; // shared slug across locales
  if (!slug) return null;
  const base = path.join(contentRoot, locale);
  const dirs: string[] = [];
  const collect = (dir: string, prefix: string) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) collect(full, `${prefix}/${name}`);
      else if (name === `${slug}.json`) dirs.push(prefix === "" ? "" : prefix.slice(1));
    }
  };
  collect(base, "");
  if (dirs.length === 0) return null;
  // Prefer the shortest route (e.g. glossary/designers over analysis) — all are
  // valid, but glossary profiles are the dominant case.
  dirs.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
  const section = dirs[0];
  if (!section) return null;
  return `/${locale}/${section}/${slug}`;
}
