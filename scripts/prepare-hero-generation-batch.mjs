import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const queuePath = path.join(root, 'work', 'missing-hero-generation-queue.json');
const limit = Math.max(1, Number(process.argv[2] ?? 10));
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

const findContent = (locale, section, slug) => {
  const direct = path.join(root, 'content', locale, section, `${slug}.json`);
  if (fs.existsSync(direct)) return direct;
  const matches = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name === `${slug}.json`) matches.push(full);
    }
  };
  walk(path.join(root, 'content', locale));
  if (matches.length !== 1) throw new Error(`${locale}: expected one JSON for ${slug}, got ${matches.length}`);
  return matches[0];
};

const selected = queue.pairs.filter((item) => item.status === 'queued').slice(0, limit);
const output = selected.map((item) => {
  const ru = JSON.parse(fs.readFileSync(findContent('ru', item.section, item.slug), 'utf8'));
  const en = JSON.parse(fs.readFileSync(findContent('en', item.section, item.slug), 'utf8'));
  const disciplines = [...new Set([...(item.disciplines ?? []), ...(en.discipline ?? [])])];
  const prompt = `Use case: stylized-concept
Asset type: unique VANSMITHLAB editorial card hero, landscape 3:2
Knowledge object: “${en.title}”
Editorial summary: ${en.summary}
Disciplines: ${disciplines.join(', ') || 'design and visual culture'}
Primary request: Create one original, visually concrete editorial illustration that directly explains this exact title and summary. Invent a coherent subject-specific scene using recognizable objects, materials, spaces, gestures or processes from the topic. The illustration must be unmistakably different from generic editorial filler and from other articles. If the subject is a real person, make their practice, signature objects and working context the main narrative; a human likeness may be only one element and must not be presented as documentary evidence.
Style/medium: refined tactile mixed-media editorial illustration combining painted surfaces, paper or material texture, subtle photographic grain and precise contemporary art direction; calm design-encyclopedia character
Composition/framing: one seamless wide scene with a clear focal subject and depth; landscape 3:2; card-safe central crop; no multi-panel layout
Lighting/mood: purposeful editorial lighting that supports the subject, restrained and intelligent
Color palette: warm paper and near-black with a subject-specific restrained accent palette
Constraints: illustration only; unique to this article; no standalone portrait; no copied living-artist style; no documentary claim; no text, letters, numbers, logos, brands, captions, diagrams, charts, flowcharts, matrices, grids, UI, pictograms, borders, grey placeholders or watermarks; no stretched anatomy; no generic stock-photo look.`;
  const inputHash = crypto.createHash('sha256').update(JSON.stringify({ title: en.title, summary: en.summary, disciplines, prompt })).digest('hex');
  item.media_brief = {
    template_version: 'vsl-card-hero-3x2-v1',
    workflow_run_id: `hero-batch-${new Date().toISOString().slice(0, 10)}`,
    knowledge_object: item.locales.ru,
    educational_purpose: `Visualize the specific subject and reader promise of “${en.title}”.`,
    depiction_type: 'ai_illustration',
    verified_visual_facts: [ru.title, ru.summary, en.title, en.summary],
    must_not_imply: ['documentary evidence', 'licensed third-party photograph', 'endorsement by a depicted person or brand'],
    aspect_ratio: '3:2',
    placement: 'listing card and article hero',
    disclosure: 'AI-generated editorial illustration; not documentary evidence.',
    acceptance_check: ['unique raster image', 'subject-specific scene', 'no text or diagram', 'no standalone portrait', 'safe 3:2 card crop'],
    provider: 'OpenAI built-in image generation',
    prompt,
    input_hash: inputHash,
    prepared_at: new Date().toISOString()
  };
  return { sequence: item.sequence, slug: item.slug, title: en.title, prompt };
});

fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
process.stdout.write(JSON.stringify(output));
