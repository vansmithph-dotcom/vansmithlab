#!/usr/bin/env node
/**
 * Build knowledge/relations.json — the editorial discovery graph.
 *
 * Reads the article corpus (.docx masters) and the knowledge objects, detects
 * where one article's subject is named in another article's body, and writes a
 * directed, weighted graph.
 *
 * These are `mentions` edges: editorial discovery labels, NOT factual
 * assertions. Per VANSMITHLAB_OS/03_KNOWLEDGE_MODEL.md a factual relation
 * requires a supporting claim, so evidenced relations stay inside the object
 * records and are never written by this script.
 *
 * Usage: node scripts/build-relations.mjs <corpus-dir> [--min 2]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIN = Number(process.argv[process.argv.indexOf("--min") + 1]) || 2;
const CORPUS = process.argv[2];

if (!CORPUS) {
  console.error("usage: node scripts/build-relations.mjs <corpus-dir> [--min N]");
  process.exit(1);
}

/** Object slugs that differ from the article slug for the same subject. */
const ALIAS = {
  "istoriya-modnogo-doma-armani": "istoriya-modnogo-doma-giorgio-armani",
  "istoriya-modnogo-doma-christian-dior": "christian-dior-istoriya-modnogo-doma",
  "istoriya-modnogo-doma-louis-vuitton": "louis-vuitton-istoriya-modnogo-doma",
  "kak-religiya-povliyala-na-modu": "kak-religiya-povliyala-na-mir-mody",
};

const STOP = new Set(["История", "модного", "дома", "SANAA"]);
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}️]/gu;

/** Only a person may be referred to by surname alone. Taxonomy v2 states this
 * directly with `kind`, so no list of categories has to be kept in step. */
const isPerson = (node) => node.kind === "person";

/** Minimum mentions before an edge is recorded. */
const MIN_PERSON = MIN;
const MIN_TOPIC = MIN + 2;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function surfaceForm(title) {
  return title
    .replace(EMOJI, "")
    .replace(/\s*\/\s*/g, "")
    .replace(/^История модного дома\s*/, "")
    .replace(/^SANAA:\s*/, "")
    .trim();
}

/**
 * Build the name matcher for one node.
 *
 * People may be referred to by surname alone, so a surname of >=5 characters is
 * accepted as an alternative. Materials, houses and themes must match their full
 * title: an earlier version allowed the last word, which made "Корсетная
 * конструкция" match the ordinary noun "конструкция" in 27 unrelated articles.
 *
 * A two-letter Cyrillic tail is permitted so Russian case endings still match
 * ("Мрамор" -> "мрамора"). The tail is deliberately short: three letters let
 * "Буржуа" match "буржуазная" and "Росси" match "российский".
 *
 * Surnames shorter than six characters are not used on their own for the same
 * reason — the full name still matches.
 */
function matcher(title, node) {
  const name = surfaceForm(title);
  const parts = name.split(/\s+/).filter((p) => !STOP.has(p));
  const person = isPerson(node);
  const alts = [esc(name)];
  if (person && parts.length >= 2 && parts.at(-1).length >= 6) {
    alts.push(esc(parts.at(-1)));
  }
  return new RegExp(
    `(?<![А-Яа-яA-Za-z])(?:${alts.join("|")})[а-яё]{0,2}(?![А-Яа-яa-z])`,
    "giu"
  );
}

/** The corpus dump produced by scripts/dump-corpus.py — slug, title, taxonomy axes, body. */
const corpus = JSON.parse(fs.readFileSync(path.join(CORPUS, "corpus.json"), "utf8"));

const objects = new Map();
const objDir = path.join(ROOT, "knowledge", "objects");
for (const f of fs.readdirSync(objDir).filter((f) => f.endsWith(".json"))) {
  const o = JSON.parse(fs.readFileSync(path.join(objDir, f), "utf8"));
  objects.set(ALIAS[o.slug_ru] ?? o.slug_ru, { id: o.id, type: o.type });
}

const nodes = Object.entries(corpus).map(([slug, v]) => ({
  slug,
  title_ru: v.title,
  discipline: v.discipline,
  kind: v.kind,
  role: v.role,
  object_id: objects.get(slug)?.id ?? null,
  object_type: objects.get(slug)?.type ?? null,
}));

const patterns = new Map(
  Object.entries(corpus).map(([slug, v]) => [slug, matcher(v.title, v)])
);

const edges = [];
for (const [from, v] of Object.entries(corpus)) {
  for (const [to, w] of Object.entries(corpus)) {
    if (to === from) continue;
    const threshold = isPerson(w) ? MIN_PERSON : MIN_TOPIC;
    const re = patterns.get(to);
    re.lastIndex = 0;
    const hits = v.body.match(re);
    const weight = hits ? hits.length : 0;
    if (weight >= threshold) {
      edges.push({
        from,
        to,
        type: "mentions",
        kind: "editorial_discovery",
        weight,
        rationale_ru: `Материал «${v.title}» называет предмет связанного материала ${weight} раз.`,
      });
    }
  }
}

const pairKey = (a, b) => [a, b].sort().join("::");
const seen = new Set(edges.map((e) => `${e.from}::${e.to}`));
for (const e of edges) e.reciprocal = seen.has(`${e.to}::${e.from}`);

const out = {
  generated_by: "scripts/build-relations.mjs",
  generated_at: new Date().toISOString().slice(0, 10),
  min_weight: MIN,
  note:
    "Edges of type `mentions` are editorial discovery labels, not factual claims. " +
    "A relation that asserts a fact must live in the object record with a supporting claim.",
  stats: {
    nodes: nodes.length,
    nodes_with_object: nodes.filter((n) => n.object_id).length,
    edges: edges.length,
    reciprocal_pairs: new Set(edges.filter((e) => e.reciprocal).map((e) => pairKey(e.from, e.to))).size,
  },
  nodes,
  edges: edges.sort((a, b) => b.weight - a.weight),
};

fs.writeFileSync(
  path.join(ROOT, "knowledge", "relations.json"),
  JSON.stringify(out, null, 2) + "\n",
  "utf8"
);
console.log(
  `nodes ${out.stats.nodes} (with object ${out.stats.nodes_with_object}) | ` +
    `edges ${out.stats.edges} | reciprocal pairs ${out.stats.reciprocal_pairs}`
);
