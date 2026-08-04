# Playbook 04 — Russian Master to Localized Release

## Input

Validated Russian release with exact source revision.

## Procedure

1. Queue English adaptation; do not use an earlier stale source revision.
2. Translate body, title, summary, UI metadata, alt text, captions and transcript where relevant.
3. Preserve claim IDs, citations, dates, numbers, proper-name aliases, credits and disclosure.
4. Run semantic comparison against Russian master.
5. Generate localized slug, SEO metadata, canonical/hreflang and route.
6. Publish if valid; otherwise auto-revise or hold/ask only for `UNRESOLVED_TRANSLATION`.
7. Queue additional enabled locales from Russian master after English process is healthy.
