# Implementation Brief

```yaml
feature_id: "imp_article_listing_media_20260805"
affected_pages:
  - "/ru/articles/"
  - "/en/articles/"
affected_data_domains:
  - "content release metadata: hero_image"
affected_locales: [ru, en]
rollback_strategy: "Revert the listing-card media markup and CSS; article pages and hero assets remain valid."
```

## User problem and OS rule

Published article cards reserve a second grid column but do not render the release `hero_image`, leaving a large grey empty area. The fix follows the UX hierarchy `answer → context → evidence → connections`, keeps imagery subordinate to the title, and reuses the already approved media metadata instead of introducing a parallel field.

## Intended user journey

The reader scans a verified article card, sees the title and summary first, recognizes the related editorial illustration, and opens the entire card as one link.

## Data ownership and validation impact

`hero_image` remains owned by the localized content-release metadata and its existing schema. No migration or new factual/media claim is introduced. Releases without `hero_image` retain the text-only card state. Release-body validation normalizes CRLF/CR line endings to the canonical LF form before hashing so the same approved body validates on Windows and Linux.

## UX/UI states

- Loading: Next Image reserves the media panel and lazy-loads the image without layout shift.
- Empty: a release without `hero_image` uses the existing text-only listing card.
- Error: the media panel keeps a neutral background and the linked title/summary remain usable.
- Small screen: the card becomes one column with text before media and no horizontal overflow.
- Keyboard/screen reader: the whole card remains one focusable link; the approved localized alt text is preserved.

## Acceptance criteria and tests

- [x] D1 migration/rollback, if required — not required
- [x] Russian and English path
- [x] Accessibility
- [x] Computer, tablet and mobile layouts
- [x] Build and release validation
