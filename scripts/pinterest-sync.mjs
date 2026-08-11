#!/usr/bin/env node
/**
 * Publish Pinterest pins from the distribution pack (work/pinterest-pack).
 *
 * Per VANSMITHLAB_OS/13_PUBLICATION_AND_DISTRIBUTION.md, a social post is a
 * derivative of a source release. Every pin is created from a record that
 * already carries the canonical link, media, credit and verification state;
 * the publisher records the external pin ID so a source change can update or
 * withdraw the pin consistently.
 *
 * Credentials come from .env.local (never committed):
 *   PINTEREST_ACCESS_TOKEN=<token>
 *   PINTEREST_BOARD_ID=<board-id>
 *   PINTEREST_SECTION_ID= (optional)
 *
 * Usage:
 *   node scripts/pinterest-sync.mjs                # publish pending pins
 *   node scripts/pinterest-sync.mjs --dry-run      # list what would publish
 *   node scripts/pinterest-sync.mjs --limit 5      # publish at most 5
 *   node scripts/pinterest-sync.mjs --record       # rewrite pack with pin ids
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PACK = path.join(ROOT, "work", "pinterest-pack", "pinterest-pack.json");
const ENV = path.join(ROOT, ".env.local");
const API = "https://api.pinterest.com/v5";
const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const record = process.argv.includes("--record");

function loadEnv() {
  if (!existsSync(ENV)) return {};
  const out = {};
  for (const line of readFileSync(ENV, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

async function pinterest(pathname, options = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`Pinterest ${options.method || "GET"} ${pathname} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return body;
}

async function main() {
  const env = loadEnv();
  process.env.PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN || env.PINTEREST_ACCESS_TOKEN || "";
  const boardId = process.env.PINTEREST_BOARD_ID || env.PINTEREST_BOARD_ID || "";
  const sectionId = process.env.PINTEREST_SECTION_ID || env.PINTEREST_SECTION_ID || "";

  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    console.error("Missing PINTEREST_ACCESS_TOKEN in .env.local");
    process.exit(1);
  }
  if (!boardId) {
    console.error("Missing PINTEREST_BOARD_ID in .env.local");
    process.exit(1);
  }
  if (!existsSync(PACK)) {
    console.error("Pack missing; run: npm run pinterest:pack");
    process.exit(1);
  }

  const pack = JSON.parse(readFileSync(PACK, "utf8"));
  const pending = pack.records.filter((r) => !r.pin_id);
  const toPublish = pending.slice(0, limit);
  console.log(`pack: ${pack.records.length} records, pending: ${pending.length}, publishing: ${toPublish.length}${dryRun ? " (dry-run)" : ""}`);

  if (dryRun) {
    for (const r of toPublish) console.log(`  would publish: ${r.title} -> ${r.canonical_link}`);
    return;
  }

  const published = [];
  for (const r of toPublish) {
    const payload = {
      board_id: boardId,
      media_source: { source_type: "image_url", url: r.media_image },
      title: r.title.slice(0, 100),
      description: [r.description, `Source: ${r.canonical_link}`, r.credit].filter(Boolean).join(" \u00b7 ").slice(0, 500),
      link: r.canonical_link,
      alt_text: r.credit,
    };
    if (sectionId) payload.section_id = sectionId;
    try {
      const created = await pinterest("/pins", { method: "POST", body: JSON.stringify(payload) });
      published.push({ title: r.title, pin_id: created.id });
      r.pin_id = created.id;
      console.log(`  published: ${r.title} -> pin ${created.id}`);
    } catch (error) {
      console.error(`  FAILED: ${r.title}: ${error.message}`);
    }
  }

  if (record && published.length) {
    writeFileSync(PACK, JSON.stringify({ ...pack, records: pack.records }, null, 2));
    console.log(`recorded ${published.length} pin ids in the pack`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
