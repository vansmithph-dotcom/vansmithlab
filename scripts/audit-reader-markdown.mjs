import { createHash } from "node:crypto";
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cleanReaderMarkdown } from "../lib/reader-markdown-cleanup.mjs";

const CONTENT_ROOT = path.resolve("content");
const REPORT_PATH = path.resolve("work/reader-markdown-audit.json");
const FIX = process.argv.includes("--fix");
const INTERNAL_RELATED_LINK = /^(\s*- \[[^\]]+\]\()(\/(?:ru|en)\/[^)]+)(\)\s+—\s+)(.+)$/;
const WRONG_TEMPLATE_HEADING = {
  ru: /^(?:#{1,6})\s+(?:Editorial thesis|Reader question|Short answer|Sources|See also)\s*$/,
  en: /^(?:#{1,6})\s+(?:Редакционный тезис|Вопрос читателя|Короткий ответ|Краткий ответ|Источники|По теме)\s*$/,
};
const SERVICE_LINE = /^(?:placement|caption_note|format|asset|caption_required|alt_required|rights(?:_status)?):\s*/i;

async function filesUnder(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(target, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [target] : [];
  }));
  return nested.flat();
}

function localeFor(file) {
  const [locale] = path.relative(CONTENT_ROOT, file).split(path.sep);
  return locale === "ru" || locale === "en" ? locale : undefined;
}

function routeForJson(file, metadata) {
  const parts = path.relative(CONTENT_ROOT, file).split(path.sep);
  const locale = parts.shift();
  const filename = parts.pop();
  const slug = metadata.slug || filename.replace(/\.json$/, "");
  return `/${[locale, ...parts, slug].join("/")}`.replace(/\/$/, "");
}

function repairTruncatedDescriptions(markdown, routeMetadata) {
  let repaired = 0;
  const output = markdown.split("\n").map((line) => {
    const match = INTERNAL_RELATED_LINK.exec(line);
    if (!match) return line;
    const metadata = routeMetadata.get(match[2].replace(/\/$/, ""));
    const summary = metadata?.summary?.trim();
    if (!summary) return line;

    const description = match[4].trim();
    const stem = description.endsWith(".") ? description.slice(0, -1) : description;
    if (
      stem.length < summary.length &&
      summary.startsWith(stem) &&
      /[\p{L}\p{N}]/u.test(summary.charAt(stem.length))
    ) {
      repaired += 1;
      return `${match[1]}${match[2]}${match[3]}${summary}`;
    }
    return line;
  });
  return { markdown: output.join("\n"), repaired };
}

function issuesFor(file, markdown, locale) {
  const issues = [];
  const lines = markdown.split("\n");
  const add = (type, lineIndex, excerpt) => issues.push({
    type,
    file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
    line: lineIndex + 1,
    excerpt: excerpt.slice(0, 240),
  });

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (SERVICE_LINE.test(trimmed)) add("service_line", index, line);
    if (/^#{1,6}\s+#{1,6}\s+/.test(line)) add("duplicate_heading_marker", index, line);
    if (/^#{1,6}\s*$/.test(line)) add("empty_heading", index, line);
    if (/^#{1,6}[^#\s]/.test(line)) add("heading_missing_space", index, line);
    if (locale && WRONG_TEMPLATE_HEADING[locale].test(line)) add("wrong_locale_template_heading", index, line);
    if (/\uFFFD/.test(line) || /Р РµРґР°|Р’РѕРїСЂРѕСЃ|РљРѕСЂРѕС‚РєРёР№|РСЃС‚РѕС‡/.test(line)) {
      add("encoding_artifact", index, line);
    }
    if (/\]\(\s*\)/.test(line)) add("empty_link_target", index, line);
    if (/!\[\s*\]\(/.test(line)) add("empty_image_alt", index, line);
    if (/<\/?(?:w:|o:|v:|mso-)[^>]*>/i.test(line)) add("office_markup", index, line);
    if (/\0/.test(line)) add("null_byte", index, line);
  });

  const fences = lines.filter((line) => /^\s*```/.test(line)).length;
  if (fences % 2 !== 0) add("unbalanced_code_fence", Math.max(0, lines.length - 1), "odd number of fenced-code markers");
  const calloutOpen = lines.filter((line) => /^\s*:::\s*[A-Za-z]/.test(line)).length;
  const calloutClose = lines.filter((line) => /^\s*:::\s*$/.test(line)).length;
  if (calloutOpen !== calloutClose) add("unbalanced_callout", Math.max(0, lines.length - 1), `${calloutOpen} open / ${calloutClose} close`);
  return issues;
}

async function atomicWrite(file, contents) {
  const temporary = `${file}.codex-tmp`;
  await writeFile(temporary, contents, "utf8");
  await rename(temporary, file);
}

const jsonFiles = await filesUnder(CONTENT_ROOT, ".json");
const routeMetadata = new Map();
for (const file of jsonFiles) {
  try {
    const metadata = JSON.parse(await readFile(file, "utf8"));
    routeMetadata.set(routeForJson(file, metadata), metadata);
  } catch {
    // JSON validity belongs to the repository schema audit; Markdown audit remains usable.
  }
}

const markdownFiles = await filesUnder(CONTENT_ROOT, ".md");
const changedFiles = [];
let repairedRelatedDescriptions = 0;
for (const file of markdownFiles) {
  const before = await readFile(file, "utf8");
  const locale = localeFor(file);
  const cleaned = cleanReaderMarkdown(before, locale);
  const repaired = repairTruncatedDescriptions(cleaned, routeMetadata);
  const after = repaired.markdown;
  if (FIX && after !== before) {
    await atomicWrite(file, after);
    const metadataPath = file.replace(/\.md$/, ".json");
    try {
      const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
      metadata.body_hash = createHash("sha256").update(after).digest("hex");
      await atomicWrite(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    changedFiles.push(path.relative(process.cwd(), file).replaceAll("\\", "/"));
    repairedRelatedDescriptions += repaired.repaired;
  }
}

const issues = [];
for (const file of markdownFiles) {
  issues.push(...issuesFor(file, await readFile(file, "utf8"), localeFor(file)));
}
const byType = Object.fromEntries([...new Set(issues.map((issue) => issue.type))].sort().map((type) => [
  type,
  issues.filter((issue) => issue.type === type).length,
]));
const report = {
  scanned: markdownFiles.length,
  locale_counts: {
    ru: markdownFiles.filter((file) => localeFor(file) === "ru").length,
    en: markdownFiles.filter((file) => localeFor(file) === "en").length,
  },
  fix_mode: FIX,
  changed: changedFiles.length,
  repaired_related_descriptions: repairedRelatedDescriptions,
  changed_files: changedFiles,
  issue_count: issues.length,
  issues_by_type: byType,
  issues,
};
await atomicWrite(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, issues: undefined }, null, 2));
if (issues.length) process.exitCode = 1;
