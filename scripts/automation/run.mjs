import path from "node:path";
import { claudeJson, geminiResearch, openaiJson } from "./providers.mjs";
import { dateNow, hash, isoNow, loadOsContext, logStep, makeRun, postWeaveBrief, readJson, root, slugify, stableId, writeJson, writeText } from "./lib.mjs";
import { validateKnowledge, validateRelease } from "./validate.mjs";

const requestArg = process.argv.findIndex((value) => value === "--request");
const requestFile = requestArg >= 0 ? process.argv[requestArg + 1] : process.env.CONTENT_REQUEST;
if (!requestFile) throw new Error("Pass --request automation/requests/file.json or set CONTENT_REQUEST");

const request = await readJson(path.resolve(root, requestFile));
const missing = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"].filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing required secret(s): ${missing.join(", ")}. See automation/README.md.`);

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
const intakeResult = await openaiJson({ system, schema: objectSchema, schemaName: "vansmithlab_intake", prompt: `Create a Russian-first research brief for this request. Analysis must be signed; all other types are institutional.\n${JSON.stringify(request)}` });
const intake = intakeResult.value;
logStep(run, "openai", intakeResult.model, "intake", request, intake, started);
await writeJson(path.join(runDir, "01-intake.json"), intake); await saveRun();

