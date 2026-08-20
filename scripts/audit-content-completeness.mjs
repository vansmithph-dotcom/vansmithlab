import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const publicRoot = path.join(root, "public");
const publicSections = new Set(["analysis", "articles", "encyclopedia", "timeline", "collections"]);
const raster = /\.(?:avif|jpe?g|png|webp)$/i;
const records = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const rasterAssets = walk(path.join(publicRoot, "images")).filter((file) => raster.test(file));
function candidateAssets(slug) {
  return rasterAssets
    .filter((file) => path.basename(file).toLocaleLowerCase().startsWith(slug.toLocaleLowerCase()))
    .map((file) => `/${path.relative(publicRoot, file).replaceAll("\\", "/")}`);
}

for (const locale of ["ru", "en"]) {
  for (const file of walk(path.join(contentRoot, locale)).filter((item) => item.endsWith(".json"))) {
    const rel = path.relative(path.join(contentRoot, locale), file).replaceAll("\\", "/");
    const [section] = rel.split("/");
    if (!publicSections.has(section) && section !== "glossary") continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!['published', 'drafted'].includes(data.state)) continue;
    const src = data.hero_image?.src ?? "";
    const heroPath = src.startsWith("/") ? path.join(publicRoot, src.slice(1)) : "";
    records.push({
      locale,
      section: data.content_type?.endsWith("_profile") ? "glossary" : section,
      slug: data.slug,
      title: data.title,
      state: data.state,
      content_id: data.content_id,
      primary_object_id: data.primary_object_id,
      disciplines: data.discipline ?? [],
      hero: src,
      hero_missing: !src,
      hero_broken: Boolean(src) && (!heroPath || !fs.existsSync(heroPath)),
      hero_non_raster: Boolean(src) && !raster.test(src),
      hero_bytes: heroPath && fs.existsSync(heroPath) ? fs.statSync(heroPath).size : 0,
      candidate_assets: !src ? candidateAssets(data.slug) : [],
      inline_media: data.inline_media?.length ?? 0,
      related_declared: data.related_content_ids?.length ?? 0,
      last_reviewed: data.last_reviewed ?? null,
    });
  }
}

const heroUse = new Map();
for (const item of records) if (item.hero) heroUse.set(item.hero, [...(heroUse.get(item.hero) ?? []), item]);
const duplicates = [...heroUse.entries()].filter(([, items]) => items.length > 2).map(([hero, items]) => ({hero, uses: items.length, pages: items.map((x) => `${x.locale}/${x.section}/${x.slug}`)}));
const summary = {
  generated_at: new Date().toISOString(),
  total: records.length,
  by_locale: Object.fromEntries(["ru", "en"].map((locale) => [locale, records.filter((x) => x.locale === locale).length])),
  by_section: Object.fromEntries([...new Set(records.map((x) => x.section))].sort().map((section) => [section, records.filter((x) => x.section === section).length])),
  missing_hero: records.filter((x) => x.hero_missing).length,
  broken_hero: records.filter((x) => x.hero_broken).length,
  non_raster_hero: records.filter((x) => x.hero_non_raster).length,
  no_inline_media: records.filter((x) => x.inline_media === 0).length,
  no_declared_related: records.filter((x) => x.related_declared === 0).length,
  duplicate_hero_groups: duplicates.length,
  missing_with_candidate_asset: records.filter((x) => x.hero_missing && x.candidate_assets.length > 0).length,
};
const report = {summary, duplicates, issues: records.filter((x) => x.hero_missing || x.hero_broken || x.hero_non_raster)};
const output = path.join(root, "work", "content-completeness-audit.json");
fs.writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
console.log(`report: ${output}`);
if (summary.broken_hero > 0) process.exitCode = 1;
