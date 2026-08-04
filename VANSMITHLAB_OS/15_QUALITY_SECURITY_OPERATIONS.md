# Quality, Security and Operations

## Quality gates

| Gate | Checks |
| --- | --- |
| Data | schema, IDs, states, citations, source revision, relation integrity |
| Editorial | factual claim coverage, uncertainty, distinction of analysis/opinion |
| Localization | source-revision alignment, semantic parity, locale route/metadata |
| Media | provenance, rights, credit, disclosure, alt text, caption/transcript |
| UX/accessibility | keyboard use, focus, headings, contrast, mobile, reduced motion |
| Technical | tests, link integrity, build, performance budget, structured data |
| Release | immutable release record, rollback target, monitoring subscription |

## Security baseline

- Least-privilege service credentials, environment segregation and secret rotation.
- Validate webhook signatures and enforce allowlists for automation ingress.
- Rate-limit public APIs and agent triggers; use idempotency keys.
- Sanitize Markdown/HTML and validate all external URLs and uploaded media.
- Keep audit logs for material mutations; restrict write paths to workflow identities.
- Back up D1, R2 and Git; regularly test restoration instead of assuming backups work.

## Reliability and cost

- Use queues, backoff and checkpoints; never long synchronous chains for AI production.
- Track provider failures, latency, token/media cost, queue age and release failures.
- Set monthly/provider budgets and automatic safe pause thresholds.
- Preserve the last valid public projection through build or provider outage.

## Definition of done

A feature is done only when its OS rule, schema impact, tests, access states, localization, monitoring and rollback path are complete. A visually complete screen without these conditions is a prototype, not a finished feature.
