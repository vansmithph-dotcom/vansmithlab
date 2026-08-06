# ADR-003 — Claim-level AUTO_REVISE before blocking

Status: accepted

## Context

The first VANSMITHLAB article trials showed that an evidence auditor could identify safe mechanical corrections yet classify the whole research package as `BLOCKED`. Examples included omitting a disputed non-material birth year, narrowing a museum claim to its direct wording, correcting an exhibition relationship and replacing a secondary legal citation with EUR-Lex. None required a new editorial thesis or a lower evidence threshold.

Treating every research conflict as a publication-wide block prevents useful verified claims from reaching drafting and incorrectly turns routine evidence hygiene into user intervention.

## Decision

Evidence decisions operate on the proposed release claim set. Unsupported or conflicting research may remain in the private ledger while a non-material claim is omitted, narrowed, attributed, split, source-replaced or held. When all defects have such safe repairs, the workflow outcome is `AUTO_REVISE` followed by a fresh independent audit.

The maximum is two automatic evidence-revision rounds per workflow run. The producer cannot approve its own revision. Publication still requires every retained material claim to be verified at or above the normal threshold.

## Blocking rule

The workflow becomes `BLOCKED` only when a claim necessary to fulfil the reader promise still lacks adequate evidence after the bounded repair loop. `EVIDENCE_CONFLICT` reaches the user only when credible material assertions remain irreconcilable and omission, narrowing, attribution or neutral presentation would materially damage the publication.

## State rule

Technical exit status and editorial state are separate fields. A safely blocked editorial run is not stored merely as `failed`. Diagnostics must identify blocking claim IDs, held claims, attempted revision actions and the exact retry condition.

## Consequences

- Fewer false publication-wide blocks.
- No reduction in evidence standards.
- Complete preservation of disputed research history.
- Clearer automation behavior and fewer unnecessary user questions.
- Implementation must add a bounded revision loop and state-preserving process contract before unattended publication is enabled.
