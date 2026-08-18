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

function jsonLdNodes(value) {
  if (Array.isArray(value)) return value.flatMap(jsonLdNodes);
  if (!value || typeof value !== "object") return [];
  const graph = Array.isArray(value["@graph"]) ? value["@graph"].flatMap(jsonLdNodes) : [];
  return [value, ...graph];
}

function isPublicationRoute(route) {
  return /^\/(?:ru|en)\/(?:articles|analysis|timeline|collections|encyclopedia)\/[^/]+\/$/.test(route)
    || /^\/(?:ru|en)\/glossary\/[^/]+\/[^/]+\/$/.test(route);
}

const htmlFiles = walk(outDir).filter((file) => extname(file) === ".html");
const pageFiles = htmlFiles.filter((file) => {
  const rel = relative(outDir, file).split(sep).join("/");
  return !rel.includes("__empty") && !rel.startsWith("_not-found/") && rel !== "404.html" && rel !== "404/index.html";
});
const failures = [];
// Key titles by locale prefix so cross-locale identical org names don't trigger false positives.
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
    if (/[А-Яа-яЁё][A-Za-z]|[A-Za-z][А-Яа-яЁё]/u.test(title)) failures.push(`${route}: glued mixed-script title "${title}"`);
    if (/[\u{1F1E6}-\u{1F1FF}]{2}/u.test(title)) failures.push(`${route}: flag emoji is not allowed in a document title`);
    // Key by locale prefix so "teamLab" in /en/ and /ru/ don't collide.
    const localePrefix = route.match(/^\/(ru|en)\//)?.[1] ?? "";
    const titleKey = `${localePrefix}::${title}`;
    const routes = titles.get(titleKey) ?? [];
    routes.push(route);
    titles.set(titleKey, routes);
  }

  const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1]
    ?? html.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["'][^>]*>/i)?.[1];
  if (!canonical) failures.push(`${route}: missing canonical URL`);
  else {
    const canonicalUrl = new URL(canonical, siteOrigin);
    if (canonicalUrl.origin !== siteOrigin) failures.push(`${route}: canonical points outside the canonical domain`);
    if (!localHtmlTarget(canonicalUrl.pathname)) failures.push(`${route}: canonical target does not exist (${canonicalUrl.pathname})`);
  }

  const jsonLd = [];
  for (const match of html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      jsonLd.push(...jsonLdNodes(JSON.parse(match[1])));
    } catch (error) {
      failures.push(`${route}: invalid JSON-LD (${error.message})`);
    }
  }
  if (route === "/") {
    const website = jsonLd.find((node) => node["@type"] === "WebSite");
    const organization = jsonLd.find((node) => node["@type"] === "Organization");
    if (!website || website.name !== "VANSMITHLAB" || website.url !== `${siteOrigin}/`) failures.push("/: missing canonical VANSMITHLAB WebSite entity");
    if (!organization || organization.name !== "VANSMITHLAB") failures.push("/: missing VANSMITHLAB Organization entity");
  }
  if (isPublicationRoute(route)) {
    const article = jsonLd.find((node) => node["@type"] === "Article");
    const breadcrumb = jsonLd.find((node) => node["@type"] === "BreadcrumbList");
    if (!article?.headline || !article?.description || !article?.mainEntityOfPage) failures.push(`${route}: incomplete Article structured data`);
    if (!Array.isArray(breadcrumb?.itemListElement) || breadcrumb.itemListElement.length < 2) failures.push(`${route}: incomplete BreadcrumbList structured data`);
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
