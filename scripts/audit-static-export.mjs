import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "out");
const siteOrigin = "https://vansmithlab.com";

if (!existsSync(outDir)) {
  console.error("Static export is missing. Run `npm run build` before `npm run audit:site`.");
  process.exit(1);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function pageUrlFor(file) {
  const rel = relative(outDir, file).split(sep).join("/");
  if (rel === "index.html") return `${siteOrigin}/`;
  if (rel.endsWith("/index.html")) return `${siteOrigin}/${rel.slice(0, -10)}`;
  return `${siteOrigin}/${rel.replace(/\.html$/, "")}`;
}

function localHtmlTarget(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidates = pathname.endsWith("/")
    ? [join(outDir, decoded, "index.html")]
    : [join(outDir, decoded, "index.html"), join(outDir, `${decoded}.html`), join(outDir, decoded)];
  return candidates.find((candidate) => existsSync(candidate));
}

function localAssetTarget(pathname) {
  return join(outDir, decodeURIComponent(pathname).replace(/^\/+/, ""));
}

const htmlFiles = walk(outDir).filter((file) => extname(file) === ".html");
const pageFiles = htmlFiles.filter((file) => {
  const rel = relative(outDir, file).split(sep).join("/");
  return !rel.includes("__empty") && !rel.startsWith("_not-found/") && rel !== "404.html" && rel !== "404/index.html";
});
const failures = [];
const titles = new Map();
let internalLinkCount = 0;
let imageCount = 0;

for (const file of pageFiles) {
  const html = readFileSync(file, "utf8");
  const pageUrl = pageUrlFor(file);
  const route = new URL(pageUrl).pathname;
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) failures.push(`${route}: expected exactly one h1, found ${h1Count}`);

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) failures.push(`${route}: missing document title`);
  else {
    const routes = titles.get(title) ?? [];
    routes.push(route);
    titles.set(title, routes);
  }

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, pageUrl);
    } catch {
      failures.push(`${route}: invalid href ${href}`);
      continue;
    }
    if (url.origin !== siteOrigin) continue;
    internalLinkCount += 1;
    if (!localHtmlTarget(url.pathname)) failures.push(`${route}: broken internal link ${url.pathname}`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    imageCount += 1;
    const attrs = match[1];
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const alt = attrs.match(/\balt=["']([^"']*)["']/i);
    if (!alt) failures.push(`${route}: image is missing alt attribute`);
    if (!src || src.startsWith("data:")) continue;
    const url = new URL(src, pageUrl);
    if (url.origin === siteOrigin && !existsSync(localAssetTarget(url.pathname))) {
      failures.push(`${route}: missing rendered image ${url.pathname}`);
    }
  }
}

for (const [title, routes] of titles) {
  if (routes.length > 1) failures.push(`duplicate title "${title}" on ${routes.join(", ")}`);
}

const imageDir = join(outDir, "images");
const webpFiles = existsSync(imageDir)
  ? walk(imageDir).filter((file) => extname(file).toLowerCase() === ".webp")
  : [];
for (const file of webpFiles) {
  const header = readFileSync(file).subarray(0, 12);
  const isWebp = header.subarray(0, 4).toString("ascii") === "RIFF" && header.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isWebp) failures.push(`${relative(outDir, file)}: .webp extension does not contain WebP data`);
}

if (failures.length > 0) {
  console.error(`Static export audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const bytes = walk(outDir).reduce((total, file) => total + statSync(file).size, 0);
console.log(`Static export audit passed: ${pageFiles.length} public pages, ${internalLinkCount} internal links, ${imageCount} images, ${(bytes / 1024 / 1024).toFixed(2)} MB.`);
