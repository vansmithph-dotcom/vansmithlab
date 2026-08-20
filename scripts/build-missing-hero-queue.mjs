import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const audit = JSON.parse(fs.readFileSync(path.join(root, 'work/content-completeness-audit.json'), 'utf8'));
const missing = audit.issues.filter((item) => item.hero_missing);
const bySlug = new Map();
for (const item of missing) {
  const key = `${item.section}/${item.slug}`;
  const pair = bySlug.get(key) ?? { section: item.section, slug: item.slug, locales: {}, disciplines: item.disciplines, titles: {} };
  pair.locales[item.locale] = item.content_id;
  pair.titles[item.locale] = item.title;
  bySlug.set(key, pair);
}
const pairs = [...bySlug.values()].filter((pair) => pair.locales.ru && pair.locales.en);
const queue = pairs.map((pair, index) => ({
  sequence: index + 1,
  status: 'queued',
  ...pair,
  target: `/images/generated-heroes/${pair.section}--${pair.slug}.webp`,
  media: { type: 'editorial_illustration', ratio: '3:2', rights_status: 'ai_generated', credit: 'VANSMITHLAB' },
}));
fs.writeFileSync(path.join(root, 'work/missing-hero-generation-queue.json'), JSON.stringify({ generated_at: new Date().toISOString(), total: queue.length, pairs: queue }, null, 2));
console.log(`queued ${queue.length} bilingual pairs from ${missing.length} missing localized records`);
