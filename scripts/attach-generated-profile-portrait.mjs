import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const [slug, generatedPath] = process.argv.slice(2);
if (!slug || !generatedPath) {
  console.error("Usage: node scripts/attach-generated-profile-portrait.mjs <slug> <generated-image>");
  process.exit(1);
}

const root = process.cwd();
const queuePath = join(root, "work", "profile-portrait-queue.json");
const queue = JSON.parse(readFileSync(queuePath, "utf8"));
const pair = queue.pairs.find((item) => item.slug === slug);
if (!pair) throw new Error(`Unknown portrait slug: ${slug}`);
if (!pair.source?.source_page) throw new Error(`Missing reviewed source provenance for ${slug}`);

const outputDir = join(root, "public", "images", "profile-portraits");
mkdirSync(outputDir, { recursive: true });
const filename = `${slug}-portrait-ai-reconstruction-v1.webp`;
const outputPath = join(outputDir, filename);
const temporaryPath = `${outputPath}.tmp.webp`;

await sharp(generatedPath)
  .rotate()
  .resize(900, 1125, { fit: "cover", position: "attention" })
  .webp({ quality: 88, effort: 6, smartSubsample: true })
  .toFile(temporaryPath);
renameSync(temporaryPath, outputPath);

const bytes = readFileSync(outputPath);
const contentHash = createHash("sha256").update(bytes).digest("hex");
const assetId = `ast_${contentHash.slice(0, 16)}`;
const src = `/images/profile-portraits/${filename}`;
const accessDate = new Date().toISOString().slice(0, 10);

for (const [locale, relativePath] of Object.entries(pair.files)) {
  const contentPath = join(root, relativePath);
  const content = JSON.parse(readFileSync(contentPath, "utf8"));
  const isRu = locale === "ru";
  content.portrait_image = {
    src,
    credit: "VANSMITHLAB · AI reconstruction from reviewed public reference imagery, 2026",
    origin: "ai_reconstruction",
    rights_status: "ai_generated",
    licence: "VANSMITHLAB original AI reconstruction",
    licence_url: `https://vansmithlab.com/${locale}/method/`,
    source_url: pair.source.source_page,
    reference_url: pair.source.download_url,
    access_date: accessDate,
    disclosure: isRu
      ? "ИИ-реконструкция внешности на основе проверенного публичного фотографического референса; не архивная фотография."
      : "AI reconstruction of the subject based on a reviewed public photographic reference; not an archival photograph.",
    asset_id: assetId,
    content_hash: contentHash,
    storage_key: `public/images/profile-portraits/${filename}`,
    width: 900,
    height: 1125,
    alt: isRu ? `Портрет ${content.title}` : `Portrait of ${content.title}`,
    caption: isRu
      ? `ИИ-реконструкция портрета ${content.title} по публичному фотографическому референсу.`
      : `AI portrait reconstruction of ${content.title} from a public photographic reference.`
  };
  const temporaryContent = `${contentPath}.tmp`;
  writeFileSync(temporaryContent, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  renameSync(temporaryContent, contentPath);
}

pair.status = "attached";
pair.error = null;
pair.portrait = {
  src,
  storage_key: `public/images/profile-portraits/${filename}`,
  asset_id: assetId,
  content_hash: contentHash,
  width: 900,
  height: 1125,
  attached_at: new Date().toISOString(),
  generation_kind: "ai_reconstruction",
  reference_path: pair.source.local_reference
};
queue.generated_at = new Date().toISOString();
const temporaryQueue = `${queuePath}.tmp`;
writeFileSync(temporaryQueue, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
renameSync(temporaryQueue, queuePath);
console.log(JSON.stringify({ slug, src, asset_id: assetId, status: "attached" }));
