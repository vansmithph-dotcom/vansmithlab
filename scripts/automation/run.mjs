import path from "node:path";
import { agentJson } from "./providers.mjs";
import { dateNow, hash, isoNow, loadOsContext, logStep, makeRun, postWeaveBrief, readJson, root, slugify, stableId, writeJson, writeText } from "./lib.mjs";
import { validateKnowledge, validateRelease } from "./validate.mjs";

const requestArg = process.argv.findIndex((value) => value === "--request");
const requestFile = requestArg >= 0 ? process.argv[requestArg + 1] : process.env.CONTENT_REQUEST;
if (!requestFile) throw new Error("Pass --request automation/requests/file.json or set CONTENT_REQUEST");
const resumeIntakeArg = process.argv.findIndex((value) => value === "--resume-intake");
const resumeIntakeFile = resumeIntakeArg >= 0 ? process.argv[resumeIntakeArg + 1] : null;
const resumeResearchArg = process.argv.findIndex((value) => value === "--resume-research");
const resumeResearchFile = resumeResearchArg >= 0 ? process.argv[resumeResearchArg + 1] : null;
const resumeRawResearchArg = process.argv.findIndex((value) => value === "--resume-raw-research");
const resumeRawResearchFile = resumeRawResearchArg >= 0 ? process.argv[resumeRawResearchArg + 1] : null;
const resumeAuditArg = process.argv.findIndex((value) => value === "--resume-audit");
const resumeAuditFile = resumeAuditArg >= 0 ? process.argv[resumeAuditArg + 1] : null;
const resumeRuDraftArg = process.argv.findIndex((value) => value === "--resume-ru-draft");
const resumeRuDraftFile = resumeRuDraftArg >= 0 ? process.argv[resumeRuDraftArg + 1] : null;
const resumeRuReviewArg = process.argv.findIndex((value) => value === "--resume-ru-review");
const resumeRuReviewFile = resumeRuReviewArg >= 0 ? process.argv[resumeRuReviewArg + 1] : null;
const resumeEnDraftArg = process.argv.findIndex((value) => value === "--resume-en-draft");
const resumeEnDraftFile = resumeEnDraftArg >= 0 ? process.argv[resumeEnDraftArg + 1] : null;
const resumeEnReviewArg = process.argv.findIndex((value) => value === "--resume-en-review");
const resumeEnReviewFile = resumeEnReviewArg >= 0 ? process.argv[resumeEnReviewArg + 1] : null;

