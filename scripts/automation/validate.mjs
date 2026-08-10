import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assert, hash, readJson, root } from "./lib.mjs";

const allowedTypes = new Set(["encyclopedia", "glossary", "research", "case_study", "visual_analysis", "timeline", "collection", "analysis", "designer_profile", "artist_profile"]);
const allowedEscalations = new Set(["EVIDENCE_CONFLICT", "MISSING_PRIMARY_EVIDENCE", "RIGHTS_OR_BRAND_RISK", "EDITORIAL_CHOICE", "HIGH_IMPACT_CORRECTION", "UNRESOLVED_TRANSLATION"]);
// ADR-004: partially_verified is an honest, lower tier — author-supplied drafts that have not
// been run through the automated research -> evidence -> russian_fact_review pipeline. It may
// publish (with the label visibly shown to readers) at a lower confidence floor than fully
// verified content, but every claim still needs a real citation — the floor is honesty, not proof.
const fullyVerifiedStates = new Set(["verified", "multi_source_verified"]);
const allVerificationStates = new Set([...fullyVerifiedStates, "partially_verified"]);
const confidenceFloor = (state) => (fullyVerifiedStates.has(state) ? 0.85 : 0.6);

export const canonicalBody = (body) => body.replace(/\r\n?/g, "\n").trimEnd() + "\n";

export function validateKnowledge(object) {
  assert(object.id && object.canonical_locale === "ru", `${object.id || "object"}: canonical locale must be ru`);
  assert(Number.isInteger(object.revision) && object.revision > 0, `${object.id}: invalid revision`);
  assert(allVerificationStates.has(object.verification_state), `${object.id}: unknown verification_state`);
  assert(object.confidence_score >= confidenceFloor(object.verification_state), `${object.id}: confidence below floor for its verification_state`);
  assert(Array.isArray(object.sources) && object.sources.length >= 2, `${object.id}: at least two sources required`);
  assert(new Set(object.sources.map((source) => source.id)).size === object.sources.length, `${object.id}: duplicate source ids`);
  const sourceIds = new Set(object.sources.map((source) => source.id));
  const claimIds = new Set();
  for (const claim of object.claims || []) {
    assert(claim.id && !claimIds.has(claim.id), `${object.id}: duplicate/empty claim id`); claimIds.add(claim.id);
    assert(claim.wording_ru && claim.confidence_score >= confidenceFloor(object.verification_state), `${claim.id}: material claim below threshold`);
    assert(allVerificationStates.has(claim.verification_state) || claim.verification_state === "attributed", `${claim.id}: unknown claim verification_state`);
    const citations = (object.citations || []).filter((citation) => citation.claim_id === claim.id);
    assert(citations.length > 0, `${claim.id}: missing citation`);
    for (const citation of citations) assert(sourceIds.has(citation.source_id) && citation.locator, `${claim.id}: invalid citation`);
  }
  assert(claimIds.size > 0, `${object.id}: no claims`);
  assert(!object.contradictions?.some((item) => item.active && item.grade === "high"), `${object.id}: active high-grade contradiction`);
  return true;
}

export async function validateRelease(metadata, body, knowledge) {
  assert(allowedTypes.has(metadata.content_type) || metadata.content_type.endsWith("_profile"), `${metadata.content_id}: unsupported content type`);
  assert(metadata.state === "published", `${metadata.content_id}: not published`);
  assert(["ru", "en"].includes(metadata.locale), `${metadata.content_id}: invalid locale`);
  assert(metadata.source_locale === "ru", `${metadata.content_id}: source locale must be ru`);
  assert(metadata.source_revision === knowledge.revision, `${metadata.content_id}: stale source revision`);
  assert(metadata.verification_state === knowledge.verification_state, `${metadata.content_id}: verification_state must match its knowledge object`);
  assert(metadata.confidence_score >= confidenceFloor(metadata.verification_state), `${metadata.content_id}: confidence below floor for its verification_state`);
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
  const issues = [];
  let validated = 0;
  let drafts = 0;
  for (const metadataFile of metadataFiles) {
    try {
      const metadata = await readJson(metadataFile);
      if (metadata.state !== "published") {
        drafts += 1;
        continue;
      }
      assert(metadata.primary_object_id, `${metadata.content_id}: primary knowledge object missing`);
      const bodyFile = metadataFile.replace(/\.json$/, ".md");
      const body = await readFile(bodyFile, "utf8");
      const knowledge = await readJson(path.join(root, "knowledge", "objects", `${metadata.primary_object_id}.json`));
      validateKnowledge(knowledge);
      await validateRelease(metadata, body, knowledge);
      validated += 1;
    } catch (error) {
      issues.push(`${path.relative(root, metadataFile)}: ${error.message}`);
    }
  }
  if (issues.length > 0) {
    throw new Error(`Published content validation failed with ${issues.length} issue(s):\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
  }
  return { validated, drafts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { validated, drafts } = await validateRepository();
  console.log(`Validated ${validated} published release(s); skipped ${drafts} draft(s).`);
}
