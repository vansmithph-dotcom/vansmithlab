#!/usr/bin/env node
/**
 * Build a Pinterest-compatible distribution package for VANSMITHLAB.
 *
 * Per VANSMITHLAB_OS/13_PUBLICATION_AND_DISTRIBUTION.md, social content is a
 * derivative, never a source of truth. Every Pinterest record carries its
 * source release ID, locale, canonical link, hero media with rights-safe
 * credit and the verification state, so a source change can update or
 * withdraw the pin consistently.
 *
 * Pinterest channel is NOT activated here: this package is the input an
 * authorised Pinterest API client (or manual board import) consumes once a
 * user-provided access token and domain verification exist.
 *
 * Usage: node scripts/build-pinterest-pack.mjs [--out <dir>]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_IDX = process.argv.indexOf("--out");
const OUT = OUT_IDX >= 0 ? process.argv[OUT_IDX + 1] : path.join(ROOT, "work", "pinterest-pack");
const SITE = "https://vansmithlab.com";

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".json")) out.push(p);
  }
  return out;
}

function main() {
  const records = [];
  const contentFiles = walk(path.join(ROOT, "content"));
  for (const file of contentFiles) {
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    if (meta.state !== "published" || !meta.slug || !meta.hero_image) continue;
    const locale = meta.locale === "ru" ? "ru" : "en";
    // Route is the directory under content/<locale>, e.g. encyclopedia or
    // glossary/photographers — this mirrors lib/content.ts routing exactly.
    const rel = path.relative(path.join(ROOT, "content", meta.locale), path.dirname(file));
    const route = rel.split(path.sep).join("/");
    const canonical = `${SITE}/${locale}/${route}/${meta.slug}/`;
    const media = `${SITE}${meta.hero_image.src}`;
    const credit = meta.hero_image.credit || "VANSMITHLAB";
    records.push({
      source_release_id: meta.content_id,
      locale,
      title: meta.title,
      description: meta.summary,
      canonical_link: canonical,
      media_image: media,
      credit,
      rights_note: "Original AI editorial visual; VANSMITHLAB · credit required",
      verification_state: meta.verification_state,
      confidence: meta.confidence_score,
      source_revision: meta.source_revision,
      updated: meta.last_reviewed,
    });
  }
  records.sort((a, b) => a.title.localeCompare(b.title, a.locale));

  fs.mkdirSync(OUT, { recursive: true });
  const packPath = path.join(OUT, "pinterest-pack.json");
  fs.writeFileSync(packPath, JSON.stringify({ generated_at: new Date().toISOString().slice(0, 10), site: SITE, note: "Derivative records for Pinterest import; channel not activated without an authorised API token.", records }, null, 2));

  const csvPath = path.join(OUT, "pinterest-pack.csv");
  const header = ["source_release_id", "locale", "title", "description", "canonical_link", "media_image", "credit", "rights_note", "verification_state", "confidence", "source_revision", "updated"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = records.map((r) => header.map((h) => esc(r[h])).join(","));
  fs.writeFileSync(csvPath, [header.map(esc).join(","), ...rows].join("\n"));

  console.log(`pinterest pack: ${records.length} records`);
  console.log(`  json: ${path.relative(ROOT, packPath)}`);
  console.log(`  csv:  ${path.relative(ROOT, csvPath)}`);
  const byLocale = records.reduce((acc, r) => ((acc[r.locale] = (acc[r.locale] || 0) + 1), acc), {});
  console.log(`  locales: ${JSON.stringify(byLocale)}`);
}

main();
