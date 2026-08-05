import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { assert, hash, readJson, root } from "./lib.mjs";

const allowedTypes = new Set(["encyclopedia", "glossary", "research", "case_study", "visual_analysis", "timeline", "collection", "analysis"]);
const allowedEscalations = new Set(["EVIDENCE_CONFLICT", "MISSING_PRIMARY_EVIDENCE", "RIGHTS_OR_BRAND_RISK", "EDITORIAL_CHOICE", "HIGH_IMPACT_CORRECTION", "UNRESOLVED_TRANSLATION"]);

export const canonicalBody = (body) => body.replace(/\r\n?/g, "\n").trimEnd() + "\n";

export function validateKnowledge(object) {
  assert(object.id && object.canonical_locale === "ru", `${object.id || "object"}: canonical locale must be ru`);
  assert(Number.isInteger(object.revision) && object.revision > 0, `${object.id}: invalid revision`);
  assert(["verified", "multi_source_verified"].includes(object.verification_state), `${object.id}: object is not verified`);
  assert(object.confidence_score >= 0.85, `${object.id}: confidence below 0.85`);
  assert(Array.isArray(object.sources) && object.sources.length >= 2, `${object.id}: at least two sources required`);
  assert(new Set(object.sources.map((source) => source.id)).size === object.sources.length, `${object.id}: duplicate source ids`);
  const sourceIds = new Set(object.sources.map((source) => source.id));
  const claimIds = new Set();
  for (const claim of object.claims || []) {
    assert(claim.id && !claimIds.has(claim.id), `${object.id}: duplicate/empty claim id`); claimIds.add(claim.id);
    assert(claim.wording_ru && claim.confidence_score >= 0.85, `${claim.id}: material claim below threshold`);
    assert(["verified", "multi_source_verified"].includes(claim.verification_state), `${claim.id}: claim is not verified`);
    const citations = (object.citations || []).filter((citation) => citation.claim_id === claim.id);
    assert(citations.length > 0, `${claim.id}: missing citation`);
    for (const citation of citations) assert(sourceIds.has(citation.source_id) && citation.locator, `${claim.id}: invalid citation`);
  }
  assert(claimIds.size > 0, `${object.id}: no claims`);
  assert(!object.contradictions?.some((item) => item.active && item.grade === "high"), `${object.id}: active high-grade contradiction`);
  return true;
}

export async function validateRelease(metadata, body, knowledge) {
  assert(allowedTypes.has(metadata.content_type), `${metadata.content_id}: unsupported content type`);
  assert(metadata.state === "published", `${metadata.content_id}: not published`);
  assert(["ru", "en"].includes(metadata.locale), `${metadata.content_id}: invalid locale`);
  assert(metadata.source_locale === "ru", `${metadata.content_id}: source locale must be ru`);
  assert(metadata.source_revision === knowledge.revision, `${metadata.content_id}: stale source revision`);
  assert(metadata.confidence_score >= 0.85, `${metadata.content_id}: confidence below 0.85`);
  assert(metadata.body_hash === hash(canonicalBody(body)), `${metadata.content_id}: body hash mismatch`);
  const claims = new Set(knowledge.claims.map((claim) => claim.id));
  for (const id of metadata.claim_ids || []) assert(claims.has(id), `${metadata.content_id}: unknown claim ${id}`);
  assert(metadata.claim_ids?.length > 0, `${metadata.content_id}: no claims linked`);
  if (metadata.locale === "en") assert(metadata.translation?.semantic_validated === true, `${metadata.content_id}: English semantic validation missing`);
  if (metadata.escalation_code) assert(allowedEscalations.has(metadata.escalation_code), `${metadata.content_id}: invalid escalation code`);
  return true;
}

async function walk(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) files.push(...(entry.isDirectory() ? await walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
    return files;
  } catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

export async function validateRepository() {
  const metadataFiles = (await walk(path.join(root, "content"))).filter((file) => file.endsWith(".json"));
  for (const metadataFile of metadataFiles) {
    const metadata = await readJson(metadataFile);
    const bodyFile = metadataFile.replace(/\.json$/, ".md");
    const body = await readFile(bodyFile, "utf8");
    const knowledge = await readJson(path.join(root, "knowledge", "objects", `${metadata.primary_object_id}.json`));
    validateKnowledge(knowledge);
    await validateRelease(metadata, body, knowledge);
  }
  return metadataFiles.length;
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, "/")}`).href) {
  const count = await validateRepository();
  console.log(`Validated ${count} content release(s).`);
}
