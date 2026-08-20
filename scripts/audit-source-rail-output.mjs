import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { uniqueSourcesByUrl } from "../lib/source-display.mjs";

const OUT_ROOT = path.resolve("out");

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(target);
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  }));
  return nested.flat();
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
}

const files = await htmlFiles(OUT_ROOT);
const duplicates = [];
let rails = 0;
let sourceLinks = 0;

for (const file of files) {
  const html = await readFile(file, "utf8");
  const rail = /id="evidence-sources"[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/.exec(html);
  if (!rail) continue;
  rails += 1;
  const urls = [...rail[1].matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => decodeHtml(match[1]));
  sourceLinks += urls.length;
  const sources = urls.map((url, index) => ({ id: String(index), url }));
  const unique = uniqueSourcesByUrl(sources);
  if (unique.length !== sources.length) {
    const retained = new Set(unique.map((source) => source.id));
    duplicates.push({
      file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
      urls: sources.filter((source) => !retained.has(source.id)).map((source) => source.url),
    });
  }
}

const report = {
  html_files: files.length,
  source_rails: rails,
  source_links: sourceLinks,
  pages_with_duplicate_exact_urls: duplicates.length,
  duplicates,
};
console.log(JSON.stringify(report, null, 2));
if (duplicates.length) process.exitCode = 1;
