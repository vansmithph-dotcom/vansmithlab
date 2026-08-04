import { parseJsonOutput } from "./lib.mjs";

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
