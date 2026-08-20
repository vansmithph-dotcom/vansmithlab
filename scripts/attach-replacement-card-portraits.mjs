import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const generatedRoot = "C:/Users/VAN/.codex/generated_images/01a01df0-2ccb-7c90-b3b8-9903e6350a93";
const replacements = new Map([
  ["achille-castiglioni-curiosity-function-everyday-objects", "exec-dacba5e9-ad3e-47d6-af4f-63134f02e866.png"],
  ["paola-antonelli-expanding-design-museum-curation", "exec-55a6bb0c-4523-44c9-a5ec-61ac128c2f3b.png"],
  ["roland-barthes-signs-myth-fashion-photography", "exec-6f4be034-5b50-4e97-8183-e96bb3a21df4.png"],
  ["melanie-ward-modern-stylist-authenticity-construction", "exec-5d1bdae3-664b-4a01-87ab-39767310cd14.png"],
  ["ray-petri-buffalo-styling-new-masculinity", "exec-202958a6-007d-4f3e-a34b-883303b13849.png"],
  ["jean-michel-frank-emptiness-material-understatement", "exec-c9c920bd-37d8-42f1-ae98-4568a03ba91d.png"],
  ["eileen-gray-interior-body-privacy-modernism", "exec-64ac7127-9664-4607-b992-66b0634ff512.png"],
  ["antonio-lopez-fashion-illustration-live-bodies", "exec-acf33d1e-06ff-4814-b919-fa11b3ee58f1.png"],
  ["rene-gruau-line-glamour-fashion-illustration", "exec-ab8bf355-2cd6-4a2b-9e52-19acac6d8ae9.png"],
]);

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(target);
    return entry.isFile() && entry.name.endsWith(".json") ? [target] : [];
  }));
  return nested.flat();
}

const contentFiles = await jsonFiles(path.resolve("content"));
const matched = new Map([...replacements.keys()].map((slug) => [slug, 0]));
const records = new Map();

for (const contentPath of contentFiles) {
  const content = JSON.parse(await readFile(contentPath, "utf8"));
  const generatedName = replacements.get(content.slug);
  if (!generatedName) continue;

  const relativeDirectory = path.dirname(path.relative(path.resolve("content", content.locale, "glossary"), contentPath));
  const outputDirectory = path.resolve("public", "images", "glossary", relativeDirectory);
  const outputName = `${content.slug}-portrait-ai-v2-card.webp`;
  const outputPath = path.join(outputDirectory, outputName);
  await mkdir(outputDirectory, { recursive: true });

  if ((matched.get(content.slug) ?? 0) === 0) {
    await sharp(path.join(generatedRoot, generatedName))
      .rotate()
      .resize(1536, 1024, { fit: "cover", position: "centre" })
      .webp({ quality: 90, effort: 6, smartSubsample: true })
      .toFile(outputPath);
  }

  const bytes = await readFile(outputPath);
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const isRu = content.locale === "ru";
  content.hero_image = {
    src: `/images/glossary/${relativeDirectory.replaceAll("\\", "/")}/${outputName}`,
    origin: "ai_illustration",
    rights_state: "original_owned",
    rights_status: "ai_generated",
    source_url: "",
    credit: isRu
      ? "VANSMITHLAB · оригинальная редакционная AI-иллюстрация, 2026"
      : "VANSMITHLAB · original editorial AI illustration, 2026",
    licence_or_permission: isRu
      ? "Оригинальная AI-иллюстрация VANSMITHLAB; не документальная фотография."
      : "Original AI illustration by VANSMITHLAB; not a documentary photograph.",
    alt: isRu ? `Редакционная портретная иллюстрация: ${content.title}` : `Editorial portrait illustration: ${content.title}`,
    alt_text: isRu ? `Редакционная портретная иллюстрация: ${content.title}` : `Editorial portrait illustration: ${content.title}`,
    caption: isRu
      ? `Редакционная AI-реконструкция портрета ${content.title}. Не является документальной фотографией.`
      : `Editorial AI portrait reconstruction of ${content.title}. Not a documentary photograph.`,
    disclosure: isRu
      ? "ИИ-реконструкция внешности на основе публичных фотографических референсов; не архивная фотография."
      : "AI reconstruction based on public photographic references; not an archival photograph.",
    asset_id: `ast_${contentHash.slice(0, 16)}`,
    content_hash: contentHash,
    storage_key: path.relative(process.cwd(), outputPath).replaceAll("\\", "/"),
    width: 1536,
    height: 1024,
    mime_type: "image/webp",
  };
  await writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  if (!records.has(content.slug)) {
    records.set(content.slug, {
      asset_id: `asset_${content.slug}-portrait-ai-v2-card_record_v1`,
      record_type: "asset_record",
      record_basis: "Generated as a replacement for a distorted profile-card portrait after visual QA.",
      asset_path: path.relative(process.cwd(), outputPath).replaceAll("\\", "/"),
      primary_object_id: content.primary_object_id ?? "",
      content_release_id: content.content_id,
      kind: "image",
      origin: "ai_illustration",
      locale: "multilingual",
      educational_purpose: `Editorial portrait card for the profile of ${content.title}.`,
      may_depict: [content.title, "the subject's professional context"],
      must_not_imply: ["The image is an archival or documentary photograph", "The depicted setting documents a specific historical event"],
      rights: {
        state: "generated_reviewed",
        disclosure: "Original VANSMITHLAB AI-generated editorial illustration, 2026.",
        rights_basis: "Original AI visual generated for VANSMITHLAB; no third-party image is reproduced.",
        third_party_marks: "None requested; output visually reviewed for text, logos and watermarks.",
      },
      accessibility: {
        alt_text_en: `Editorial portrait illustration: ${content.title}`,
        alt_text_ru: `Редакционная портретная иллюстрация: ${content.title}`,
        caption_en: `Editorial AI portrait reconstruction of ${content.title}. Not a documentary photograph.`,
        caption_ru: `Редакционная AI-реконструкция портрета ${content.title}. Не является документальной фотографией.`,
      },
      file: {
        path: path.relative(process.cwd(), outputPath).replaceAll("\\", "/"),
        sha256: contentHash,
        bytes: bytes.length,
        format: "webp",
        width: 1536,
        height: 1024,
      },
      generation: {
        tool: "OpenAI built-in image generation",
        prompt: `A historically and professionally contextualized editorial portrait reconstruction of ${content.title}; horizontal 3:2; subject safely centered with full head, shoulders and hands; generous crop margins; natural anatomy; no text, logo, watermark or diagram.`,
        generated_at: "2026-08-20",
        note: "Individually generated and visually reviewed before attachment.",
      },
    });
  }
  matched.set(content.slug, (matched.get(content.slug) ?? 0) + 1);
}

const incomplete = [...matched].filter(([, count]) => count !== 2);
if (incomplete.length) throw new Error(`Expected RU/EN pairs, got ${JSON.stringify(incomplete)}`);
await mkdir(path.resolve("automation", "media-briefs"), { recursive: true });
for (const [slug, record] of records) {
  await writeFile(path.resolve("automation", "media-briefs", `asset_${slug}-portrait-ai-v2-card_record_v1.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify({ replacements: replacements.size, localizedRecords: [...matched.values()].reduce((sum, count) => sum + count, 0) }, null, 2));
