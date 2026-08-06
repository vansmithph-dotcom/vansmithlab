# Evidence, Verification and Corrections Policy

## Source order

1. Official organizations and primary documents
2. Museums, archives, universities, academic publications
3. Patents, standards, catalogues and direct interviews
4. Professional industry publications
5. Established media
6. Community research and personal sites
7. Anonymous claims, leaks and rumours

The lower levels can provide leads but cannot independently establish a material fact.

## Verification states

- `multi_source_verified` — independent, strong corroboration.
- `verified` — adequate traceable evidence, no stronger contradiction known.
- `partially_verified` — evidence supports only part of the wording or scope.
- `unverified` — retained in research, not stated as fact.
- `rumor` — explicitly labelled and only allowed in a narrowly suitable format.
- `retracted` — disproved or formally corrected; remains visible in history.

## Autonomous publication threshold

An ordinary factual publication can proceed automatically only if all material claims are verified/multi-source verified, score at least `0.85`, have sufficient independent evidence, have no active high-grade conflict, and all media rights/language/technical checks pass.

The system must not optimize this threshold downward to increase output volume.

## Claim-level repair before workflow blocking

The publication threshold applies to claims that remain in the proposed release, not to every lead, discarded formulation or non-material detail discovered during research. Before blocking an entire object, the verifier must classify every failing claim and attempt the safest documented repair:

1. `OMIT` — remove a non-material disputed detail that is unnecessary to the reader promise.
2. `NARROW` — reduce wording to the scope directly supported by the cited source.
3. `ATTRIBUTE` — identify an institutional, scholarly or participant interpretation instead of presenting it as universal fact.
4. `SPLIT` — separate a compound claim so supported and unsupported parts do not share one verification state.
5. `REPLACE_SOURCE` — replace a secondary citation with an available primary source without changing the factual meaning.
6. `HOLD_CLAIM` — retain the unresolved claim in the private research ledger but exclude it from the release.

These repairs produce `AUTO_REVISE` when they do not change the approved reader promise, introduce a new thesis, conceal material uncertainty or require unsupported inference. The revised claim set must be independently audited again. A workflow may proceed only if every claim retained for release then meets the normal threshold.

The existence of a conflict in the research ledger does not automatically make the whole publication an `EVIDENCE_CONFLICT`. A conflict blocks or escalates only when the disputed fact is material to the reader promise, cannot be safely omitted or neutrally attributed, and credible sources remain irreconcilable after source-quality review.

## Corrections

New contradictory evidence triggers re-verification of dependent claims, relations, timelines, articles, translations, graph data and social derivatives. The system either publishes a versioned correction, rolls back to the last valid release, or asks the user only when the high-impact-correction condition is met.
