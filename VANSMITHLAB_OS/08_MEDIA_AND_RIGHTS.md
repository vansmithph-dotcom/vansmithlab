# Media, Visual Production and Rights

## Principle

Media clarifies knowledge. It never functions as decoration detached from source, context or rights.

## Asset classes

- Original — created or owned by VANSMITHLAB.
- Official — supplied by a rights holder or official archive.
- Licensed — reusable under recorded permission/license.
- Public domain — record jurisdiction and evidence.
- Editorial — used under documented editorial/legal basis where applicable; requires careful review.
- AI illustration — generative visual, clearly labelled.
- AI reconstruction — hypothetical or reconstructed visual, prominently labelled and never evidence by itself.

## Required metadata

Every asset records: asset ID, origin, creator/credit, rights state, licence/permission, date, source object, caption, alt text, locale, content hash and file storage key. Video also records transcript, chapters, subtitles and audio rights.

## Visual brief before generation

An AI image or video starts only after a media brief defines: knowledge object, educational purpose, depiction type, verified visual facts, what may not be implied, aspect ratio, composition, visual tone, placement, disclosure and acceptance check.

Gemini may generate or adapt media only from approved briefs; it may not treat a historical visual style as proof of historical fact.

## Author-supplied media references

When ChatGPT writes an article draft, it must deliver the visual research with the text instead of leaving “add a photo here” placeholders. For every planned photograph, film frame, screenshot, archive item, diagram or illustration, the draft must include a media reference record with:

- a stable `reference_url` to the source page, archive record, rights holder or official project page;
- an `asset_url` only when a direct, publicly accessible asset URL is available and its use is not being implied by the link;
- the creator, title/subject and date or context when known;
- the proposed placement/section and the claim, example or mechanism it helps the reader inspect;
- a short reason the visual is evidence rather than decoration;
- suggested localized alt text and caption;
- known licence, permission or editorial-use basis, or the explicit value `rights_to_check`.

The links are an editorial handoff and research shortcut, not permission to publish. The VANSMITHLAB editor has final authority over selection, crop, replacement and publication. They must open and verify every link, check that it is the correct work and context, identify the creator/rightsholder, record the rights state and replace or hold the asset when provenance is unclear. Do not download, hotlink, crop, or publish a third-party image solely because ChatGPT supplied a URL. A source-page link and a factual citation are separate records: both may be needed.

For an original diagram or AI illustration, ChatGPT must provide a visual specification and, where useful, a non-copying reference URL for the subject or mechanism. The reference must not request imitation of a living artist, fabricate documentary evidence or replace a media brief. AI visuals are marked as `ai_illustration` and never used as proof of a historical fact.

## Quality and accessibility

- Use precise alt text that explains the informational purpose, not only aesthetics.
- Caption documentary material with creator, date/context and rights attribution.
- Avoid text baked into images when HTML can carry it.
- Provide transcript and captions for video.
- Do not automatically use a visual merely because it is visually attractive; relevance, attribution and a recorded use basis gate release.
- An article draft without the required media reference records is incomplete. The editor may request a new media handoff before beginning layout work.

## Card-image release gate

Every published glossary, encyclopedia, article or analysis card must have one unique, loadable raster hero image. SVG pictograms, generic geometric placeholders, grey empty blocks and repeated card art are not acceptable as final card media.

- Card assets use a landscape 3:2 master crop (target ratio 1.50:1; the editor may choose the crop, but must not stretch the image).
- The file must exist under `public/`, be reachable from the metadata `hero_image.src`, and pass a production HTTP check. The UI must render it with intrinsic fill dimensions and `object-fit: cover` so the browser never distorts it.
- Every card uses a newly generated editorial illustration that directly visualizes the card's subject and summary. A portrait may appear inside that illustration when it helps explain the subject, but a standalone portrait is not sufficient. The card image must never be a generic portrait, pictogram, diagram, placeholder or unrelated stock-like scene. The image must be unique to the card and materially related to its title and summary.
- If a documentary photograph cannot be legally or reliably sourced, use a clearly labelled original AI illustration/reconstruction with `origin: ai_illustration`, `rights_state: original_owned`, credit, localized alt text and a disclosure that it is not documentary evidence.
- A missing, broken, non-raster or unreviewed card image blocks publication. Do not fall back to a pictogram merely to fill the layout.

## Attribution-first publication rule

When the source is identifiable but a separate licence record is not available, the asset may be published with transparent attribution instead of being silently omitted. The page must show the creator/rights holder when known, the source URL, the publication/archive context and a concise notice that the image is used for editorial reference and that rights remain with the rights holder. Record `rights_state: attribution_required` or `rights_state: editorial_basis_recorded` in the media record.

Attribution is not a licence and must never be presented as ownership. If the source, creator or provenance cannot be identified at all, do not invent a credit; use an original, public-domain, licensed or clearly disclosed AI visual instead.
