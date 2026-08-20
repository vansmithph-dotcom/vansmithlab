import { existsSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join, normalize, resolve, sep } from "node:path";

const root = process.cwd();
const imageRoot = resolve(root, "public", "images");
const reportPath = join(root, "work", "media-orphan-audit.json");
const report = JSON.parse(readFileSync(reportPath, "utf8"));
let removed = 0;
let bytes = 0;

for (const webPath of report.orphan_paths || []) {
  if (!webPath.startsWith("/images/")) throw new Error(`Unexpected orphan path: ${webPath}`);
  const target = resolve(root, "public", ...normalize(webPath).split(/[\\/]+/).filter(Boolean));
  if (target !== imageRoot && !target.startsWith(`${imageRoot}${sep}`)) {
    throw new Error(`Refusing to delete outside public/images: ${target}`);
  }
  if (!existsSync(target)) continue;
  const { size } = statSync(target);
  unlinkSync(target);
  removed += 1;
  bytes += size;
}

console.log(JSON.stringify({ removed, bytes }));
