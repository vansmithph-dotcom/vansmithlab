import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const queuePath = join(root, "work", "profile-portrait-queue.json");
const queue = JSON.parse(readFileSync(queuePath, "utf8"));
let updated = 0;

for (const pair of queue.pairs) {
  for (const [locale, relativePath] of Object.entries(pair.files)) {
    const contentPath = join(root, relativePath);
    const content = JSON.parse(readFileSync(contentPath, "utf8"));
    const portrait = content.portrait_image;
    if (!portrait) continue;

    const isRu = locale === "ru";
    portrait.alt = isRu ? `Портрет ${content.title}` : `Portrait of ${content.title}`;
    if (portrait.origin === "ai_reconstruction") {
      portrait.caption = isRu
        ? `ИИ-реконструкция портрета ${content.title} по публичному фотографическому референсу.`
        : `AI portrait reconstruction of ${content.title} from a public photographic reference.`;
      portrait.licence_url = `https://vansmithlab.com/${locale}/method/`;
    } else if (portrait.source_url?.includes("wikimedia.org") || portrait.source_url?.includes("wikipedia.org")) {
      portrait.caption = isRu
        ? `Портрет ${content.title}. Источник: Wikimedia Commons.`
        : `Portrait of ${content.title}. Source: Wikimedia Commons.`;
      if (!portrait.licence_url && portrait.licence === "Public domain") {
        portrait.licence_url = "https://creativecommons.org/publicdomain/mark/1.0/";
      }
    }

    const temporaryPath = `${contentPath}.tmp`;
    writeFileSync(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
    renameSync(temporaryPath, contentPath);
    updated += 1;
  }
}

console.log(JSON.stringify({ updated }));
