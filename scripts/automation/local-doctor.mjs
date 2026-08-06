import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { root } from "./lib.mjs";

const cli = (name) => process.platform === "win32" && ["claude", "codex"].includes(name) ? path.join(process.env.APPDATA || "", "npm", `${name}.cmd`) : name;
const run = (command, args) => new Promise((resolve) => {
  const child = spawn(command, args, { cwd: root, windowsHide: true, shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; }); child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("error", (error) => resolve({ ok: false, output: error.message }));
  child.on("close", (code) => resolve({ ok: code === 0, output: output.trim() }));
});

const checks = [];
for (const [name, args] of [["claude", ["--version"]], ["codex", ["--version"]], ["git", ["--version"]], ["node", ["--version"]]]) {
  const result = await run(cli(name), args); checks.push({ check: name, ok: result.ok, detail: result.output.split(/\r?\n/)[0] || "not found" });
}
for (const [name, args] of [["codex-auth", ["login", "status"]], ["claude-auth", ["auth", "status"]]]) {
  const result = await run(cli(name.startsWith("codex") ? "codex" : "claude"), args); checks.push({ check: name, ok: result.ok, detail: result.output || "not authenticated" });
}
for (const file of ["VANSMITHLAB_OS/00_START_HERE.md", "schemas/content-request.schema.json", "scripts/automation/run.mjs"]) {
  try { await access(path.join(root, file)); checks.push({ check: file, ok: true, detail: "present" }); }
  catch { checks.push({ check: file, ok: false, detail: "missing" }); }
}
for (const item of checks) console.log(`${item.ok ? "OK" : "FAIL"}  ${item.check}: ${item.detail}`);
if (checks.some((item) => !item.ok)) process.exitCode = 1;
