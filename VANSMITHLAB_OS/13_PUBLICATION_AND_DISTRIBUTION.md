# Publication, Distribution and Corrections

## Release contract

A public release is a versioned package: approved content revision, linked claims/citations, localized metadata, approved media derivatives, accessibility assets, SEO model, build ID and correction path.

## Automatic release sequence

1. Validate Russian master object/content.
2. Publish Russian site projection.
3. Generate and semantically validate English adaptation.
4. Release English projection when current; queue other enabled locales.
5. Generate search, sitemap, structured data and graph projection from the same release ID.
6. Generate social distribution packages only after website release succeeds.
7. Monitor source, links, rights and release health.

## Distribution rule

Social content is a derivative, never a source of truth. Every post records its source release ID, locale, claims used, media derivative and external platform ID. Changes to the source release can therefore update, correct or withdraw derivatives consistently.

## Channel behaviour

- LinkedIn: evidence-led summary or analytical takeaway; link to canonical page.
- Instagram: visual explanation, carousel or short video; captions never add unsupported claims.
- Pinterest: discoverable reference image with rights-safe credit and canonical link.
- YouTube: an explanatory video with transcript, chapters, sources and object links.
- Threads/X: concise, accurate discovery entry, never a substitute for source context.

Do not activate a channel until its API, rights, attribution, correction and rate-limit behaviour are implemented and tested.

### Pinterest website integration

- The official public profile is `https://www.pinterest.com/van_smith_ai/`; expose it as a visible external footer link and as `sameAs` on the Organization and WebSite entities.
- Domain verification is published through Next metadata as `p:domain_verify`. A verification tag or claimed domain does not prove that the Pinterest API is connected.
- `https://vansmithlab.com/feed.xml` is the stable Automatic Publishing endpoint. It must be valid RSS 2.0, contain only released website records, use canonical links on the claimed domain, and attach one rights-cleared representative image to every item through `media:content`.
- Article Rich Pins are supplied from canonical Open Graph article metadata and matching Article/ImageObject structured data. Social metadata must never describe an image more strongly than the asset record allows.
- API publishing remains disabled until a real access token and board identifier are configured and a dry run has passed. Never print or commit those credentials.

## Correction policy

Corrections are versioned and visible. A minor non-factual correction updates metadata or prose; a factual correction updates claims and citations, re-runs all dependent releases, and adds a correction notice where the reader’s understanding changed. Retractions are never silently removed.