const request = await readJson(path.resolve(root, requestFile));
const providerMode = (process.env.CONTENT_PROVIDER_MODE || "api").toLowerCase();
if (!new Set(["api", "local"]).has(providerMode)) throw new Error(`Unsupported CONTENT_PROVIDER_MODE: ${providerMode}`);
if (providerMode === "api") {
  const missing = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required secret(s): ${missing.join(", ")}. See automation/README.md.`);
}

// Preserve the established pipeline call sites while changing the provider
// assignment in local subscription mode. Intake is structural work for Codex;
// factual drafting is produced by Claude and independently reviewed by Codex.
const openaiJson = (args) => agentJson({ ...args, agent: providerMode === "local" ? (args.schemaName === "vansmithlab_intake" ? "codex" : "claude") : "codex" });
const geminiResearch = (args) => agentJson({ ...args, system: args.system || "", agent: providerMode === "local" ? "claude" : "gemini" });
const claudeJson = (args) => agentJson({ ...args, agent: providerMode === "local" ? "codex" : "claude" });

const run = makeRun(request);
const runDir = path.join(root, "automation", "runs", run.id);
const saveRun = () => writeJson(path.join(runDir, "run.json"), run);
await saveRun();

const osContext = await loadOsContext([
  "01_PRODUCT_CHARTER.md", "02_OPERATING_PRINCIPLES.md", "03_KNOWLEDGE_MODEL.md",
  "05_EVIDENCE_POLICY.md", "06_CONTENT_MODEL.md", "07_LANGUAGE_SYSTEM.md",
  "09_AI_OPERATING_MODEL.md", "10_AUTOMATION_AND_ESCALATION.md",
  "playbooks/01_RESEARCH_TO_OBJECT.md", "playbooks/02_CONTENT_PRODUCTION.md", "playbooks/04_LOCALIZATION.md"
]);
const system = `You are operating VANSMITHLAB. The supplied OS is binding. Never invent a source, locator, quote, claim verification, person, date or URL. If evidence is inadequate, return the safe blocked outcome.\n${osContext}`;

const objectSchema = {
  type: "object", additionalProperties: false,
  required: ["title_ru", "slug_ru", "summary_ru", "object_type", "reader_question", "research_questions", "source_queries", "voice"],
  properties: {
    title_ru: { type: "string" }, slug_ru: { type: "string" }, summary_ru: { type: "string" }, object_type: { type: "string" },
    reader_question: { type: "string" }, research_questions: { type: "array", items: { type: "string" } },
    source_queries: { type: "array", items: { type: "string" } }, voice: { enum: ["institutional", "signed"] }
  }
};

let started = isoNow();
let intake;
if (resumeIntakeFile) {
  intake = await readJson(path.resolve(root, resumeIntakeFile));
  logStep(run, "system", "carried-forward-checkpoint", "intake_checkpoint", { request, resumeIntakeFile }, intake, started);
} else {
  const intakeResult = await openaiJson({ system, schema: objectSchema, schemaName: "vansmithlab_intake", prompt: `Create a Russian-first research brief for this request. Analysis must be signed; all other types are institutional.\n${JSON.stringify(request)}` });
  intake = intakeResult.value;
  logStep(run, providerMode === "local" ? "codex" : "openai", intakeResult.model, "intake", request, intake, started);
}
await writeJson(path.join(runDir, "01-intake.json"), intake); await saveRun();

const researchSchema = {
  type: "object", required: ["sources", "claims", "relations", "contradictions"],
  properties: {
    // Source tier is assigned by the independent evidence auditor. Requiring
    // the producing research agent to score its own sources contradicts the
    // role separation in the prompt and caused valid research to fail before
    // the audit could run.
    sources: { type: "array", items: { type: "object", required: ["title", "url", "publisher", "accessed_at"], properties: {
      title: { type: "string" }, url: { type: "string" }, publisher: { type: "string" }, source_tier: { type: "integer" }, accessed_at: { type: "string" }, source_type: { type: "string" }
    } } },
    claims: { type: "array", items: { type: "object", required: ["wording_ru", "claim_type", "material", "evidence"], properties: {
      wording_ru: { type: "string" }, claim_type: { type: "string" }, material: { type: "boolean" },
      evidence: { type: "array", items: { type: "object", required: ["source_url", "locator", "support"], properties: {
        source_url: { type: "string" }, locator: { type: "string" }, support: { type: "string" }
      } } }
    } } },
    relations: { type: "array", items: { type: "object" } }, contradictions: { type: "array", items: { type: "object" } }
  }
};
started = isoNow();
let research;
if (resumeResearchFile) {
  research = await readJson(path.resolve(root, resumeResearchFile));
  const checkpointIssues = ["sources", "claims", "relations", "contradictions"].filter((key) => !Array.isArray(research[key]));
  if (checkpointIssues.length) throw new Error(`Resume research checkpoint is not canonical: ${checkpointIssues.join(", ")}`);
  logStep(run, "system", "documented-release-set", "grounded_research_checkpoint", { request, intake, resumeResearchFile }, research, started);
} else if (resumeRawResearchFile) {
  if (providerMode !== "local") throw new Error("--resume-raw-research is supported only in local subscription mode");
  const rawCheckpoint = await readJson(path.resolve(root, resumeRawResearchFile));
  const rawResearch = rawCheckpoint.value ?? rawCheckpoint;
  const normalizedResult = await agentJson({
    agent: "codex",
    system: "You are a lossless JSON schema normalizer. Do not add, infer, verify, reject or rewrite facts, sources, URLs, locators or claims.",
    schema: researchSchema,
    schemaName: "vansmithlab_recovered_research",
    prompt: `Reshape the saved Claude research into the required interchange schema. Preserve all compatible information. Omit fields that the schema cannot represent. Keep source_tier only when it already exists; the independent audit assigns missing tiers. Return sources, claims, relations and contradictions arrays.\nDATA:${JSON.stringify(rawResearch)}`
  });
  research = normalizedResult.value;
  const checkpointIssues = ["sources", "claims", "relations", "contradictions"].filter((key) => !Array.isArray(research[key]));
  if (checkpointIssues.length) throw new Error(`Recovered research checkpoint is not canonical: ${checkpointIssues.join(", ")}`);
  logStep(run, "codex", `${normalizedResult.model}:checkpoint-recovery`, "grounded_research_recovery", { request, intake, resumeRawResearchFile }, research, started);
} else {
  const researchResult = await geminiResearch({ schema: researchSchema, prompt: `${system}\nResearch the brief using web search and URL context. Prefer primary institutions, museums, archives, universities and academic sources. Use only URLs you actually accessed. Give a precise page/section locator for every evidence item. Do not score your own work.\nREQUEST:${JSON.stringify(request)}\nBRIEF:${JSON.stringify(intake)}` });
  research = researchResult.value;
  logStep(run, providerMode === "local" ? "claude" : "gemini", researchResult.model, "grounded_research", { request, intake }, research, started);
}
await writeJson(path.join(runDir, "02-research.json"), research); await saveRun();

let audit;
if (resumeAuditFile) {
  started = isoNow();
  audit = await readJson(path.resolve(root, resumeAuditFile));
  if (audit.decision !== "AUTO_APPROVE") throw new Error(`Resume audit checkpoint is not approved: ${audit.decision || "missing decision"}`);
  logStep(run, "system", "approved-audit-checkpoint", "evidence_audit_checkpoint", { research, resumeAuditFile }, audit, started);
  await writeJson(path.join(runDir, "03-audit-round-1.json"), audit);
  await writeJson(path.join(runDir, "03-audit.json"), audit); await saveRun();
}
for (let round = 0; round <= 2 && !resumeAuditFile; round += 1) {
  started = isoNow();
  const auditResult = await claudeJson({ system, prompt: `Independently audit this research under VANSMITHLAB OS and ADR-003. Verify source quality, URL traceability, independence, claim scope, locators and contradictions. Agreement with the producing model is not evidence. Audit the proposed release claim set, not every discarded research lead. Use AUTO_REVISE when every defect can be safely repaired through OMIT, NARROW, ATTRIBUTE, SPLIT, REPLACE_SOURCE or HOLD_CLAIM without changing the reader promise. Use EVIDENCE_CONFLICT only for a material irreconcilable conflict that cannot be safely omitted or attributed. Return JSON: {decision: AUTO_APPROVE|AUTO_REVISE|BLOCKED|NEEDS_USER_INPUT|DO_NOT_PUBLISH, reason_code: null or one allowed escalation code, confidence_score: 0..1, verification_state, findings: string[], sources:[same sources with source_tier], claims:[same claims with verification_state and confidence_score], release_claims:[], held_claims:[], revision_actions:[{claim_id,action,instruction}], blocking_claim_ids:[], retry_condition:null|string, contradictions:[], user_question:null|string, recommended_default:string}. AUTO_APPROVE only when every retained material claim is verified and >=0.85 with sufficient independent evidence.\nBRIEF:${JSON.stringify(intake)}\nRESEARCH:${JSON.stringify(research)}` });
  audit = auditResult.value;
  logStep(run, providerMode === "local" ? "codex" : "anthropic", auditResult.model, `evidence_audit_round_${round + 1}`, research, audit, started);
  await writeJson(path.join(runDir, `03-audit-round-${round + 1}.json`), audit);
  await writeJson(path.join(runDir, "03-audit.json"), audit); await saveRun();
  if (audit.decision === "AUTO_APPROVE") break;

  const migrationRepair = audit.decision === "BLOCKED" && ["EVIDENCE_CONFLICT", "MISSING_PRIMARY_EVIDENCE"].includes(audit.reason_code) && Array.isArray(audit.findings) && audit.findings.length > 0;
  if (round >= 2 || (audit.decision !== "AUTO_REVISE" && !migrationRepair)) break;

  started = isoNow();
  const revisionResult = await agentJson({ agent: providerMode === "local" ? "claude" : "codex", system, schema: researchSchema, schemaName: `vansmithlab_evidence_revision_${round + 1}`, prompt: `Apply a claim-level evidence revision under ADR-003. Preserve the reader promise and source history. Do not invent facts, URLs, locators or evidence. Use only OMIT, NARROW, ATTRIBUTE, SPLIT, REPLACE_SOURCE and HOLD_CLAIM. Exclude held claims and rejected relations from the returned release research, but retain unresolved conflicts in the contradictions array. Every retained material claim must be directly supported by its evidence entries. Return the complete revised research object.\nBRIEF:${JSON.stringify(intake)}\nCURRENT_RESEARCH:${JSON.stringify(research)}\nAUDIT:${JSON.stringify(audit)}` });
  const revisedResearch = revisionResult.value;
  logStep(run, providerMode === "local" ? "claude" : "openai", revisionResult.model, `evidence_revision_round_${round + 1}`, { research, audit }, revisedResearch, started);
  research = revisedResearch;
  await writeJson(path.join(runDir, `02-research-revision-${round + 1}.json`), research); await saveRun();
}

if (audit.decision === "AUTO_REVISE") {
  // ADR-003 limits one workflow run to two evidence-revision rounds. If the
  // final audit still requests a safe revision, preserve that diagnostic but
  // stop this run as BLOCKED instead of leaking AUTO_REVISE as a terminal
  // editorial state or flattening it into a technical failure.
  audit = {
    ...audit,
    decision: "BLOCKED",
    findings: [...(audit.findings || []), "The bounded AUTO_REVISE limit was reached; start a new audited run from the latest revised research checkpoint."],
    retry_condition: audit.retry_condition || "Resume from the latest revised research checkpoint and run a new independent evidence audit."
  };
  await writeJson(path.join(runDir, "03-audit.json"), audit); await saveRun();
}

if (audit.decision !== "AUTO_APPROVE") {
  run.state = audit.decision === "NEEDS_USER_INPUT" ? "needs_user_input" : "blocked";
  run.decision = audit.decision; run.completed_at = isoNow(); await saveRun();
  if (audit.decision === "NEEDS_USER_INPUT") await writeJson(path.join(root, "automation", "review-requests", `${run.id}.json`), {
    request_id: `review_${run.id}`, entity_type: "object", entity_id: request.request_id,
    reason_code: audit.reason_code, priority: "normal", question: audit.user_question,
    evidence_summary: audit.findings, recommended_default: audit.recommended_default,
    safe_options: ["Keep private and continue research", "Accept recommended safe default", "Provide a narrower editorial direction"], workflow_run_id: run.id
  });
  throw new Error(`Publication stopped safely: ${audit.decision}${audit.reason_code ? ` (${audit.reason_code})` : ""}`);
}

const sourceByUrl = new Map();
const auditedSources = new Map((audit.sources || []).map((source) => [source.url, source]));
const sources = research.sources.map((source) => {
  const audited = auditedSources.get(source.url) || {};
  const normalized = source.url.replace(/#.*$/, "");
  const item = { ...source, source_tier: audited.source_tier ?? source.source_tier, id: stableId("src", normalized), url: normalized, accessed_at: source.accessed_at || dateNow() };
  sourceByUrl.set(source.url, item); sourceByUrl.set(normalized, item); return item;
});
const auditedClaims = audit.claims || [];
const claims = research.claims.map((claim, index) => {
  const audited = auditedClaims.find((item) => item.id && item.id === claim.id) || auditedClaims[index] || {};
  return { ...claim, id: stableId("clm", claim.wording_ru), verification_state: audited.verification_state || claim.verification_state || "verified", confidence_score: Number(audited.confidence_score ?? claim.confidence_score) };
});
const citations = [];
for (const claim of claims) for (const evidence of claim.evidence || []) {
  const source = sourceByUrl.get(evidence.source_url) || sourceByUrl.get(evidence.source_url?.replace(/#.*$/, ""));
  if (source) citations.push({ id: stableId("cit", `${claim.id}:${source.id}:${evidence.locator}`), claim_id: claim.id, source_id: source.id, locator: evidence.locator, support: evidence.support });
}
const objectId = stableId("obj", `${intake.object_type}:${intake.slug_ru}`);
const knowledge = {
  id: objectId, type: intake.object_type, canonical_locale: "ru", lifecycle_state: "evidence_ready", revision: 1,
  title_ru: intake.title_ru, slug_ru: slugify(intake.slug_ru), summary_ru: intake.summary_ru,
  verification_state: audit.verification_state, confidence_score: Number(audit.confidence_score),
  created_at: isoNow(), updated_at: isoNow(), claims, sources, citations,
  relations: research.relations || [], contradictions: audit.contradictions || research.contradictions || [],
  workflow: { run_id: run.id, request_id: request.request_id, decision: audit.decision, provider_steps: run.steps }
};
validateKnowledge(knowledge);

const draftSchema = {
  type: "object", additionalProperties: false, required: ["title", "slug", "summary", "body_markdown", "claim_ids_used"],
  properties: {
    title: { type: "string", minLength: 1 },
    slug: { type: "string", minLength: 1 },
    summary: { type: "string", minLength: 1 },
    body_markdown: { type: "string", minLength: 200 },
    claim_ids_used: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } }
  }
};
started = isoNow();
let ruDraft;
if (resumeRuDraftFile) {
  ruDraft = await readJson(path.resolve(root, resumeRuDraftFile));
  logStep(run, "system", "russian-draft-checkpoint", "russian_draft_checkpoint", { knowledge, resumeRuDraftFile }, ruDraft, started);
} else {
  const ruDraftResult = await openaiJson({ system, schema: draftSchema, schemaName: "vansmithlab_ru_draft", prompt: `Write the Russian master ${request.content_type}. Use only the supplied claim IDs and facts. Use Markdown headings beginning at ##. Add citation markers like [^claim_id] after factual sentences; do not invent facts or bibliography. Voice: ${intake.voice}. ${request.content_type === "analysis" ? `Signed author: ${request.author || "VANSMITHLAB — author pending"}; clearly label interpretation.` : "Institutional neutral voice."}\nKNOWLEDGE:${JSON.stringify(knowledge)}` });
  ruDraft = ruDraftResult.value;
  logStep(run, providerMode === "local" ? "claude" : "openai", ruDraftResult.model, "russian_draft", knowledge, ruDraft, started);
}
await writeJson(path.join(runDir, "04-ru-draft.json"), ruDraft); await saveRun();

