# Automation, Exception Handling and User Escalation

## Autonomous loops

1. **Production loop:** idea → research → knowledge → content → translation → release.
2. **Integrity loop:** source monitoring → re-verification → correction/rebuild.
3. **Discovery loop:** approved release → search/graph/SEO projection → distribution package.
4. **Operational loop:** queues → retries → checkpoints → logs → alert only on actionable exception.

## Required workflow controls

- idempotency key for every externally visible action;
- retry with bounded exponential backoff for temporary provider/API failure;
- checkpoint after each durable step;
- dead-letter queue and diagnostic record after retry limit;
- content hash to prevent duplicate release;
- a stable prior public projection while a new build fails;
- spend/rate limits per provider and workflow.

## The only user escalations

| Code | Meaning | Default safe action |
| --- | --- | --- |
| `EVIDENCE_CONFLICT` | Strong sources conflict. | Hold factual release; present both positions only if context permits. |
| `MISSING_PRIMARY_EVIDENCE` | A material claim lacks sufficient evidence. | Keep draft/private; do not infer. |
| `RIGHTS_OR_BRAND_RISK` | Media rights, defamation, trademark or misrepresentation risk. | Remove/replace asset and hold release. |
| `EDITORIAL_CHOICE` | Several valid analytical frames need an authorial choice that the VANSMITHLAB editor cannot resolve from the brief and evidence. | Hold the analysis and ask the user for the missing authorial choice. Routine image selection, crop, replacement and final presentation belong to the VANSMITHLAB editor and are not escalated. |
| `HIGH_IMPACT_CORRECTION` | Correction materially changes a released position. | Roll back/hide affected claim and prepare correction. |
| `UNRESOLVED_TRANSLATION` | Meaning cannot safely carry to a locale. | Keep Russian master live; hold locale. |

## Escalation boundary for evidence conflict

`EVIDENCE_CONFLICT` is allowed only when all of the following are true:

- at least two credible sources make incompatible assertions;
- the disputed assertion is material to the content promise or conclusion;
- source-quality review does not resolve the difference;
- `OMIT`, `NARROW`, `ATTRIBUTE`, `SPLIT` or `HOLD_CLAIM` would materially break or mislead the proposed publication;
- a neutral representation of both positions is not already prescribed by the content format.

Do not escalate or block the whole workflow for a non-material biographical date, excess precision, an unsupported superlative, an incorrect relationship candidate or a compound sentence that can be safely repaired. Those conditions enter `AUTO_REVISE` and are revalidated automatically.

`MISSING_PRIMARY_EVIDENCE` applies to a material retained claim for which primary evidence is required by policy and cannot be obtained or substituted. It does not apply to a claim that can be removed without breaking the reader promise.

Every blocked result must distinguish:

- `release_claims`: claims intended for the next public revision;
- `held_claims`: unresolved claims kept privately and excluded from release;
- `revision_actions`: safe repairs attempted or still available;
- `blocking_claim_ids`: only claims that genuinely prevent the reader promise;
- `retry_condition`: the exact evidence or editorial change required before another run.

Every request shows object ID, plain-language question, evidence summary, safe options, recommended default, urgency and impact. It never asks the user to decide routine formatting, retry, classification or translation issues already specified by OS.

## Automatic monitoring triggers

- source URL unavailable or content hash changes;
- a stronger source appears;
- rights record approaches expiry;
- a translation becomes stale;
- an internal/external link breaks;
- search projection fails;
- a social post cannot be reconciled to its source release.
