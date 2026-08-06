import path from "node:path";
import { dateNow, readJson, root, writeJson } from "./lib.mjs";

const manifestArg = process.argv.indexOf("--manifest");
if (manifestArg < 0 || !process.argv[manifestArg + 1]) throw new Error("Pass --manifest automation/release-sets/file.json");
const manifest = await readJson(path.resolve(root, process.argv[manifestArg + 1]));
const sourceDocument = await readJson(path.resolve(root, manifest.source_research));
const patchByClaim = new Map((manifest.narrow_patches || []).map((item) => [item.claim_id, item.wording_ru]));
const sourceById = new Map((sourceDocument.sources_registry || []).map((source) => [source.source_id, source]));
const claims = (sourceDocument.mechanisms || []).flatMap((mechanism) => mechanism.claims || []).map((claim) => {
  const wording = patchByClaim.get(claim.claim_id) || claim.wording_ru;
  return {
    id: claim.claim_id,
    wording_ru: wording,
    claim_type: claim.claim_type || "factual",
    material: true,
    verification_state: claim.verification_state,
    confidence_score: claim.confidence_score,
    evidence: (claim.citations || []).map((citation) => {
      const source = sourceById.get(citation.source_id);
      if (!source?.url) throw new Error(`Missing source URL for ${claim.claim_id}:${citation.source_id}`);
      return { source_url: source.url, locator: citation.locator, support: wording };
    })
  };
});

for (const requiredPatch of patchByClaim.keys()) if (!claims.some((claim) => claim.id === requiredPatch)) {
  throw new Error(`Patch target is absent from release claims: ${requiredPatch}`);
}
const referencedUrls = new Set(claims.flatMap((claim) => claim.evidence.map((item) => item.source_url)));
const sources = (sourceDocument.sources_registry || []).filter((source) => referencedUrls.has(source.url)).map((source) => ({
  title: source.title,
  url: source.url,
  publisher: source.publisher,
  source_tier: Number(source.tier),
  accessed_at: source.accessed_at || dateNow(),
  source_type: source.source_type || "institutional_web_source"
}));

const releaseSet = {
  sources,
  claims,
  relations: (sourceDocument.mechanisms || []).map((mechanism) => ({
    relation_type: "documented_mechanism",
    mechanism_id: mechanism.mechanism_id,
    label_ru: mechanism.label_ru,
    claim_ids: (mechanism.claims || []).map((claim) => claim.claim_id),
    limitations_ru: mechanism.limitations_ru || []
  })),
  contradictions: sourceDocument.contradictions || [],
  release_set_provenance: {
    source_run_id: manifest.source_run_id,
    source_research: manifest.source_research,
    source_audit: manifest.source_audit,
    transformation: "documented_claim_level_narrow_only",
    patch_count: patchByClaim.size
  }
};
await writeJson(path.resolve(root, manifest.output), releaseSet);
console.log(manifest.output);
