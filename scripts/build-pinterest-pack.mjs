#!/usr/bin/env node
/** Build rights-aware API records and Pinterest Bulk Create CSV batches. */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_IDX = process.argv.indexOf("--out");
const OUT = OUT_IDX >= 0 ? path.resolve(process.argv[OUT_IDX + 1]) : path.join(ROOT, "work", "pinterest-pack");
const BULK_OUT = path.join(ROOT, "exports", "pinterest");
const DERIVATIVE_ROOT = path.join(ROOT, "public", "images", "pinterest");
const SITE = "https://vansmithlab.com";
const BOARD = "vansmithlab.com";
const BATCH_SIZE = 200;
const BULK_HEADER = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(current));
    else if (entry.name.endsWith(".json")) out.push(current);
  }
  return out;
}

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = (records, columns) => [columns.map(csvCell).join(","), ...records.map((record) => columns.map((column) => csvCell(record[column])).join(","))].join("\r\n") + "\r\n";
const truncate = (value, limit) => Array.from(String(value ?? "")).slice(0, limit).join("");
const stableId = (value) => createHash("sha256").update(value).digest("hex").slice(0, 20);

async function pinterestMedia(src) {
  if (/\.(?:jpe?g|png)$/i.test(src)) return `${SITE}${src}`;
  const input = path.join(ROOT, "public", src.replace(/^\/+/, ""));
  if (!fs.existsSync(input)) throw new Error(`Pinterest source image is missing: ${src}`);
  const filename = `${stableId(src)}.jpg`;
  const output = path.join(DERIVATIVE_ROOT, filename);
  if (!fs.existsSync(output)) {
    await sharp(input)
      .rotate()
      .flatten({ background: "#f4f0e7" })
      .resize({ width: 1500, height: 1000, fit: "cover", position: "attention" })
      .jpeg({ quality: 88, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toFile(output);
  }
  return `${SITE}/images/pinterest/${filename}`;
}

function rightsNote(hero) {
  return hero.licence_or_permission
    || hero.disclosure
    || (hero.rights_status === "ai_generated" ? "AI-generated editorial illustration; not documentary evidence." : "Use basis is recorded in the source publication.");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BULK_OUT, { recursive: true });
  fs.mkdirSync(DERIVATIVE_ROOT, { recursive: true });
  const records = [];

  for (const file of walk(path.join(ROOT, "content"))) {
    let meta;
    try { meta = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
    if (meta.state !== "published" || !meta.slug || !meta.hero_image?.src) continue;
    const locale = meta.locale === "ru" ? "ru" : "en";
    const route = path.relative(path.join(ROOT, "content", locale), path.dirname(file)).split(path.sep).join("/");
    const canonical = `${SITE}/${locale}/${route}/${meta.slug}/`;
    const media = await pinterestMedia(meta.hero_image.src);
    const credit = meta.hero_image.credit || "VANSMITHLAB";
    const title = truncate(`${meta.title} — ${locale.toUpperCase()} | VANSMITHLAB`, 100);
    const description = truncate(`${meta.summary} · ${credit}`, 500);
    const keywords = [...new Set([...(meta.discipline ?? []), ...(meta.categories ?? []), "design", "visual culture", "VANSMITHLAB"])].join(", ");
    records.push({
      source_release_id: meta.content_id,
      locale,
      title,
      description,
      canonical_link: canonical,
      media_image: media,
      alt_text: meta.hero_image.alt || meta.summary,
      credit,
      rights_note: rightsNote(meta.hero_image),
      origin: meta.hero_image.origin || "",
      rights_status: meta.hero_image.rights_status || meta.hero_image.rights_state || "",
      verification_state: meta.verification_state,
      confidence: meta.confidence_score,
      source_revision: meta.source_revision,
      updated: meta.last_reviewed,
      keywords,
      "Title": title,
      "Media URL": media,
      "Pinterest board": BOARD,
      "Thumbnail": "",
      "Description": description,
      "Link": canonical,
      "Publish date": "",
      "Keywords": keywords,
    });
  }

  records.sort((a, b) => a.locale.localeCompare(b.locale) || a.title.localeCompare(b.title, a.locale) || a.canonical_link.localeCompare(b.canonical_link));
  const duplicateTitle = new Set();
  for (const record of records) {
    if (duplicateTitle.has(record.title)) {
      record.title = truncate(`${record.title.replace(/ \| VANSMITHLAB$/, "")} · ${stableId(record.canonical_link).slice(0, 6)} | VANSMITHLAB`, 100);
      record.Title = record.title;
    }
    duplicateTitle.add(record.title);
  }

  const packPath = path.join(OUT, "pinterest-pack.json");
  fs.writeFileSync(packPath, JSON.stringify({ generated_at: new Date().toISOString(), site: SITE, board: BOARD, note: "Derivative records; API publishing remains disabled without authorised credentials.", records }, null, 2));
  const internalColumns = ["source_release_id", "locale", "title", "description", "canonical_link", "media_image", "alt_text", "credit", "rights_note", "origin", "rights_status", "verification_state", "confidence", "source_revision", "updated"];
  fs.writeFileSync(path.join(OUT, "pinterest-pack.csv"), csv(records, internalColumns), "utf8");
  fs.writeFileSync(path.join(BULK_OUT, "pinterest-bulk-all.csv"), csv(records, BULK_HEADER), "utf8");

  const batchFiles = [];
  for (let start = 0; start < records.length; start += BATCH_SIZE) {
    const number = Math.floor(start / BATCH_SIZE) + 1;
    const filename = `pinterest-bulk-${String(number).padStart(3, "0")}.csv`;
    fs.writeFileSync(path.join(BULK_OUT, filename), csv(records.slice(start, start + BATCH_SIZE), BULK_HEADER), "utf8");
    batchFiles.push({ file: filename, first_record: start + 1, last_record: Math.min(start + BATCH_SIZE, records.length), count: Math.min(BATCH_SIZE, records.length - start) });
  }
  fs.writeFileSync(path.join(BULK_OUT, "manifest.json"), JSON.stringify({ generated_at: new Date().toISOString(), source: `${SITE}/feed.xml`, board: BOARD, total_records: records.length, batch_size: BATCH_SIZE, batch_files: batchFiles, headers: BULK_HEADER, note: "Upload numbered batches in order. The all.csv file is an archive and exceeds Pinterest's 200-Pin per-upload limit." }, null, 2));

  const byLocale = records.reduce((acc, record) => ((acc[record.locale] = (acc[record.locale] || 0) + 1), acc), {});
  console.log(`Pinterest pack: ${records.length} records; ${batchFiles.length} upload batches; locales ${JSON.stringify(byLocale)}`);
  console.log(`  API pack: ${path.relative(ROOT, packPath)}`);
  console.log(`  Bulk CSV: ${path.relative(ROOT, BULK_OUT)}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