const researchSchema = {
  type: "object", required: ["sources", "claims", "relations", "contradictions"],
  properties: {
    sources: { type: "array", items: { type: "object", required: ["title", "url", "publisher", "source_tier", "accessed_at"], properties: {
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
const researchResult = await geminiResearch({ schema: researchSchema, prompt: `${system}\nResearch the brief using web search and URL context. Prefer primary institutions, museums, archives, universities and academic sources. Use only URLs you actually accessed. Give a precise page/section locator for every evidence item. Do not score your own work.\nREQUEST:${JSON.stringify(request)}\nBRIEF:${JSON.stringify(intake)}` });
const research = researchResult.value;
logStep(run, "gemini", researchResult.model, "grounded_research", { request, intake }, research, started);
await writeJson(path.join(runDir, "02-research.json"), research); await saveRun();

started = isoNow();
const auditResult = await claudeJson({ system, prompt: `Independently audit this research. Verify source quality, URL traceability, independence, claim scope, locators and contradictions. Agreement with Gemini is not evidence. Return JSON: {decision: AUTO_APPROVE|AUTO_REVISE|BLOCKED|NEEDS_USER_INPUT|DO_NOT_PUBLISH, reason_code: null or one allowed escalation code, confidence_score: 0..1, verification_state, findings: string[], sources:[same sources with source_tier], claims:[same claims with verification_state and confidence_score], contradictions:[], user_question:null|string, recommended_default:string}. AUTO_APPROVE only when every material claim is verified and >=0.85 with sufficient independent evidence.\nBRIEF:${JSON.stringify(intake)}\nRESEARCH:${JSON.stringify(research)}` });
const audit = auditResult.value;
logStep(run, "anthropic", auditResult.model, "evidence_audit", research, audit, started);
await writeJson(path.join(runDir, "03-audit.json"), audit); await saveRun();

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
const sources = (audit.sources || research.sources).map((source) => {
  const normalized = source.url.replace(/#.*$/, "");
  const item = { ...source, id: stableId("src", normalized), url: normalized, accessed_at: source.accessed_at || dateNow() };
  sourceByUrl.set(source.url, item); sourceByUrl.set(normalized, item); return item;
});
const claims = (audit.claims || research.claims).map((claim) => ({ ...claim, id: stableId("clm", claim.wording_ru), verification_state: claim.verification_state || "verified", confidence_score: Number(claim.confidence_score) }));
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
  properties: { title: { type: "string" }, slug: { type: "string" }, summary: { type: "string" }, body_markdown: { type: "string" }, claim_ids_used: { type: "array", items: { type: "string" } } }
};
started = isoNow();
const ruDraftResult = await openaiJson({ system, schema: draftSchema, schemaName: "vansmithlab_ru_draft", prompt: `Write the Russian master ${request.content_type}. Use only the supplied claim IDs and facts. Use Markdown headings beginning at ##. Add citation markers like [^claim_id] after factual sentences; do not invent facts or bibliography. Voice: ${intake.voice}. ${request.content_type === "analysis" ? `Signed author: ${request.author || "VANSMITHLAB — author pending"}; clearly label interpretation.` : "Institutional neutral voice."}\nKNOWLEDGE:${JSON.stringify(knowledge)}` });
const ruDraft = ruDraftResult.value;
logStep(run, "openai", ruDraftResult.model, "russian_draft", knowledge, ruDraft, started);
await writeJson(path.join(runDir, "04-ru-draft.json"), ruDraft); await saveRun();

started = isoNow();
const ruReviewResult = await claudeJson({ system, prompt: `Review the Russian draft sentence by sentence against the knowledge ledger. Return JSON {decision, corrected_body_markdown, factual_claim_ids, findings}. Use AUTO_APPROVE only if every factual sentence is supported and citations are correctly scoped; otherwise AUTO_REVISE with corrected text or BLOCKED. Do not add facts.\nKNOWLEDGE:${JSON.stringify(knowledge)}\nDRAFT:${JSON.stringify(ruDraft)}` });
const ruReview = ruReviewResult.value;
logStep(run, "anthropic", ruReviewResult.model, "russian_fact_review", ruDraft, ruReview, started);
await writeJson(path.join(runDir, "05-ru-review.json"), ruReview); await saveRun();
if (!["AUTO_APPROVE", "AUTO_REVISE"].includes(ruReview.decision)) throw new Error(`Russian draft blocked: ${ruReview.decision}`);
const ruBody = (ruReview.corrected_body_markdown || ruDraft.body_markdown).trimEnd() + "\n";

started = isoNow();
const enDraftResult = await openaiJson({ system, schema: draftSchema, schemaName: "vansmithlab_en_adaptation", prompt: `Create an idiomatic English editorial adaptation of the approved Russian master. Preserve all claim IDs, citations, dates, names, numbers, uncertainty and structure. Add no facts and omit none.\nRUSSIAN:${ruBody}\nMETADATA:${JSON.stringify({ title: ruDraft.title, summary: ruDraft.summary, source_revision: 1 })}` });
const enDraft = enDraftResult.value;
logStep(run, "openai", enDraftResult.model, "english_adaptation", ruBody, enDraft, started);
await writeJson(path.join(runDir, "06-en-draft.json"), enDraft); await saveRun();

started = isoNow();
const enReviewResult = await claudeJson({ system, prompt: `Compare the English adaptation semantically with the Russian master. Return JSON {decision, semantic_validated:boolean, corrected_body_markdown, findings}. Preserve claim IDs, citations, dates, names, numbers and uncertainty. AUTO_APPROVE/AUTO_REVISE only if full parity is safe; otherwise NEEDS_USER_INPUT with reason UNRESOLVED_TRANSLATION.\nRUSSIAN:${ruBody}\nENGLISH:${JSON.stringify(enDraft)}` });
const enReview = enReviewResult.value;
logStep(run, "anthropic", enReviewResult.model, "english_semantic_review", enDraft, enReview, started);
await writeJson(path.join(runDir, "07-en-review.json"), enReview); await saveRun();
if (!enReview.semantic_validated || !["AUTO_APPROVE", "AUTO_REVISE"].includes(enReview.decision)) throw new Error("English localization blocked: UNRESOLVED_TRANSLATION");
const enBody = (enReview.corrected_body_markdown || enDraft.body_markdown).trimEnd() + "\n";

const contentId = stableId("cnt", `${objectId}:${request.content_type}`);
const typeDir = request.content_type === "research" || request.content_type === "case_study" || request.content_type === "visual_analysis" ? "articles" : request.content_type;
const common = { content_id: contentId, primary_object_id: objectId, content_type: request.content_type, state: "published", source_locale: "ru", source_revision: 1, verification_state: knowledge.verification_state, confidence_score: knowledge.confidence_score, claim_ids: claims.map((claim) => claim.id), source_ids: sources.map((source) => source.id), last_reviewed: dateNow(), author: request.content_type === "analysis" ? request.author || "VANSMITHLAB — author pending" : "VANSMITHLAB" };
const ruMeta = { ...common, locale: "ru", slug: slugify(ruDraft.slug || intake.slug_ru), title: ruDraft.title, summary: ruDraft.summary, body_hash: hash(ruBody) };
const enMeta = { ...common, locale: "en", slug: slugify(enDraft.slug || ruMeta.slug), title: enDraft.title, summary: enDraft.summary, body_hash: hash(enBody), translation: { source_locale: "ru", source_revision: 1, semantic_validated: true, review_run_id: run.id } };
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
