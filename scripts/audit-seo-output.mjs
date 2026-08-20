#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const SITE = "https://vansmithlab.com";
const PINTEREST = "https://www.pinterest.com/van_smith_ai/";
const TOKEN = "56e70c875a4d49ccb4d7a3e71ab48ab9";
const LUCINDA = "lucinda-chambers-fashion-editing-collaboration-curation";
const HERO = "/images/glossary/fashion-editors/lucinda-chambers-editing-collaboration-taste-hero-v3.webp";
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (...parts) => fs.readFileSync(path.join(OUT, ...parts), "utf8");

const feed = read("feed.xml");
assert(/<rss\s[^>]*version="2\.0"/.test(feed), "feed.xml is not RSS 2.0");
assert(!/<feed\s+xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/.test(feed), "feed.xml still contains an Atom root");
const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
assert(items.length > 0 && items.length <= 200, `RSS item count is outside Pinterest range: ${items.length}`);
const feedLinks = new Set();
for (const item of items) {
  const link = /<link>([^<]+)<\/link>/.exec(item)?.[1] ?? "";
  const image = /<media:content\s+url="([^"]+)"/.exec(item)?.[1] ?? "";
  const date = /<pubDate>([^<]+)<\/pubDate>/.exec(item)?.[1] ?? "";
  assert(link.startsWith(`${SITE}/`), `RSS item link is outside the claimed domain: ${link}`);
  assert(!feedLinks.has(link), `Duplicate RSS canonical link: ${link}`);
  feedLinks.add(link);
  assert(image.startsWith(`${SITE}/images/`), `RSS item lacks a direct hero image: ${link}`);
  if (image.startsWith(SITE)) assert(fs.existsSync(path.join(OUT, new URL(image).pathname.replace(/^\/+/, ""))), `RSS image is missing from export: ${image}`);
  assert(date && new Date(date) <= new Date(), `RSS publication date is absent or in the future: ${link}`);
  assert(/<title>[^<]+<\/title>/.test(item) && /<description>[^<]+<\/description>/.test(item), `RSS item lacks title or description: ${link}`);
}

for (const locale of ["ru", "en"]) {
  const html = read(locale, "glossary", "fashion-editors", LUCINDA, "index.html");
  const canonical = `${SITE}/${locale}/glossary/fashion-editors/${LUCINDA}/`;
  assert(html.includes(`name="p:domain_verify" content="${TOKEN}"`), `${locale} page lacks Pinterest domain verification`);
  assert(html.includes(`rel="canonical" href="${canonical}"`), `${locale} Lucinda canonical is wrong`);
  assert(html.includes('hrefLang="ru"') || html.includes('hreflang="ru"'), `${locale} Lucinda page lacks RU hreflang`);
  assert(html.includes('hrefLang="en"') || html.includes('hreflang="en"'), `${locale} Lucinda page lacks EN hreflang`);
  assert(html.includes('property="og:type" content="article"'), `${locale} Lucinda page lacks Article Open Graph type`);
  assert(html.includes(`property="og:image" content="${SITE}${HERO}"`), `${locale} Lucinda Open Graph image is wrong`);
  assert(html.includes(`${PINTEREST}`), `${locale} page lacks visible/structured Pinterest profile URL`);
  assert(html.includes(HERO), `${locale} Lucinda page does not render the replacement hero`);
  assert(html.includes('"@type":"ImageObject"'), `${locale} Lucinda JSON-LD lacks ImageObject`);
  assert(html.includes('"representativeOfPage":true'), `${locale} Lucinda ImageObject lacks representativeOfPage`);
  assert(html.includes('"acquireLicensePage"'), `${locale} Lucinda ImageObject lacks acquireLicensePage`);
}

const sitemap = read("sitemap.xml");
assert(sitemap.includes(`${SITE}${HERO}`), "Sitemap does not expose the Lucinda hero image");
assert(sitemap.includes('hreflang="ru"') && sitemap.includes('hreflang="en"') && sitemap.includes('hreflang="x-default"'), "Sitemap lacks language alternates");
const robots = read("robots.txt");
assert(/Allow:\s*\//.test(robots) && robots.includes(`${SITE}/sitemap.xml`), "robots.txt does not allow crawling or expose the sitemap");

if (errors.length) {
  console.error(`SEO/Pinterest export audit failed (${errors.length})\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`SEO/Pinterest export audit passed: ${items.length} RSS items; Lucinda RU/EN metadata, ImageObject, sitemap, robots and Pinterest verification validated.`);
