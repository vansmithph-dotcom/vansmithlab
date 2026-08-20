import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const QUEUE = join(ROOT, "work", "profile-portrait-queue.json");
const OUT = join(ROOT, "public", "images", "profile-portraits");
const queue = JSON.parse(readFileSync(QUEUE, "utf8"));
mkdirSync(OUT, { recursive: true });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const requestedSlug = process.argv[2] || "";
const containSlugs = new Set([
  "paola-antonelli-expanding-design-museum-curation",
  "eileen-gray-interior-body-privacy-modernism",
]);

const stripHtml = (value) => String(value || "")
  .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

function rightsStatus(licence) {
  const value = String(licence || "").toLowerCase();
  if (value.includes("public domain")) return "public_domain";
  if (value.includes("cc0")) return "cc0";
  if (value.includes("by-sa")) return "cc_by_sa";
  if (value.includes("cc by")) return "cc_by";
  return "review_required";
}

function atomicJson(path, value) {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(tmp, path);
}

for (const [index, item] of queue.pairs.entries()) {
  if (requestedSlug && item.slug !== requestedSlug) continue;
  if (!requestedSlug && !["source_found", "download_error"].includes(item.status)) continue;
  if (!item.source) continue;
  try {
    await delay(1600);
    const response = await fetch(item.source.download_url, { headers: { "User-Agent": "VANSMITHLAB-media-production/1.0 (https://vansmithlab.com)" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const input = Buffer.from(await response.arrayBuffer());
    const filename = `${item.slug}-portrait-wikimedia-v1.webp`;
    const outputPath = join(OUT, filename);
    const resize = containSlugs.has(item.slug)
      ? { width: 900, height: 1125, fit: "contain", background: "#e9e5dc" }
      : { width: 900, height: 1125, fit: "cover", position: sharp.strategy.attention };
    await sharp(input)
      .rotate()
      .resize(resize)
      .webp({ quality: 86, effort: 6 })
      .toFile(outputPath);
    const output = readFileSync(outputPath);
    const hash = createHash("sha256").update(output).digest("hex");
    const sourceArtist = stripHtml(item.source.artist) || "Wikimedia Commons contributor";
    const licence = stripHtml(item.source.licence) || "Wikimedia Commons licence";
    const credit = `${sourceArtist} / Wikimedia Commons · ${licence}`;
    const base = {
      src: `/images/profile-portraits/${filename}`,
      credit,
      origin: "wikimedia_commons",
      rights_status: rightsStatus(licence),
      licence,
      licence_url: item.source.licence_url || "",
      source_url: item.source.source_page,
      access_date: new Date().toISOString().slice(0, 10),
      asset_id: `ast_${hash.slice(0, 16)}`,
      content_hash: hash,
      storage_key: `public/images/profile-portraits/${filename}`,
      width: 900,
      height: 1125,
    };
    for (const locale of ["en", "ru"]) {
      const path = join(ROOT, item.files[locale]);
      const record = JSON.parse(readFileSync(path, "utf8"));
      record.portrait_image = {
        ...base,
        alt: locale === "ru" ? `Портрет: ${record.title}` : `Portrait of ${record.title}`,
        caption: locale === "ru"
          ? `Портрет ${record.title}. Источник: Wikimedia Commons.`
          : `Portrait of ${record.title}. Source: Wikimedia Commons.`,
      };
      atomicJson(path, record);
    }
    item.status = "attached";
    item.portrait = { ...base, filename: basename(outputPath) };
    item.error = null;
    atomicJson(QUEUE, { ...queue, generated_at: new Date().toISOString() });
    console.log(`${index + 1}/${queue.pairs.length} attached ${item.name}`);
  } catch (error) {
    item.status = "download_error";
    item.error = String(error);
    atomicJson(QUEUE, { ...queue, generated_at: new Date().toISOString() });
    console.error(`${index + 1}/${queue.pairs.length} failed ${item.name}: ${error}`);
  }
}
