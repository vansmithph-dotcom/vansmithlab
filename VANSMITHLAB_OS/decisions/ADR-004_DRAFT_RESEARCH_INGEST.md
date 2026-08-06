# ADR-004 — Ingesting author-supplied research briefs as draft publications

Status: accepted (scoped)

## Context

Ivan supplied ten author-written research briefs (`История модного дома …`, one signed Analysis on religion and fashion) directly as source files, produced outside the automated GitHub Actions pipeline (ADR-001) and never run through `research → evidence → russian_fact_review`. Each brief self-declares `partially_verified` / `drafted → evidence review` and includes its own claim registry, source list and media plan. The existing schema only allowed `verification_state: "verified" | "multi_source_verified"` and `hero_image.origin: "ai_illustration" | "licensed" | "public_domain"`, neither of which honestly describes this material.

## Decision

1. Extend `verification_state` with `"partially_verified"`. Content in this state may publish, but must carry that exact label — the TrustPanel/source rail render the string as-is, so the reader sees "partially verified", not "verified".
2. Extend `hero_image.origin` with `"editorial_diagram"` for original, non-photographic VANSMITHLAB diagrams (timelines, schematics) built when no licensed photography or AI-illustration pipeline is available for a given piece.
3. Knowledge objects converted this way carry `workflow.decision: "MANUAL_CONVERSION_PENDING_FULL_PIPELINE"` instead of `AUTO_APPROVE`, and only the claims the author's brief marked `verified`/`verified interpretation`/`editorial caution`/`synthesis` are carried into the public claim/citation set; `attributed`/medium-confidence atomic claims (e.g. exact date of an object's design, a patent attribution) are held back, matching the existing editorial-caution pattern on the live Prada encyclopedia entry.

## Why

Per `00_START_HERE.md`, an agent may not silently invent a format or overstate a verification result. Labelling author drafts as `verified` would misrepresent that the GitHub Actions evidence pipeline ran; leaving the fields unfilled or blocking publication entirely was rejected by the product owner (see conversation record) in favour of transparent partial-verification labelling.

## Follow-up (not blocking this ingestion)

- Run the full automated pipeline on these objects when capacity allows, to move eligible ones to `verified`.
- Chanel's 1939–1945 section needs the historian/legal review the source draft itself requests before its confidence score should be treated as final.
- Real photography for any of these pieces requires a rights-clearance pass per `08_MEDIA_AND_RIGHTS.md`; none has been performed. Only original `editorial_diagram` art ships in this round.