const ruReviewSchema = {
  type: "object", additionalProperties: false,
  required: ["decision", "corrected_title", "corrected_summary", "corrected_body_markdown", "factual_claim_ids", "findings"],
  properties: {
    decision: { enum: ["AUTO_APPROVE", "AUTO_REVISE", "BLOCKED"] },
    corrected_title: { type: "string", minLength: 1 },
    corrected_summary: { type: "string", minLength: 1 },
    corrected_body_markdown: { type: "string", minLength: 200 },
    factual_claim_ids: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    findings: { type: "array", items: { type: "string" } }
  }
};
started = isoNow();
let ruReview;
if (resumeRuReviewFile) {
  ruReview = await readJson(path.resolve(root, resumeRuReviewFile));
  logStep(run, "system", "approved-russian-review-checkpoint", "russian_fact_review_checkpoint", { ruDraft, resumeRuReviewFile }, ruReview, started);
} else {
  const ruReviewResult = await claudeJson({ system, schema: ruReviewSchema, schemaName: "vansmithlab_ru_review", prompt: `Review the Russian title, summary and body sentence by sentence against the knowledge ledger. Return the complete corrected title, summary and body even when unchanged. Use AUTO_APPROVE only if every factual statement in metadata and body is supported and citations are correctly scoped; otherwise AUTO_REVISE with corrected text or BLOCKED. Findings must be concise strings. Do not add facts.\nKNOWLEDGE:${JSON.stringify(knowledge)}\nDRAFT:${JSON.stringify(ruDraft)}` });
  ruReview = ruReviewResult.value;
  logStep(run, providerMode === "local" ? "codex" : "anthropic", ruReviewResult.model, "russian_fact_review", ruDraft, ruReview, started);
}
await writeJson(path.join(runDir, "05-ru-review.json"), ruReview); await saveRun();
if (!["AUTO_APPROVE", "AUTO_REVISE"].includes(ruReview.decision)) throw new Error(`Russian draft blocked: ${ruReview.decision}`);
const ruTitle = ruReview.corrected_title.trim();
const ruSummary = ruReview.corrected_summary.trim();
const ruBody = ruReview.corrected_body_markdown.trimEnd() + "\n";

