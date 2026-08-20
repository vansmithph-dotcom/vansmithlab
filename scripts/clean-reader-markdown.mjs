import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cleanReaderMarkdown } from "../lib/reader-markdown-cleanup.mjs";

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
  }));
  return nested.flat();
}

const files = await markdownFiles(path.resolve("content"));
let changed = 0;
let removedServiceLines = 0;
let repairedHeadings = 0;

for (const markdownPath of files) {
  const before = await readFile(markdownPath, "utf8");
  const relativeParts = path.relative(path.resolve("content"), markdownPath).split(path.sep);
  const locale = relativeParts[0] === "ru" || relativeParts[0] === "en" ? relativeParts[0] : undefined;
  const cleaned = cleanReaderMarkdown(before, locale);
  if (cleaned === before) continue;

  removedServiceLines += (before.match(/^(?:placement|caption_note|format|asset|caption_required|alt_required|rights(?:_status)?):.*$/gmi) ?? []).length;
  repairedHeadings += (before.match(/^#{1,6}\s+#{1,6}\s+/gm) ?? []).length;
  await writeFile(markdownPath, cleaned, "utf8");

  const metadataPath = markdownPath.replace(/\.md$/, ".json");
  try {
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    metadata.body_hash = createHash("sha256").update(cleaned).digest("hex");
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  changed += 1;
}

console.log(JSON.stringify({ scanned: files.length, changed, repairedHeadings, removedServiceLines }, null, 2));
