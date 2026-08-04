# VANSMITHLAB content automation

This directory implements the first safe publishing loop:

`idea → ChatGPT brief → Gemini grounded research → Claude evidence audit → ChatGPT Russian draft → Claude fact-ledger review → ChatGPT English adaptation → Claude parity review → deterministic validation → Git release`.

The workflow never publishes merely because several models agree. Claims must point to traceable sources, pass the evidence threshold, and survive deterministic release checks.

## Start an article locally

```powershell
npm.cmd run content:request -- --topic "Баухаус и развитие современной типографики" --type research
npm.cmd run content:run -- --request automation/requests/<generated-file>.json
```

Without provider keys, `content:run` stops before external calls and explains which secrets are missing. Use GitHub Actions for normal operation.

## GitHub setup

Repository → Settings → Secrets and variables → Actions → New repository secret:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- optionally `WEAVE_MEDIA_WEBHOOK_URL` and `WEAVE_MEDIA_WEBHOOK_SECRET`

Committing a new JSON file under `automation/requests/` starts the workflow automatically. It can also be started manually from Actions → VANSMITHLAB Content Automation. A time schedule is included but disabled until provider budgets and the desired publishing cadence are confirmed.

## Outputs

- `knowledge/objects/{object_id}.json`: claims, evidence and audit result.
- `content/{locale}/{type}/{slug}.md`: approved body.
- `content/{locale}/{type}/{slug}.json`: release metadata and lineage.
- `automation/media-briefs/{content_id}.json`: approved Weave/Gemini handoff.
- `automation/review-requests/`: generated only for one of the six allowed escalation codes; ignored by Git by default because it can contain private research context.

Only an `AUTO_APPROVE` result writes publishable files. The workflow commits those files to `main`; the existing Cloudflare integration then builds the site.
