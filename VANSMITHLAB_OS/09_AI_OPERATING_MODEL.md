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
