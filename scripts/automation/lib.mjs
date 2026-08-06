import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const root = process.cwd();
export const isoNow = () => new Date().toISOString();
export const dateNow = () => isoNow().slice(0, 10);
export const hash = (value) => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
export const stableId = (prefix, value) => `${prefix}_${hash(value).slice(0, 16)}`;
export const slugify = (value) => value.toLowerCase().normalize("NFKC").replace(/[^a-zа-яё0-9]+/giu, "-").replace(/^-|-$/g, "");

export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeText(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, value.trimEnd() + "\n", "utf8");
}

export function parseJsonOutput(text, label) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(cleaned); } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${error.message}`);
  }
}

export async function loadOsContext(files) {
  const chunks = [];
  for (const file of files) chunks.push(`\n===== ${file} =====\n${await readFile(path.join(root, "VANSMITHLAB_OS", file), "utf8")}`);
  return chunks.join("\n");
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function makeRun(request) {
  const runId = `run_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}_${randomUUID().slice(0, 8)}`;
  return { id: runId, request_id: request.request_id, state: "running", decision: null, started_at: isoNow(), completed_at: null, steps: [] };
}

export function logStep(run, provider, model, step, input, output, startedAt) {
  run.steps.push({ provider, model, step, template_version: "1.0", input_hash: hash(input), output_hash: hash(output), started_at: startedAt, completed_at: isoNow() });
}

export async function postWeaveBrief(brief) {
  const url = process.env.WEAVE_MEDIA_WEBHOOK_URL;
  if (!url) return { delivered: false, reason: "WEAVE_MEDIA_WEBHOOK_URL is not configured" };
  const body = JSON.stringify(brief);
  const headers = { "content-type": "application/json" };
  if (process.env.WEAVE_MEDIA_WEBHOOK_SECRET) headers["x-vansmithlab-signature"] = createHmac("sha256", process.env.WEAVE_MEDIA_WEBHOOK_SECRET).update(body).digest("hex");
  const response = await fetch(url, { method: "POST", headers, body });
  if (!response.ok) throw new Error(`Figma Weave webhook failed: ${response.status} ${await response.text()}`);
  return { delivered: true, status: response.status };
}
