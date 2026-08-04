import path from "node:path";
import { isoNow, root, slugify, stableId, writeJson } from "./lib.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1] && !all[index + 1].startsWith("--") ? all[index + 1] : true]);
  return pairs;
}, []));
if (!args.topic || args.topic === true) throw new Error("Usage: npm run content:request -- --topic \"...\" [--type research] [--media true]");
const contentType = args.type || "research";
const request = {
  request_id: stableId("req", `${args.topic}:${isoNow()}`),
  topic: args.topic,
  content_type: contentType,
  requested_at: isoNow(),
  target_locales: ["ru", "en"],
  media_requested: args.media === "true",
  scope: args.scope || "",
  source_leads: []
};
const file = path.join(root, "automation", "requests", `${slugify(args.topic).slice(0, 60)}.json`);
await writeJson(file, request);
console.log(file);
