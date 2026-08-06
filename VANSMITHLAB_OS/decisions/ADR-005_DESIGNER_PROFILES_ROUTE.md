# ADR-005 — Designer/architect biography profiles at /glossary/designers/[slug]

Status: accepted (scoped, product-owner decision)

## Context

Twelve author-supplied research briefs (Gabrielle Chanel, Yves Saint Laurent, Karl Lagerfeld,
Christian Dior, Cristóbal Balenciaga, Miuccia Prada, Rei Kawakubo, Alexander McQueen, Alvar Aalto,
Eero Saarinen, Frank Gehry, Frank Lloyd Wright) each declare `content_type: Encyclopedia` in their
own passport but also each explicitly declare `route: /ru/glossary/designers/{slug}` — a nested,
nowhere-currently-supported path distinct from the existing flat `/encyclopedia/{slug}` route.
`lib/site-data.ts` had independently already reserved "Дизайнеры и авторы" as an Encyclopedia
sub-item, so the two possible homes disagreed before this batch existed. The product owner chose,
explicitly and knowingly, to build the nested path the documents ask for rather than the flatter
options (see conversation record).

## Decision

1. New `content_type: "designer_profile"`, distinct from `"encyclopedia"`, for individual-person
   (designer/architect) biographical entries. Added to `validate.mjs`'s `allowedTypes`.
2. New route: `app/[locale]/glossary/designers/[slug]/page.tsx` (detail) and
   `app/[locale]/glossary/designers/page.tsx` (listing), both hardcoded to the literal section
   string `"glossary/designers"` rather than going through the generic `[locale]/[section]/[slug]`
   catch-all, which only matches a two-segment path and cannot represent a nested section on its
   own.
3. `lib/content.ts#listContent` now supports section directories that nest one level deep
   (`content/{locale}/glossary/designers/*.json`) by listing every entry in `publicSections`
   independently rather than doing a single top-level `readdir`, so a global `listContent()` call
   (sitemap, cross-section listings) picks up nested sections without double-counting the parent
   `glossary` directory's own flat items.
4. `[locale]/[section]/[slug]/page.tsx`'s `generateStaticParams` now excludes
   `content_type === "designer_profile"` (same treatment as `"encyclopedia"`) so the generic route
   does not also try to claim these slugs under a literal `/designer_profile/` section.
5. `sitemap.ts` maps `designer_profile` → `glossary/designers` and adds the listing page itself as
   a static entry.
6. `lib/site-data.ts` gains a `"glossary/designers"` entry in both locales' `copy.section` records
   for the listing page's eyebrow/title/text/items, independent of the existing flat `glossary` key.

## Why

Per `00_START_HERE.md`, a new field or route is only added when the alternative is silently
inventing behaviour or blocking a product-owner-approved feature. Here the ambiguity (two
self-contradicting signals inside the same source documents) was surfaced explicitly and resolved
by the product owner before any code was written, rather than picked unilaterally.

## Follow-up (not blocking this batch)

- Main site nav currently has no top-level link to `/glossary/designers`; it is reachable via the
  Glossary page context, direct links, and the sitemap. Add a nav/cross-link if the collection
  grows and warrants top-level discovery.
- `lib/site-data.ts`'s pre-existing "Дизайнеры и авторы" Encyclopedia placeholder item now points
  nowhere real; consider removing or repointing it to `/glossary/designers` in a follow-up pass.
