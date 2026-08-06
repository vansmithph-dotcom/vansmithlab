import { spawn } from "node:child_process";
import { mkdir, open, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { isoNow, readJson, root, writeJson } from "./lib.mjs";

const retry = process.argv.includes("--retry");
const requestArg = process.argv.indexOf("--request");
const requestedFile = requestArg >= 0 ? path.normalize(process.argv[requestArg + 1] || "") : null;
const requestIdArg = process.argv.indexOf("--request-id");
const requestedId = requestIdArg >= 0 ? process.argv[requestIdArg + 1] || null : null;
const resumeIntakeArg = process.argv.indexOf("--resume-intake");
const resumeIntakeFile = resumeIntakeArg >= 0 ? process.argv[resumeIntakeArg + 1] || null : null;
const resumeResearchArg = process.argv.indexOf("--resume-research");
const resumeResearchFile = resumeResearchArg >= 0 ? process.argv[resumeResearchArg + 1] || null : null;
const resumeRawResearchArg = process.argv.indexOf("--resume-raw-research");
const resumeRawResearchFile = resumeRawResearchArg >= 0 ? process.argv[resumeRawResearchArg + 1] || null : null;
const resumeAuditArg = process.argv.indexOf("--resume-audit");
const resumeAuditFile = resumeAuditArg >= 0 ? process.argv[resumeAuditArg + 1] || null : null;
const resumeRuDraftArg = process.argv.indexOf("--resume-ru-draft");
const resumeRuDraftFile = resumeRuDraftArg >= 0 ? process.argv[resumeRuDraftArg + 1] || null : null;
const resumeRuReviewArg = process.argv.indexOf("--resume-ru-review");
const resumeRuReviewFile = resumeRuReviewArg >= 0 ? process.argv[resumeRuReviewArg + 1] || null : null;
const resumeEnDraftArg = process.argv.indexOf("--resume-en-draft");
const resumeEnDraftFile = resumeEnDraftArg >= 0 ? process.argv[resumeEnDraftArg + 1] || null : null;
const resumeEnReviewArg = process.argv.indexOf("--resume-en-review");
const resumeEnReviewFile = resumeEnReviewArg >= 0 ? process.argv[resumeEnReviewArg + 1] || null : null;
const runtimeDir = path.join(root, "automation", ".runtime");
const lockFile = path.join(runtimeDir, "orchestrator.lock");
const stateDir = path.join(root, "automation", "state");
await mkdir(runtimeDir, { recursive: true }); await mkdir(stateDir, { recursive: true });
let lock;
try { lock = await open(lockFile, "wx"); await lock.writeFile(JSON.stringify({ pid: process.pid, started_at: isoNow() })); }
catch (error) {
  if (error.code !== "EEXIST") throw error;
  let active = true;
  try {
    const existing = JSON.parse(await readFile(lockFile, "utf8"));
    process.kill(existing.pid, 0);
  } catch { active = false; }
  if (active) throw new Error("Another VANSMITHLAB local orchestrator is already running.");
  await rm(lockFile, { force: true });
  lock = await open(lockFile, "wx"); await lock.writeFile(JSON.stringify({ pid: process.pid, started_at: isoNow(), recovered_stale_lock: true }));
}

const runChild = (requestFile) => new Promise((resolve, reject) => {
  const args = [path.join(root, "scripts", "automation", "run.mjs"), "--request", requestFile];
  if (resumeIntakeFile) args.push("--resume-intake", resumeIntakeFile);
  if (resumeResearchFile) args.push("--resume-research", resumeResearchFile);
  if (resumeRawResearchFile) args.push("--resume-raw-research", resumeRawResearchFile);
  if (resumeAuditFile) args.push("--resume-audit", resumeAuditFile);
  if (resumeRuDraftFile) args.push("--resume-ru-draft", resumeRuDraftFile);
  if (resumeRuReviewFile) args.push("--resume-ru-review", resumeRuReviewFile);
  if (resumeEnDraftFile) args.push("--resume-en-draft", resumeEnDraftFile);
  if (resumeEnReviewFile) args.push("--resume-en-review", resumeEnReviewFile);
  const child = spawn(process.execPath, args, { cwd: root, windowsHide: true, stdio: ["inherit", "pipe", "pipe"], env: { ...process.env, CONTENT_PROVIDER_MODE: "local" } });
  let stdout = ""; let stderr = "";
  child.stdout.on("data", (chunk) => { const value = chunk.toString(); stdout += value; process.stdout.write(value); });
  child.stderr.on("data", (chunk) => { const value = chunk.toString(); stderr += value; process.stderr.write(value); });
  child.on("error", reject); child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`Content pipeline exited ${code}: ${(stderr || stdout).slice(-4000)}`)));
});

try {
  const names = (await readdir(path.join(root, "automation", "requests"))).filter((name) => name.endsWith(".json")).sort();
  let selected;
  for (const name of names) {
    const relative = path.join("automation", "requests", name); const request = await readJson(path.join(root, relative));
    if (requestedFile && path.normalize(relative) !== requestedFile) continue;
    if (requestedId && request.request_id !== requestedId) continue;
    const stateFile = path.join(stateDir, `${request.request_id}.json`); let state;
    try { state = JSON.parse(await readFile(stateFile, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (!state || retry && ["blocked", "failed", "running"].includes(state.state)) { selected = { request, relative, stateFile }; break; }
  }
  if (!selected) console.log("Queue is empty: no unprocessed content requests.");
  else {
    await writeJson(selected.stateFile, { request_id: selected.request.request_id, request_file: selected.relative, state: "running", started_at: isoNow() });
    try {
      await runChild(selected.relative);
      await writeJson(selected.stateFile, { request_id: selected.request.request_id, request_file: selected.relative, state: "ready_for_publish", completed_at: isoNow(), next_action: "npm run local:publish" });
      console.log(`Request ${selected.request.request_id} passed AI gates and is ready for deterministic publication checks.`);
    } catch (error) {
      const match = error.message.match(/Publication stopped safely:\s*(AUTO_REVISE|BLOCKED|NEEDS_USER_INPUT|DO_NOT_PUBLISH)(?:\s*\(([^)]+)\))?/i);
      const editorialState = match?.[1]?.toLowerCase();
      await writeJson(selected.stateFile, { request_id: selected.request.request_id, request_file: selected.relative, state: editorialState || "failed", decision: match?.[1] || null, reason_code: match?.[2] || null, completed_at: isoNow(), technical_exit: error.message }); throw error;
    }
  }
} finally { await lock?.close(); await rm(lockFile, { force: true }); }
