import { parseJsonOutput } from "./lib.mjs";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const localMode = () => (process.env.CONTENT_PROVIDER_MODE || "api").toLowerCase() === "local";

function schemaIssues(value, schema, pointer = "$") {
  if (!schema) return [];
  const issues = [];
  const kind = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  const typeMatches = schema.type === "integer"
    ? kind === "number" && Number.isInteger(value)
    : schema.type === "number"
      ? kind === "number" && Number.isFinite(value)
      : !schema.type || kind === schema.type;
  if (!typeMatches) return [`${pointer}: expected ${schema.type}, received ${kind}`];
  if (schema.enum && !schema.enum.includes(value)) issues.push(`${pointer}: value is outside enum`);
  if (schema.type === "string" && Number.isInteger(schema.minLength) && value.trim().length < schema.minLength) {
    issues.push(`${pointer}: string is shorter than minLength ${schema.minLength}`);
  }
  if (schema.type === "object") {
    for (const key of schema.required || []) if (!(key in value)) issues.push(`${pointer}.${key}: missing required property`);
    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (key in value) issues.push(...schemaIssues(value[key], childSchema, `${pointer}.${key}`));
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) if (!allowed.has(key)) issues.push(`${pointer}.${key}: unexpected property`);
    }
  }
  if (schema.type === "array") for (let index = 0; index < value.length; index += 1) {
    issues.push(...schemaIssues(value[index], schema.items, `${pointer}[${index}]`));
  }
  if (schema.type === "array" && Number.isInteger(schema.minItems) && value.length < schema.minItems) {
    issues.push(`${pointer}: array has fewer than ${schema.minItems} item(s)`);
  }
  return issues;
}

// `codex exec --output-schema` uses the Responses API strict-schema contract:
// every object must explicitly reject additional properties and every declared
// property must be required. Some interchange schemas are intentionally loose
// because research relations and contradiction records can carry provider-
// specific diagnostic fields. Those schemas are still validated locally, but
// must not be passed to `--output-schema` or Codex rejects the request before it
// can perform the lossless normalization pass.
function isCodexStrictSchema(schema) {
  if (!schema || typeof schema !== "object") return true;
  if (schema.type === "object") {
    if (schema.additionalProperties !== false) return false;
    const propertyNames = Object.keys(schema.properties || {});
    const required = new Set(schema.required || []);
    if (propertyNames.some((name) => !required.has(name))) return false;
    return propertyNames.every((name) => isCodexStrictSchema(schema.properties[name]));
  }
  if (schema.type === "array") return isCodexStrictSchema(schema.items);
  return true;
}

function commandPath(name) {
  if (process.platform !== "win32") return name;
  if (name === "claude") return path.join(process.env.APPDATA || "", "npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
  return path.join(process.env.APPDATA || "", "npm", `${name}.cmd`);
}

function execute(command, args, { input, cwd = process.cwd(), timeout = 900_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true, shell: process.platform === "win32" && command.toLowerCase().endsWith(".cmd"), stdio: ["pipe", "pipe", "pipe"], env: process.env });
    let stdout = ""; let stderr = ""; let finished = false;
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${path.basename(command)} timed out after ${timeout}ms`)); }, timeout);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); if (!finished) reject(error); });
    child.on("close", (code) => {
      finished = true; clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${path.basename(command)} exited ${code}: ${(stderr || stdout).slice(-3000)}`));
    });
    child.stdin.end(input || "");
  });
}

async function claudeLocalJson({ system, prompt, schema }) {
  const fullPrompt = `${system}\n\n${prompt}\n\nReturn one valid JSON value only. Use double-quoted keys and strings. Do not use Markdown fences or commentary.`;
  const args = ["-p", "-", "--output-format", "json", "--permission-mode", "auto", "--tools", "WebSearch,WebFetch", "--allowedTools", "WebSearch,WebFetch"];
  if (schema) args.push("--json-schema", JSON.stringify(schema));
  const { stdout } = await execute(commandPath("claude"), args, { input: fullPrompt });
  const envelope = JSON.parse(stdout);
  if (envelope.is_error) throw new Error(`Claude CLI error: ${envelope.result || "unknown error"}`);
  const model = Object.keys(envelope.modelUsage || {}).join(",") || "claude-subscription";
  try { return { model, value: envelope.structured_output ?? parseJsonOutput(envelope.result, "Claude CLI") }; }
  catch (firstError) {
    const repairPrompt = `Convert the following agent response into one valid JSON object matching this schema. Do not add facts, sources, URLs or claims. If the response reports inability to complete the task, use empty arrays where permitted so the independent audit can block it safely. Return JSON only.\nSCHEMA:${JSON.stringify(schema || {})}\nRESPONSE:${envelope.result}`;
    // Claude CLI treats an empty value after --tools as a missing argument on
    // Windows (`claude.cmd`). The repair pass needs no web access, so expose
    // only the read-only Read tool instead of trying to pass an empty list.
    const repairArgs = ["-p", "-", "--output-format", "json", "--permission-mode", "auto", "--tools", "Read", "--allowedTools", "Read"];
    if (schema) repairArgs.push("--json-schema", JSON.stringify(schema));
    const repaired = await execute(commandPath("claude"), repairArgs, { input: repairPrompt });
    const repairEnvelope = JSON.parse(repaired.stdout);
    if (repairEnvelope.is_error) throw firstError;
    return { model, value: repairEnvelope.structured_output ?? parseJsonOutput(repairEnvelope.result, "Claude CLI repair") };
  }
}

