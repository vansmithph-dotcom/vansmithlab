# ADR-002 — Local subscription orchestration

Status: accepted

## Context

The project owner has first-party ChatGPT/Codex and Claude subscriptions but does not want provider API keys. The Windows workstation is normally online. Gemini's current individual-account CLI path and Figma Weave's lack of a public automation API prevent them from being mandatory unattended stages.

## Decision

Run content production locally through the official Codex and Claude CLIs. Codex owns intake and independent verification; Claude owns research, Russian drafting and English adaptation. Deterministic repository validation remains the final authority. The local orchestrator writes checkpoints and never publishes a blocked result.

GitHub Actions remains the build and deployment boundary, not the subscription-AI runner. A generated release reaches GitHub only after local AI gates and deterministic tests pass. Cloudflare continues to deploy the last valid GitHub revision.

Gemini and Figma Weave receive optional handoff packets until officially supported unattended access is available. Browser automation must not bypass authentication controls or impersonate an API.

## Safety controls

- Use only `claude.cmd` and `codex.cmd` from the locally authenticated official installations.
- Give verification agents read-only repository access.
- Never place subscription tokens, browser profiles or session cookies in the repository.
- Record agent, model label, input hash, output hash and timestamps for each step.
- Keep each request idempotent and protected by a local lock.
- Require a separate publish command; scheduled publishing is enabled only after a supervised trial period.
- Preserve blocked work and diagnostics without changing the public site.

## Rollback

Disable the local scheduled task, remove the local runtime state, and continue using the last valid GitHub revision. The API workflow remains available as an explicitly selected alternative if provider keys are added later.
