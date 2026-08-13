# AI Operating Model

## Roles

| System | Owns | Must not do |
| --- | --- | --- |
| ChatGPT | intake, project planning, briefs, schema-aware classification, metadata, relation candidates, localization routing, implementation planning | claim a fact without evidence or bypass a release gate |
| Claude | deep research, source audit, claim/fact ledger, editorial review, semantic translation validation and contradiction detection | invent citations, hide conflict or make undocumented policy |
| Gemini | visual/video briefs, generation and visual quality check | present generated media as documentary evidence |
| GitHub Actions + Cloudflare | workflow orchestration, schedules, retries, release handoffs and deployment | make editorial decisions or store provider secrets in source files |
| Figma Weave (formerly Weavy.ai) | node-based visual production from an approved media brief | own canonical knowledge, approve evidence, or publish an untracked asset |
| Cloudflare services | durable data, storage, queues, site delivery and monitoring hooks | make editorial decisions |

## Context builder

No AI begins from an empty prompt. The context builder supplies the OS documents selected in `00_START_HERE.md`, current object/revision, relevant claims/citations, brief, language, target channel and previous workflow result.

## Provider handoff order

The default text workflow is `ChatGPT intake/structure → Gemini grounded source discovery → Claude evidence/editorial audit → ChatGPT Russian draft → Claude Russian fact-ledger review → ChatGPT English adaptation → Claude semantic parity review`. A provider may be temporarily replaced, but the producing model may never approve its own factual output. Figma Weave enters only after the text release has an approved media brief.

When a user supplies a ChatGPT-authored draft, or ChatGPT creates the draft in the local workflow, it is always treated as **draft material**. The VANSMITHLAB editorial pass checks and rewrites the argument, opening, examples, language, citations, visuals, rights and RU/EN parity; it does not rubber-stamp the draft. The producing ChatGPT pass may not approve its own factual claims. For Analysis, the editor applies `20_ANALYSIS_EDITORIAL_STANDARD.md` v2.0 and may return the draft for a complete rewrite when it follows an encyclopedic “topic → history → facts → sources → conclusion” pattern.

ChatGPT's Analysis handoff must include a media reference record for every planned photograph, frame, screenshot, archive item, diagram or illustration: source-page URL, optional asset URL, creator/context, placement, supported example/claim, why it matters, suggested alt/caption and rights status. This is a research shortcut for the editor, not an approval of the asset. **The VANSMITHLAB editor has final editorial authority:** they choose the final image, crop, diagram or replacement, decide whether the visual genuinely supports the text, and may hold or remove an asset. The editor verifies every link and rights basis before publication. User escalation is required only for the documented external-risk cases; routine visual selection belongs to the editor.

## Local subscription mode

When API credentials are intentionally unavailable, the approved local workflow is `Codex intake/structure → Claude research → Codex evidence audit → Claude Russian draft → Codex Russian fact-ledger review → Claude English adaptation → Codex semantic parity review`. Both CLIs use their own first-party interactive subscription authentication on the project owner's always-on computer. Browser cookies or OAuth credentials must never be copied between products, committed, exported to GitHub Actions, or used by an unofficial router.

Gemini and Figma Weave are optional enrichments in this mode, not release authorities. Until each product exposes an officially supported unattended interface for the owner's account, their work is represented by a durable handoff packet and may require an explicit browser session. Their unavailability must not be disguised as a completed check.

## Reproducibility

Each AI step records provider, model, template version, input hash, output hash, timestamp, cost/usage where available and resulting decision. Provider models may change; the role contract does not.

## Cross-checks

For material facts, the source/audit path should use at least two independent methods or agents where practical. Agreement between models does not count as independent evidence; sources do.

## Autonomous editorial outcomes

- `AUTO_APPROVE`: every policy gate passes.
- `AUTO_REVISE`: a safe, mechanical or non-material correction is applied and revalidated.
- `BLOCKED`: a retry, source refresh or cross-check is required.
- `NEEDS_USER_INPUT`: a limited escalation reason exists.
- `DO_NOT_PUBLISH`: violates evidence, rights or editorial policy.

## Mandatory AUTO_REVISE loop

`AUTO_REVISE` is a durable workflow state, not a suggestion hidden inside a `BLOCKED` report. When an independent verifier identifies only safe claim-level repairs defined in `05_EVIDENCE_POLICY.md`, the orchestrator must:

1. persist the original research and audit;
2. create a revision plan with one action per affected claim;
3. apply only `OMIT`, `NARROW`, `ATTRIBUTE`, `SPLIT`, `REPLACE_SOURCE` or `HOLD_CLAIM`;
4. preserve unsupported and conflicting material in the private ledger rather than deleting its history;
5. run a new independent evidence audit on the revised release claim set;
6. continue only after `AUTO_APPROVE`, or stop after the bounded revision limit.

The verifier must return `AUTO_REVISE`, not `BLOCKED`, when every release-critical defect has a deterministic safe repair and the reader promise remains intact. The producing agent may apply the revision, but it may not approve the revised result.

Default bounded limit: two automatic evidence-revision rounds per workflow run. Reaching the limit produces `BLOCKED` with a diagnostic record; it does not lower the evidence threshold.
