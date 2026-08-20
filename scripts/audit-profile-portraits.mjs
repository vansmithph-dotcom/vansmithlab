import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const queue = JSON.parse(readFileSync(join(root, "work", "profile-portrait-queue.json"), "utf8"));
const errors = [];
const uniqueAssets = new Map();
const origins = new Map();
let localizedRecords = 0;

for (const pair of queue.pairs) {
  if (pair.status !== "attached") errors.push(`${pair.slug}: queue status is ${pair.status}`);
  for (const [locale, relativePath] of Object.entries(pair.files)) {
    const contentPath = join(root, relativePath);
    const content = JSON.parse(readFileSync(contentPath, "utf8"));
    const portrait = content.portrait_image;
    localizedRecords += 1;
    if (!portrait) {
      errors.push(`${pair.slug}/${locale}: portrait_image is missing`);
      continue;
    }
    for (const field of ["src", "origin", "rights_status", "licence", "licence_url", "source_url", "access_date", "asset_id", "content_hash", "storage_key", "width", "height", "alt", "caption"]) {
      if (!portrait[field]) errors.push(`${pair.slug}/${locale}: ${field} is missing`);
    }
    const assetPath = join(root, portrait.storage_key || "");
    if (!existsSync(assetPath)) {
      errors.push(`${pair.slug}/${locale}: asset does not exist: ${portrait.storage_key}`);
      continue;
    }
    if (!uniqueAssets.has(portrait.src)) {
      const bytes = readFileSync(assetPath);
      const digest = createHash("sha256").update(bytes).digest("hex");
      const metadata = await sharp(assetPath).metadata();
      if (metadata.width !== 900 || metadata.height !== 1125 || metadata.format !== "webp") {
        errors.push(`${pair.slug}: invalid raster ${metadata.width}x${metadata.height} ${metadata.format}`);
      }
      if (digest !== portrait.content_hash) errors.push(`${pair.slug}: content hash mismatch`);
      uniqueAssets.set(portrait.src, { slug: pair.slug, hash: digest });
      origins.set(portrait.origin, (origins.get(portrait.origin) || 0) + 1);
    } else if (uniqueAssets.get(portrait.src).slug !== pair.slug) {
      errors.push(`${pair.slug}: portrait asset reused from ${uniqueAssets.get(portrait.src).slug}`);
    }
  }
}

const summary = {
  pairs: queue.pairs.length,
  attached: queue.pairs.filter((pair) => pair.status === "attached").length,
  localized_records: localizedRecords,
  unique_assets: uniqueAssets.size,
  origins: Object.fromEntries([...origins.entries()].sort()),
  errors
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
