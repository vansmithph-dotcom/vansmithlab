# UX/UI Design System

## UX strategy

VANSMITHLAB should feel like entering a precise contemporary reference library, not a fashion magazine feed. The interface makes knowledge calm, navigable and inspectable.

The hierarchy on every page is: **answer → context → evidence → connections**.

## Core UX rules

- Make the first screen useful without forcing scroll or account creation.
- Reveal dense metadata progressively: trust panel first, detailed citations on demand.
- Keep a persistent way to search, change language and return to the object’s context.
- Use links as editorial guidance, not keyword spam.
- Preserve reading position when opening citations, media and related-object panels.
- Let readers filter by time/place/discipline without losing the original query.
- Never hide verification state, last reviewed date, corrections or AI media disclosure.

## Page layout system

| Zone | Purpose |
| --- | --- |
| Global header | wordmark, compact navigation, search, language control |
| Context rail | breadcrumbs/type/period/location; collapses on small screens |
| Reading column | primary answer and editorial body; optimal long-form line length |
| Evidence rail | verification, sources, citations, revision; becomes drawer on mobile |
| Discovery footer | related objects, timeline continuation, next reading |

## Visual direction

- Quiet, editorial, precise, high-contrast, generous whitespace.
- A restrained neutral palette: warm paper/light surface, near-black text, one accessible functional accent; dark mode follows semantic tokens rather than inverted decoration.
- Modern grotesk for UI and body. A single restrained serif accent is optional for essays/quotations, not for routine encyclopedia reading.
- Large but measured titles; never let fashion imagery overpower the answer.
- Use a consistent spacing scale, responsive image crops and visible focus states.

## Components

`Header`, `SearchCommand`, `LanguageSwitch`, `Breadcrumbs`, `ObjectHeader`, `TrustPanel`, `DefinitionBlock`, `FactTable`, `Timeline`, `CitationDrawer`, `SourceList`, `RelationCard`, `CollectionGrid`, `MediaFigure`, `AIDisclosure`, `RevisionHistory`, `FilterBar`, `EmptyState`, `CorrectionNotice`.

Each component has loading, empty, error, keyboard-focus and small-screen states before it is considered complete.

## Mandatory device contract

Every public page and every editorial component MUST support all three device classes before publication:

| Class | Reference width | Required behavior |
| --- | --- | --- |
| Computer | 1024px and wider | full navigation, multi-column reading and evidence layout, keyboard and pointer states |
| Tablet | 561-1023px | touch navigation, reduced columns, portrait and landscape layouts, no horizontal overflow |
| Mobile phone | 320-560px | single-column reading, touch targets at least 44px, compact menu, wrapped actions and long-word protection |

Desktop is not the default that other devices merely shrink. Content order, navigation, trust information, citations and language controls must remain available on every class. Hover effects are enhancements only; all essential actions must work by touch and keyboard. A page that has not been checked at representative computer, tablet and mobile widths is not release-ready.

## Accessibility and inclusive design

- Semantic heading order; one H1 per page.
- WCAG AA contrast as a minimum.
- Keyboard-accessible search, filters, citations, galleries and dialogs.
- No information communicated by colour alone.
- Text equivalents for images; captions/transcripts/subtitles for video.
- Respect reduced motion; do not use autoplay as the only path to content.
- Test 320px widths, zoom, screen reader order and Cyrillic/Latin typography.

## UX acceptance criteria

- A reader can find the definition, reliability state and sources of an object in the first meaningful viewport.
- A reader can move from a page to at least three meaningful related paths without using browser search.
- The language control makes clear whether the current version is current or awaiting update.
- An analysis page visibly distinguishes attributed interpretation from verified reference material.

## Card media acceptance criteria

Listing cards with media use a unique newly generated editorial illustration in a landscape 3:2 crop. The image wrapper owns the dimensions, the image fills it with `object-fit: cover`, and no browser or CSS rule may stretch the source. Broken, empty, placeholder, pictogram-only, standalone-portrait or unrelated-stock media is an error state, not an acceptable card design. The illustration must visibly explain the specific person, object, movement or article represented by the card; a portrait can be one element inside that composition, never the whole brief. Check at computer, tablet and mobile widths and verify that the title remains localized independently of the image.
