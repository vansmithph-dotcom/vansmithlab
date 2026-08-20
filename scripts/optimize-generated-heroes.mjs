import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const queuePath = join(root, "work", "missing-hero-generation-queue.json");
const queue = JSON.parse(readFileSync(queuePath, "utf8"));

function contentIndex(locale) {
  const index = new Map();
  const walk = (directory) => {
    for (const name of readdirSync(directory)) {
      const fullPath = join(directory, name);
      if (statSync(fullPath).isDirectory()) walk(fullPath);
      else if (name.endsWith(".json")) {
        const slug = basename(name, ".json");
        if (!index.has(slug)) index.set(slug, []);
        index.get(slug).push(fullPath);
      }
    }
  };
  walk(join(root, "content", locale));
  return index;
}

const indexes = { ru: contentIndex("ru"), en: contentIndex("en") };
let optimized = 0;
let bytesBefore = 0;
let bytesAfter = 0;

for (const item of queue.pairs) {
  const originalTarget = item.target;
  const pngTarget = originalTarget.replace(/\.webp$/i, ".png");
  const webpTarget = pngTarget.replace(/\.png$/i, ".webp");
  const pngPath = join(root, "public", ...pngTarget.split("/").filter(Boolean));
  const webpPath = join(root, "public", ...webpTarget.split("/").filter(Boolean));

  if (existsSync(pngPath)) {
    bytesBefore += statSync(pngPath).size;
    const temporaryImage = `${webpPath}.tmp.webp`;
    await sharp(pngPath)
      .rotate()
      .resize(1536, 1024, { fit: "cover", position: "attention", withoutEnlargement: true })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(temporaryImage);
    renameSync(temporaryImage, webpPath);
  } else if (!existsSync(webpPath)) {
    throw new Error(`${item.slug}: neither PNG nor WebP source exists`);
  }

  const bytes = readFileSync(webpPath);
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const metadata = await sharp(webpPath).metadata();
  if (metadata.format !== "webp" || metadata.width !== 1536 || metadata.height !== 1024) {
    throw new Error(`${item.slug}: invalid optimized raster ${metadata.width}x${metadata.height} ${metadata.format}`);
  }

  for (const locale of ["ru", "en"]) {
    const matches = indexes[locale].get(item.slug) || [];
    if (matches.length !== 1) throw new Error(`${item.slug}/${locale}: expected one content file, got ${matches.length}`);
    const contentPath = matches[0];
    const content = JSON.parse(readFileSync(contentPath, "utf8"));
    if (!content.hero_image) throw new Error(`${item.slug}/${locale}: hero_image is missing`);
    content.hero_image.src = webpTarget;
    content.hero_image.storage_key = webpTarget;
    content.hero_image.content_hash = contentHash;
    content.hero_image.width = metadata.width;
    content.hero_image.height = metadata.height;
    content.hero_image.mime_type = "image/webp";
    const temporaryContent = `${contentPath}.tmp`;
    writeFileSync(temporaryContent, `${JSON.stringify(content, null, 2)}\n`, "utf8");
    renameSync(temporaryContent, contentPath);
  }

  item.target = webpTarget;
  item.media = {
    ...item.media,
    content_hash: contentHash,
    storage_key: webpTarget,
    width: metadata.width,
    height: metadata.height,
    mime_type: "image/webp",
    optimized_at: new Date().toISOString()
  };
  queue.generated_at = new Date().toISOString();
  const temporaryQueue = `${queuePath}.tmp`;
  writeFileSync(temporaryQueue, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  renameSync(temporaryQueue, queuePath);

  bytesAfter += statSync(webpPath).size;
  if (existsSync(pngPath)) unlinkSync(pngPath);
  optimized += 1;
}

console.log(JSON.stringify({ optimized, bytes_before: bytesBefore, bytes_after: bytesAfter }));
