# Technical Architecture and Delivery

## Approved architecture

```text
Next.js application
  → Cloudflare Workers / Pages delivery
  → D1: knowledge and operational data
  → R2: media archive and derivatives
  → Queues + KV: workflows, retries, locks, caches
  → GitHub: code, OS, approved Markdown, migrations
  → Weavy.ai: orchestration across AI and platform jobs
```

## Repository structure

```text
VANSMITHLAB_OS/       # active operating system
content/              # approved localized Markdown
database/migrations/  # versioned D1 migrations
database/seeds/       # safe local/reference seed data
src/                  # application code
public/               # only public static assets
scripts/              # deterministic validation/build helpers
tests/                # unit, integration, accessibility and release tests
```

## Implementation order

1. Restore deleted Next.js scaffold and verify local build.
2. Add D1 migration framework and core schema.
3. Build content/object validator before public page components.
4. Implement Russian read models and core page types.
5. Add search, relations, citations and revision history.
6. Add English/localization pipeline.
7. Add media storage and derivatives.
8. Connect Weavy workflows and AI role adapters.
9. Add distribution only after release/correction loop works.

## Build gates

Production build fails when a release has invalid schema, missing required claim/source, stale required localization, unresolved rights, broken critical link, invalid locale route, missing alt text/transcript, or failed structured-data validation.

## Configuration and secrets

No provider key, webhook secret, source credentials or private prompt data belongs in Git, Markdown, browser code or AI logs. Use Cloudflare/GitHub secret stores; provide least privilege, rotation, audit and separate development/staging/production environments.
