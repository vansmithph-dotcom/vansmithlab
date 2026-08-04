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
| `EDITORIAL_CHOICE` | Several valid analytical frames need an authorial choice. | Publish neutral knowledge only; defer the essay. |
| `HIGH_IMPACT_CORRECTION` | Correction materially changes a released position. | Roll back/hide affected claim and prepare correction. |
| `UNRESOLVED_TRANSLATION` | Meaning cannot safely carry to a locale. | Keep Russian master live; hold locale. |

Every request shows object ID, plain-language question, evidence summary, safe options, recommended default, urgency and impact. It never asks the user to decide routine formatting, retry, classification or translation issues already specified by OS.

## Automatic monitoring triggers

- source URL unavailable or content hash changes;
- a stronger source appears;
- rights record approaches expiry;
- a translation becomes stale;
- an internal/external link breaks;
- search projection fails;
- a social post cannot be reconciled to its source release.
