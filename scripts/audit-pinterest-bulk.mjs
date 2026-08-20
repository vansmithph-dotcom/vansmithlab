#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "exports", "pinterest");
const PACK = path.join(ROOT, "work", "pinterest-pack", "pinterest-pack.json");
const expectedHeaders = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];
const errors = [];
const fail = (message) => errors.push(message);
if (!fs.existsSync(PACK)) fail("Pinterest JSON pack is missing");
if (!fs.existsSync(path.join(DIR, "manifest.json"))) fail("Pinterest bulk manifest is missing");

if (!errors.length) {
  const pack = JSON.parse(fs.readFileSync(PACK, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
  if (JSON.stringify(manifest.headers) !== JSON.stringify(expectedHeaders)) fail("Bulk CSV headers differ from Pinterest's template");
  if (manifest.total_records !== pack.records.length) fail("Manifest and pack record counts differ");
  if (manifest.batch_files.some((batch) => batch.count > 200)) fail("A bulk CSV batch exceeds 200 Pins");
  if (manifest.batch_files.reduce((sum, batch) => sum + batch.count, 0) !== pack.records.length) fail("Batch counts do not cover the pack");
  const titles = new Set();
  const links = new Set();
  for (const record of pack.records) {
    if (Array.from(record.title).length > 100) fail(`Title exceeds 100 chars: ${record.canonical_link}`);
    if (Array.from(record.description).length > 500) fail(`Description exceeds 500 chars: ${record.canonical_link}`);
    if (!/^https:\/\/vansmithlab\.com\/(?:ru|en)\//.test(record.canonical_link)) fail(`Non-canonical link: ${record.canonical_link}`);
    if (!/^https:\/\/vansmithlab\.com\/.+\.(?:png|jpe?g)$/i.test(record.media_image)) fail(`Media URL is not a direct PNG/JPEG: ${record.media_image}`);
    if (titles.has(record.title)) fail(`Duplicate title: ${record.title}`);
    if (links.has(record.canonical_link)) fail(`Duplicate canonical link: ${record.canonical_link}`);
    titles.add(record.title); links.add(record.canonical_link);
    const localImage = path.join(ROOT, "public", new URL(record.media_image).pathname.replace(/^\/+/, ""));
    if (!fs.existsSync(localImage)) fail(`Media derivative missing: ${localImage}`);
  }
  for (const batch of manifest.batch_files) {
    const file = path.join(DIR, batch.file);
    if (!fs.existsSync(file)) fail(`Batch file missing: ${batch.file}`);
    else {
      const firstLine = fs.readFileSync(file, "utf8").split(/\r?\n/, 1)[0];
      const expected = expectedHeaders.map((value) => `"${value}"`).join(",");
      if (firstLine !== expected) fail(`Bad header in ${batch.file}`);
    }
  }
}

if (errors.length) { console.error(`Pinterest bulk audit failed (${errors.length})\n${errors.slice(0, 30).join("\n")}`); process.exit(1); }
const pack = JSON.parse(fs.readFileSync(PACK, "utf8"));
console.log(`Pinterest bulk audit passed: ${pack.records.length} unique image Pins in batches of at most 200.`);
