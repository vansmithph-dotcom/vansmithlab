import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const QUEUE = join(ROOT, "work", "profile-portrait-queue.json");
const rejectedWikidataIds = new Set(["Q299360", "Q125028729"]);

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(path));
    else if (entry.name.endsWith(".json")) files.push(path);
  }
  return files;
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const normalize = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/gi, " ")
  .trim()
  .toLowerCase();

async function getJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "VANSMITHLAB-media-research/1.0 (https://vansmithlab.com)" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function wikidataPortrait(name) {
  const searchUrl = new URL("https://www.wikidata.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "wbsearchentities",
    search: name,
    language: "en",
    uselang: "en",
    type: "item",
    limit: "8",
    format: "json",
    origin: "*",
  });
  const search = await getJson(searchUrl);
  const wanted = normalize(name);
  const ranked = (search.search || []).map((item) => {
    const label = normalize(item.label);
    let score = label === wanted ? 100 : 0;
    if (wanted.includes(label) || label.includes(wanted)) score += 30;
    if (/designer|critic|curator|editor|illustrator|stylist|architect|writer|theorist|professor|artist|photographer/i.test(item.description || "")) score += 15;
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);
  for (const item of ranked.slice(0, 4)) {
    if (rejectedWikidataIds.has(item.id)) continue;
    const entityUrl = new URL("https://www.wikidata.org/w/api.php");
    entityUrl.search = new URLSearchParams({ action: "wbgetentities", ids: item.id, props: "claims", format: "json", origin: "*" });
    const entity = (await getJson(entityUrl)).entities?.[item.id];
    const filename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (!filename) continue;
    const commonsUrl = new URL("https://commons.wikimedia.org/w/api.php");
    commonsUrl.search = new URLSearchParams({
      action: "query",
      titles: `File:${filename}`,
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "1200",
      format: "json",
      origin: "*",
    });
    const page = Object.values((await getJson(commonsUrl)).query?.pages || {})[0];
    const info = page?.imageinfo?.[0];
    if (!info?.thumburl || !info?.width || !info?.height) continue;
    const meta = info.extmetadata || {};
    return {
      wikidata_id: item.id,
      wikidata_label: item.label,
      wikidata_description: item.description || "",
      filename,
      source_page: info.descriptionurl,
      download_url: info.thumburl,
      original_url: info.url,
      width: info.width,
      height: info.height,
      mime: info.mime,
      artist: meta.Artist?.value || "Wikimedia Commons contributor",
      credit: meta.Credit?.value || "",
      licence: meta.LicenseShortName?.value || meta.UsageTerms?.value || "Wikimedia Commons licence",
      licence_url: meta.LicenseUrl?.value || "",
      attribution_required: meta.AttributionRequired?.value || "",
      usage_terms: meta.UsageTerms?.value || "",
      retrieved_at: new Date().toISOString(),
    };
  }
  return null;
}

const searchHints = {
  "antonio-lopez-fashion-illustration-live-bodies": "Antonio Lopez fashion illustrator",
  "charles-ray-eames-design-process-media": "Charles Ray Eames designers",
  "melanie-ward-modern-stylist-authenticity-construction": "Melanie Ward fashion stylist",
  "joe-mckenna-styling-editing-fashion-image": "Joe McKenna fashion stylist",
};

// Retained as a manual research fallback; automatic matching is intentionally disabled.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function commonsSearchPortrait(name, slug) {
  const searchUrl = new URL("https://commons.wikimedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: searchHints[slug] || name,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1200",
    format: "json",
    origin: "*",
  });
  const pages = Object.values((await getJson(searchUrl)).query?.pages || {});
  const tokens = normalize(name).split(" ").filter((token) => token.length > 2);
  const ranked = pages.map((page) => {
    const info = page.imageinfo?.[0];
    const title = normalize(page.title);
    let score = tokens.reduce((sum, token) => sum + (title.includes(token) ? 15 : 0), 0);
    if (/portrait|headshot|cropped|profile/.test(title)) score += 12;
    if (/logo|signature|autograph|poster|book cover|building|installation|artwork/.test(title)) score -= 30;
    if (info?.height >= info?.width) score += 8;
    if ((info?.width || 0) >= 600 && (info?.height || 0) >= 600) score += 5;
    return { page, info, score };
  }).filter(({ info }) => info?.thumburl && /^image\/(jpeg|png|webp)$/i.test(info.mime || ""))
    .sort((a, b) => b.score - a.score);
  const picked = ranked[0];
  if (!picked || picked.score < 20) return null;
  const { page, info } = picked;
  const meta = info.extmetadata || {};
  return {
    source_kind: "commons_search",
    filename: page.title.replace(/^File:/, ""),
    source_page: info.descriptionurl,
    download_url: info.thumburl,
    original_url: info.url,
    width: info.width,
    height: info.height,
    mime: info.mime,
    artist: meta.Artist?.value || "Wikimedia Commons contributor",
    credit: meta.Credit?.value || "",
    licence: meta.LicenseShortName?.value || meta.UsageTerms?.value || "Wikimedia Commons licence",
    licence_url: meta.LicenseUrl?.value || "",
    attribution_required: meta.AttributionRequired?.value || "",
    usage_terms: meta.UsageTerms?.value || "",
    retrieved_at: new Date().toISOString(),
    search_score: picked.score,
  };
}

const prior = existsSync(QUEUE) ? readJson(QUEUE) : { pairs: [] };
const priorBySlug = new Map((prior.pairs || []).map((item) => [item.slug, item]));
const enFiles = walk(join(CONTENT, "en"));
const pairs = [];
for (const file of enFiles) {
  const record = readJson(file);
  if (!String(record.content_type || "").endsWith("_profile")) continue;
  const old = priorBySlug.get(record.slug);
  if (record.portrait_image && !old) continue;
  const ruPath = file.replace(`${join(CONTENT, "en")}\\`, `${join(CONTENT, "ru")}\\`);
  const rejectOldSource = rejectedWikidataIds.has(old?.source?.wikidata_id) || old?.source?.source_kind === "commons_search";
  pairs.push({
    slug: record.slug,
    name: record.title,
    content_type: record.content_type,
    files: { en: relative(ROOT, file), ru: relative(ROOT, ruPath) },
    status: rejectOldSource ? "researching" : (old?.status || "researching"),
    source: rejectOldSource ? null : (old?.source || null),
    portrait: old?.portrait || null,
    error: old?.error || null,
  });
}

for (const [index, item] of pairs.entries()) {
  if (item.source || item.status === "attached") continue;
  try {
    item.source = await wikidataPortrait(item.name);
    item.status = item.source ? "source_found" : "needs_reference";
    item.error = null;
  } catch (error) {
    item.status = "research_error";
    item.error = String(error);
  }
  const body = { generated_at: new Date().toISOString(), total: pairs.length, input_hash: createHash("sha256").update(pairs.map((x) => x.slug).join("\n")).digest("hex"), pairs };
  writeFileSync(QUEUE, `${JSON.stringify(body, null, 2)}\n`);
  console.log(`${index + 1}/${pairs.length} ${item.status} ${item.name}`);
}

const body = { generated_at: new Date().toISOString(), total: pairs.length, input_hash: createHash("sha256").update(pairs.map((x) => x.slug).join("\n")).digest("hex"), pairs };
writeFileSync(QUEUE, `${JSON.stringify(body, null, 2)}\n`);
console.log(`queue: ${QUEUE}`);
