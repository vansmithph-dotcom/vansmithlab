import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicRoot = join(root, "public");
const imageRoot = join(publicRoot, "images");
const textExtensions = new Set([".json", ".md", ".tsx", ".ts", ".css", ".mjs", ".js", ".html", ".xml"]);
const sourceRoots = ["content", "app", "components", "lib", "public"].map((directory) => join(root, directory)).filter(existsSync);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const pngFiles = walk(imageRoot).filter((file) => extname(file).toLowerCase() === ".png");
const conversions = new Map();
let bytesBefore = 0;
let bytesAfter = 0;

for (const pngPath of pngFiles) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  const temporaryPath = `${webpPath}.tmp.webp`;
  const oldUrl = `/${relative(publicRoot, pngPath).replaceAll("\\", "/")}`;
  const newUrl = oldUrl.replace(/\.png$/i, ".webp");
  bytesBefore += statSync(pngPath).size;
  await sharp(pngPath).rotate().webp({ quality: 86, effort: 6, smartSubsample: true }).toFile(temporaryPath);
  renameSync(temporaryPath, webpPath);
  const bytes = readFileSync(webpPath);
  const metadata = await sharp(webpPath).metadata();
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  conversions.set(oldUrl, { newUrl, webpPath, contentHash, width: metadata.width, height: metadata.height });
  bytesAfter += bytes.length;
}

function updateMediaObjects(value) {
  if (Array.isArray(value)) {
    value.forEach(updateMediaObjects);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value.src === "string" && conversions.has(value.src)) {
    const conversion = conversions.get(value.src);
    value.src = conversion.newUrl;
    if (typeof value.storage_key === "string") value.storage_key = value.storage_key.replace(/\.png$/i, ".webp");
    if ("content_hash" in value) value.content_hash = conversion.contentHash;
    value.width = conversion.width;
    value.height = conversion.height;
    value.mime_type = "image/webp";
  }
  Object.values(value).forEach(updateMediaObjects);
}

let updatedFiles = 0;
for (const file of sourceRoots.flatMap(walk).filter((path) => textExtensions.has(extname(path).toLowerCase()))) {
  let text = readFileSync(file, "utf8");
  const original = text;
  if (extname(file).toLowerCase() === ".json") {
    try {
      const value = JSON.parse(text);
      updateMediaObjects(value);
      text = `${JSON.stringify(value, null, 2)}\n`;
    } catch {
      // Non-JSON text with a .json suffix is handled by literal replacement below.
    }
  }
  for (const [oldUrl, conversion] of conversions) text = text.replaceAll(oldUrl, conversion.newUrl);
  if (text !== original) {
    const temporaryPath = `${file}.tmp`;
    writeFileSync(temporaryPath, text, "utf8");
    renameSync(temporaryPath, file);
    updatedFiles += 1;
  }
}

for (const [oldUrl, conversion] of conversions) {
  const unresolved = sourceRoots.flatMap(walk)
    .filter((path) => textExtensions.has(extname(path).toLowerCase()))
    .some((path) => readFileSync(path, "utf8").includes(oldUrl));
  if (unresolved) throw new Error(`Unresolved source reference: ${oldUrl}`);
  if (!existsSync(conversion.webpPath)) throw new Error(`Missing optimized file: ${conversion.newUrl}`);
}

for (const pngPath of pngFiles) unlinkSync(pngPath);
console.log(JSON.stringify({ converted: conversions.size, updated_files: updatedFiles, bytes_before: bytesBefore, bytes_after: bytesAfter }));