async function codexLocalJson({ system, prompt, schema }) {
  const temp = await mkdtemp(path.join(os.tmpdir(), "vansmithlab-codex-"));
  const outputFile = path.join(temp, "output.json");
  const schemaFile = path.join(temp, "schema.json");
  const useOutputSchema = Boolean(schema && isCodexStrictSchema(schema));
  if (useOutputSchema) await writeFile(schemaFile, JSON.stringify(schema), "utf8");
  try {
    const outputInstruction = useOutputSchema
      ? "Return only the JSON object required by the supplied output schema."
      : "Return exactly one valid JSON object and no Markdown or commentary.";
    const fullPrompt = `${system}\n\n${prompt}\n\n${outputInstruction} Do not modify any files.`;
    const args = ["exec", "-", "--ephemeral", "--sandbox", "read-only"];
    if (useOutputSchema) args.push("--output-schema", schemaFile);
    args.push("--output-last-message", outputFile, "--color", "never");
    await execute(commandPath("codex"), args, { input: fullPrompt });
    return { model: process.env.CODEX_MODEL || "codex-subscription", value: parseJsonOutput(await readFile(outputFile, "utf8"), "Codex CLI") };
  } finally { await rm(temp, { recursive: true, force: true }); }
}

export async function agentJson({ agent, system, prompt, schema, schemaName }) {
  if (localMode()) {
    if (agent === "claude") {
      const primary = await claudeLocalJson({ system, prompt, schema });
      const primaryIssues = schemaIssues(primary.value, schema);
      if (!primaryIssues.length) return primary;

      // Claude occasionally returns a useful but workflow-shaped JSON object
      // instead of the requested interchange schema. Codex performs a purely
      // mechanical schema normalization; the next independent audit still
      // decides whether any claim is publishable.
      const diagnosticDir = path.join(process.cwd(), "automation", ".runtime");
      await mkdir(diagnosticDir, { recursive: true });
      const diagnosticStamp = new Date().toISOString().replace(/[:.]/g, "-");
      await writeFile(path.join(diagnosticDir, `claude-schema-input-${diagnosticStamp}.json`), JSON.stringify({ issues: primaryIssues, value: primary.value }, null, 2), "utf8");
      const normalized = await codexLocalJson({
        system: "You are a lossless JSON schema normalizer. Do not add, infer, verify, reject or rewrite facts, sources, URLs, locators or claims.",
        prompt: `Reshape the supplied JSON into the required output schema. Preserve all compatible information. Omit fields that the schema cannot represent. If a required array has no compatible data, return an empty array.\nSCHEMA_ERRORS:${JSON.stringify(primaryIssues)}\nDATA:${JSON.stringify(primary.value)}`,
        schema
      });
      const normalizedIssues = schemaIssues(normalized.value, schema);
      if (normalizedIssues.length) throw new Error(`Local schema normalization failed: ${normalizedIssues.slice(0, 12).join("; ")}`);
      return { model: `${primary.model}+${normalized.model}:schema-normalizer`, value: normalized.value };
    }
    if (agent === "codex") return codexLocalJson({ system, prompt, schema });
    throw new Error(`Unsupported local agent: ${agent}`);
  }
  if (agent === "claude") return claudeJson({ system, prompt });
  if (agent === "gemini") return geminiResearch({ prompt, schema });
  return openaiJson({ system, prompt, schema, schemaName });
}

async function checkedFetch(url, options, provider) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(180_000) });
  if (!response.ok) throw new Error(`${provider} API ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  return response.json();
}

export async function openaiJson({ system, prompt, schema, schemaName }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const data = await checkedFetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model, store: false, instructions: system, input: prompt, text: { format: { type: "json_schema", name: schemaName, strict: true, schema } } })
  }, "OpenAI");
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI response contained no output_text");
  return { model, value: parseJsonOutput(text, "OpenAI") };
}

export async function geminiResearch({ prompt, schema }) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
  const model = process.env.GEMINI_MODEL || "gemini-3.1-pro-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const data = await checkedFetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], tools: [{ googleSearch: {} }, { urlContext: {} }], generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema } })
  }, "Gemini");
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!text) throw new Error("Gemini response contained no text");
  return { model, value: parseJsonOutput(text, "Gemini") };
}

export async function claudeJson({ system, prompt }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const data = await checkedFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 12000, system: `${system}\nReturn only valid JSON without Markdown fences.`, messages: [{ role: "user", content: prompt }] })
  }, "Anthropic");
  const text = data.content?.filter((item) => item.type === "text").map((item) => item.text).join("");
  if (!text) throw new Error("Claude response contained no text");
  return { model, value: parseJsonOutput(text, "Claude") };
}
