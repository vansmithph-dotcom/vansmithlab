# VANSMITHLAB content automation

This directory implements the first safe publishing loop:

`idea → ChatGPT brief → Gemini grounded research → Claude evidence audit → ChatGPT Russian draft → Claude fact-ledger review → ChatGPT English adaptation → Claude parity review → deterministic validation → Git release`.

The workflow never publishes merely because several models agree. Claims must point to traceable sources, pass the evidence threshold, and survive deterministic release checks.

## Start an article locally

```powershell
npm.cmd run content:request -- --topic "Баухаус и развитие современной типографики" --type research
npm.cmd run content:run -- --request automation/requests/<generated-file>.json
```

## Recommended local mode (no API keys)

The Windows workstation uses the official subscription-authenticated Claude Code and Codex CLIs. Gemini and Figma Weave are optional handoffs until they provide a supported unattended interface for the owner's account.

```powershell
npm.cmd run local:doctor
npm.cmd run content:request -- --topic "Bauhaus and modern typography" --type research --media true
npm.cmd run local:run
npm.cmd run local:publish
```

The local role separation is `Codex intake → Claude research → Codex evidence audit → Claude Russian master → Codex fact review → Claude English adaptation → Codex parity review → deterministic validation`.

Queue state is stored under `automation/state/`. Runtime locks and detailed model outputs remain local under ignored directories. A failed or uncertain run leaves the existing public site unchanged. Use `npm.cmd run local:retry` only after the recorded failure or review request has been resolved.

Evidence audit is claim-level. Safe omissions, narrowing, attribution, splitting, primary-source replacement and holding a non-material claim produce `AUTO_REVISE` followed by a new independent audit. A whole article is blocked only when a material claim required by the reader promise remains unresolved after the bounded revision loop. The implemented runner must match `VANSMITHLAB_OS/decisions/ADR-003_CLAIM_LEVEL_AUTO_REVISE.md` before unattended publication is enabled.

Do not export browser cookies, Claude/Codex subscription tokens or OAuth sessions to GitHub. Do not connect either subscription through an unofficial provider router.

## Optional API mode

The original API pipeline remains available when all provider keys are intentionally configured. Without those keys, direct `content:run` in its default `api` mode stops before external calls. GitHub Actions is manual-only in this configuration.

## GitHub setup

Repository → Settings → Secrets and variables → Actions → New repository secret:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- optionally `WEAVE_MEDIA_WEBHOOK_URL` and `WEAVE_MEDIA_WEBHOOK_SECRET`

The API workflow can be started manually from Actions → VANSMITHLAB Content Automation. A time schedule remains disabled until provider budgets and the desired publishing cadence are confirmed.

## Outputs

- `knowledge/objects/{object_id}.json`: claims, evidence and audit result.
- `content/{locale}/{type}/{slug}.md`: approved body.
- `content/{locale}/{type}/{slug}.json`: release metadata and lineage.
- `automation/media-briefs/{content_id}.json`: approved Weave/Gemini handoff.
- `automation/review-requests/`: generated only for one of the six allowed escalation codes; ignored by Git by default because it can contain private research context.

Only an `AUTO_APPROVE` result writes publishable files. The workflow commits those files to `main`; the existing Cloudflare integration then builds the site.