started = isoNow();
let enDraft;
if (resumeEnDraftFile) {
  enDraft = await readJson(path.resolve(root, resumeEnDraftFile));
  logStep(run, "system", "english-draft-checkpoint", "english_adaptation_checkpoint", { ruBody, resumeEnDraftFile }, enDraft, started);
} else {
  const enDraftResult = await openaiJson({ system, schema: draftSchema, schemaName: "vansmithlab_en_adaptation", prompt: `Create an idiomatic English editorial adaptation of the approved Russian master. Preserve all claim IDs, citations, dates, names, numbers, uncertainty and structure. Add no facts and omit none.\nRUSSIAN:${ruBody}\nMETADATA:${JSON.stringify({ title: ruTitle, summary: ruSummary, source_revision: 1 })}` });
  enDraft = enDraftResult.value;
  logStep(run, providerMode === "local" ? "claude" : "openai", enDraftResult.model, "english_adaptation", ruBody, enDraft, started);
}
await writeJson(path.join(runDir, "06-en-draft.json"), enDraft); await saveRun();

const enReviewSchema = {
  type: "object", additionalProperties: false,
  required: ["decision", "semantic_validated", "corrected_title", "corrected_summary", "corrected_body_markdown", "findings"],
  properties: {
    decision: { enum: ["AUTO_APPROVE", "AUTO_REVISE", "NEEDS_USER_INPUT"] },
    semantic_validated: { type: "boolean" },
    corrected_title: { type: "string", minLength: 1 },
    corrected_summary: { type: "string", minLength: 1 },
    corrected_body_markdown: { type: "string", minLength: 200 },
    findings: { type: "array", items: { type: "string" } }
  }
};
started = isoNow();
let enReview;
if (resumeEnReviewFile) {
  enReview = await readJson(path.resolve(root, resumeEnReviewFile));
  logStep(run, "system", "approved-english-review-checkpoint", "english_semantic_review_checkpoint", { enDraft, resumeEnReviewFile }, enReview, started);
} else {
  const enReviewResult = await claudeJson({ system, schema: enReviewSchema, schemaName: "vansmithlab_en_review", prompt: `Compare the English title, summary and body semantically with the approved Russian master. Return complete corrected metadata and body even when unchanged. Preserve claim IDs, citations, dates, names, numbers and uncertainty. Findings must be concise strings. AUTO_APPROVE/AUTO_REVISE only if full parity is safe; otherwise NEEDS_USER_INPUT with reason UNRESOLVED_TRANSLATION.\nRUSSIAN:${JSON.stringify({ title: ruTitle, summary: ruSummary, body_markdown: ruBody })}\nENGLISH:${JSON.stringify(enDraft)}` });
  enReview = enReviewResult.value;
  logStep(run, providerMode === "local" ? "codex" : "anthropic", enReviewResult.model, "english_semantic_review", enDraft, enReview, started);
}
await writeJson(path.join(runDir, "07-en-review.json"), enReview); await saveRun();
if (!enReview.semantic_validated || !["AUTO_APPROVE", "AUTO_REVISE"].includes(enReview.decision)) throw new Error("English localization blocked: UNRESOLVED_TRANSLATION");
const enTitle = enReview.corrected_title.trim();
const enSummary = enReview.corrected_summary.trim();
const enBody = enReview.corrected_body_markdown.trimEnd() + "\n";

