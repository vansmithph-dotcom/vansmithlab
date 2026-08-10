# Technical Architecture and Delivery

## Approved architecture

```text
Next.js application
  → Cloudflare Workers / Pages delivery
  → D1: knowledge and operational data
  → R2: media archive and derivatives
  → Queues + KV: workflows, retries, locks, caches
  → GitHub: code, OS, approved Markdown, migrations
  → GitHub Actions: initial scheduled/manual orchestration and Git release handoff
  → Figma Weave: optional visual workflow execution from approved media briefs
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
8. Connect GitHub Actions and AI role adapters; add Figma Weave only for approved media briefs.
9. Add distribution only after release/correction loop works.

## Build gates

Production build fails when a release has invalid schema, missing required claim/source, stale required localization, unresolved rights, broken critical link, invalid locale route, missing alt text/transcript, or failed structured-data validation.

## Search identity and structured data

- The canonical public entity name is `VANSMITHLAB`; `VAN SMITH LAB` and `vansmithlab.com` are allowed alternate names only.
- The root page must identify VANSMITHLAB as an independent bilingual encyclopedia of design and visual culture. Its visible copy and machine-readable description must agree.
- The domain root carries one `WebSite` entity and one `Organization` entity. Publication pages carry an accurate `Article` entity and a `BreadcrumbList` that reflects the visible information architecture.
- `Organization`, `Article` and breadcrumb properties may contain only facts already visible on the site or present in approved metadata. Do not invent addresses, contacts, social profiles, founding dates, awards, ratings or `sameAs` links.
- Russian and English equivalents use self-canonical URLs and reciprocal, fully qualified `hreflang` relationships when both releases exist. The Russian editorial source is `x-default` for paired publications.
- Public titles are concise editorial names, not production metadata. Do not append flag emoji, country codes, workflow states, file suffixes or other technical labels to an H1 or document title. Mixed-script names must have explicit punctuation or whitespace at the script boundary.
- Static release auditing must parse every JSON-LD block, reject broken canonical/internal/media targets, and reject glued mixed-script titles before deployment.
- Every production release keeps the canonical sitemap and `robots.txt` public. After a successful deployment, IndexNow may notify participating search engines only about URLs changed by that release; a site-wide notification is allowed when shared rendering, metadata or structured-data code changed. The public verification key belongs at the domain root. IndexNow is a discovery notification, not a ranking or indexing guarantee, and it must never be presented as a Google indexing API.

## Configuration and secrets

No provider key, webhook secret, source credentials or private prompt data belongs in Git, Markdown, browser code or AI logs. Use Cloudflare/GitHub secret stores; provide least privilege, rotation, audit and separate development/staging/production environments.
