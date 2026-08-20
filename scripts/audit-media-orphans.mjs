import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const imageRoot = path.join(publicRoot, "images");
const ignored = new Set([
  ".agents",
  ".codex",
  ".git",
  ".next",
  "VANSMITHLAB_OS",
  "docs",
  "graft",
  "node_modules",
  "OpenMontage",
  "out",
  "work",
]);
const imageExt = /\.(?:png|jpe?g|webp|avif|gif|svg)$/i;
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const assetFiles = walk(imageRoot).filter((file) => imageExt.test(file));
// Pinterest bulk exports are a publication surface too: their Media URL
// columns intentionally reference JPEG derivatives that do not appear in the
// article JSON. Include CSV files so those deployed assets are not reported as
// removable orphans.
const referenceFiles = walk(root).filter((file) => /\.(?:json|md|tsx|ts|css|mjs|py|html|txt|csv)$/.test(file));
const referenceText = referenceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const referenced = new Set([...referenceText.matchAll(/\/images\/[A-Za-z0-9_./-]+/g)].map((match) => match[0].replace(/[),"'<>`].*$/, "")));
const orphan = assetFiles.filter((file) => {
  const webPath = `/${path.relative(publicRoot, file).replaceAll("\\", "/")}`;
  return !referenced.has(webPath);
});
const byDir = (files) => Object.fromEntries([...new Set(files.map((file) => path.relative(imageRoot, file).split(path.sep)[0]))].sort().map((dir) => [dir, files.filter((file) => path.relative(imageRoot, file).startsWith(`${dir}${path.sep}`)).length]));
const report = { generated_at: new Date().toISOString(), assets: assetFiles.length, referenced_assets: assetFiles.length - orphan.length, orphan_assets: orphan.length, orphan_bytes: orphan.reduce((sum, file) => sum + fs.statSync(file).size, 0), orphan_by_directory: byDir(orphan), orphan_paths: orphan.map((file) => `/${path.relative(publicRoot, file).replaceAll("\\", "/")}`) };
fs.mkdirSync(path.join(root, "work"), { recursive: true });
fs.writeFileSync(path.join(root, "work", "media-orphan-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report, orphan_paths: report.orphan_paths.slice(0, 30) }, null, 2));
