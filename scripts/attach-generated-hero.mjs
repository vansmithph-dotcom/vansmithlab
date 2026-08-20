import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const queuePath = path.join(root, 'work/missing-hero-generation-queue.json');
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const sequence = Number(process.argv[2] ?? 1);
const source = process.argv[3] ?? 'C:/Users/VAN/.codex/generated_images/01a01df0-2ccb-7c90-b3b8-9903e6350a93/exec-abc4cab5-2d41-40fd-be30-e47406d9be85.png';
const item = queue.pairs.find((entry) => entry.sequence === sequence);
if (!item) throw new Error(`queue item ${sequence} missing`);
const targetRel = `public${item.target}`.replaceAll('/', path.sep).replace(/\.webp$/, '.png');
const target = path.join(root, targetRel);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
const contentHash = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
const createdAt = new Date().toISOString();
const assetId = `hero_${item.section}_${item.slug}`;
const localized = {};
for (const locale of ['ru', 'en']) {
  const files = [];
  const walk = (dir) => { for (const name of fs.readdirSync(dir)) { const full = path.join(dir, name); if (fs.statSync(full).isDirectory()) walk(full); else if (name === `${item.slug}.json`) files.push(full); } };
  walk(path.join(root, 'content', locale));
  if (files.length !== 1) throw new Error(`${locale}: expected one JSON for ${item.slug}, got ${files.length}`);
  const data = JSON.parse(fs.readFileSync(files[0], 'utf8'));
  const isEnglish = locale === 'en';
  const title = item.titles[locale];
  const summary = data.summary;
  const alt = isEnglish
    ? `${title} — a unique editorial AI illustration visualizing the article's subject.`
    : `${title} — уникальная редакционная AI-иллюстрация, визуализирующая тему материала.`;
  const caption = isEnglish
    ? `Original VANSMITHLAB editorial AI illustration for “${title}”. ${summary}`
    : `Оригинальная редакционная AI-иллюстрация VANSMITHLAB для материала «${title}». ${summary}`;
  data.hero_image = {
    src: item.target.replace(/\.webp$/, '.png'),
    alt,
    caption,
    credit: 'VANSMITHLAB · original AI illustration, 2026',
    origin: 'ai_illustration',
    rights_status: 'ai_generated',
    licence_or_permission: isEnglish
      ? 'Original VANSMITHLAB AI illustration; owned editorial asset.'
      : 'Оригинальная AI-иллюстрация VANSMITHLAB; редакционный актив в собственности проекта.',
    source_url: '',
    asset_id: assetId,
    content_hash: contentHash,
    storage_key: item.target.replace(/\.webp$/, '.png'),
    created_at: createdAt,
    locale,
    disclosure: isEnglish
      ? 'AI-generated editorial illustration; not documentary evidence.'
      : 'Редакционная иллюстрация сгенерирована ИИ и не является документальным свидетельством.'
  };
  fs.writeFileSync(files[0], `${JSON.stringify(data, null, 2)}\n`);
  localized[locale] = { alt, caption };
}
item.status = 'generated';
item.generated_at = createdAt;
item.target = item.target.replace(/\.webp$/, '.png');
item.media = {
  ...item.media,
  asset_id: assetId,
  origin: 'ai_illustration',
  rights_status: 'ai_generated',
  rights_state: 'original_owned',
  content_hash: contentHash,
  storage_key: item.target,
  created_at: createdAt,
  localized,
  disclosure: 'AI-generated editorial illustration; not documentary evidence.'
};
fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
console.log(`attached ${item.slug}`);
