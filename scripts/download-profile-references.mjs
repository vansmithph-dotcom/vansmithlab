import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const configPath = join(root, "work", "profile-reference-sources.json");
const queuePath = join(root, "work", "profile-portrait-queue.json");
const outputDir = join(root, "work", "portrait-references");
const requested = process.argv.slice(2);
const sources = JSON.parse(readFileSync(configPath, "utf8"));
const queue = JSON.parse(readFileSync(queuePath, "utf8"));

mkdirSync(outputDir, { recursive: true });

const atomicWrite = (path, value) => {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
};

for (const pair of queue.pairs) {
  if (pair.status === "attached" && !requested.includes(pair.slug)) continue;
  if (requested.length && !requested.includes(pair.slug)) continue;
  const source = sources[pair.slug];
  if (!source?.download_url) {
    pair.status = "needs_reference";
    pair.error = "No reviewed reference image URL configured";
    atomicWrite(queuePath, queue);
    continue;
  }

  try {
    const response = await fetch(source.download_url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 VANSMITHLAB-media-research/1.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: source.source_page
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height) throw new Error("Downloaded file is not a decodable raster image");
    const destination = join(outputDir, `${pair.slug}.jpg`);
    await sharp(bytes).rotate().jpeg({ quality: 92, mozjpeg: true }).toFile(destination);
    pair.source = {
      source_kind: "editorial_reference",
      source_page: source.source_page,
      download_url: source.download_url,
      local_reference: destination.slice(root.length + 1).replaceAll("\\", "/"),
      width: metadata.width,
      height: metadata.height,
      retrieved_at: new Date().toISOString()
    };
    pair.status = "reference_ready";
    pair.error = null;
    atomicWrite(queuePath, queue);
    console.log(`reference_ready ${pair.slug}`);
  } catch (error) {
    pair.status = "download_error";
    pair.error = error.message;
    atomicWrite(queuePath, queue);
    console.error(`download_error ${pair.slug}: ${error.message}`);
  }
}

queue.generated_at = new Date().toISOString();
atomicWrite(queuePath, queue);