const contentId = stableId("cnt", `${objectId}:${request.content_type}`);
const typeDir = request.content_type === "research" || request.content_type === "case_study" || request.content_type === "visual_analysis" ? "articles" : request.content_type;
const common = { content_id: contentId, primary_object_id: objectId, content_type: request.content_type, state: "published", source_locale: "ru", source_revision: 1, verification_state: knowledge.verification_state, confidence_score: knowledge.confidence_score, claim_ids: claims.map((claim) => claim.id), source_ids: sources.map((source) => source.id), last_reviewed: dateNow(), author: request.content_type === "analysis" ? request.author || "VANSMITHLAB — author pending" : "VANSMITHLAB" };
const ruMeta = { ...common, locale: "ru", slug: slugify(ruDraft.slug || intake.slug_ru), title: ruTitle, summary: ruSummary, body_hash: hash(ruBody) };
const enMeta = { ...common, locale: "en", slug: slugify(enDraft.slug || ruMeta.slug), title: enTitle, summary: enSummary, body_hash: hash(enBody), translation: { source_locale: "ru", source_revision: 1, semantic_validated: true, review_run_id: run.id } };
await validateRelease(ruMeta, ruBody, knowledge); await validateRelease(enMeta, enBody, knowledge);

await writeJson(path.join(root, "knowledge", "objects", `${objectId}.json`), { ...knowledge, lifecycle_state: "published", updated_at: isoNow() });
for (const [locale, meta, body] of [["ru", ruMeta, ruBody], ["en", enMeta, enBody]]) {
  const base = path.join(root, "content", locale, typeDir, meta.slug);
  await writeJson(`${base}.json`, meta); await writeText(`${base}.md`, body);
}

if (request.media_requested) {
  const brief = { asset_id: stableId("asset", contentId), primary_object_id: objectId, content_release_id: contentId, kind: "image", origin: "ai_illustration", locale: "ru", educational_purpose: `Support ${ruMeta.title} without acting as documentary evidence`, may_depict: claims.filter((claim) => claim.claim_type === "descriptive").map((claim) => claim.wording_ru), must_not_imply: ["Generated media is historical evidence", "Unverified appearance, authorship or date"], rights: { state: "generated_pending_review", disclosure: "AI illustration" }, accessibility: { alt_text: "pending", caption: "pending" }, workflow_run_id: run.id };
  await writeJson(path.join(root, "automation", "media-briefs", `${contentId}.json`), brief);
  run.media_handoff = await postWeaveBrief(brief);
}

run.state = "completed"; run.decision = "AUTO_APPROVE"; run.completed_at = isoNow(); run.release = { content_id: contentId, object_id: objectId, ru: ruMeta.slug, en: enMeta.slug };
await saveRun();
console.log(JSON.stringify(run.release));
