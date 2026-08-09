# VANSMITHLAB — Visual Editorial Guide

Status: canonical visual rule
Version: 1.0

## Purpose

Every public material must have a visual that helps the reader understand the subject. The visual is part of the argument, not decoration added after writing. The article list uses a wide editorial image that carries the subject's central idea; the article page expands that idea through a hero, portraits, material studies, diagrams or documentary images.

## 1. Choose the visual by subject

| Subject | Primary visual | Additional visual language |
| --- | --- | --- |
| Person / author profile | Identifiable portrait or studio portrait | Works, working method, timeline, studio or exhibition context |
| Fashion house / organisation | Horizontal system image showing the house's codes, objects and structure | Archive-safe details, timeline, signature materials, institutional diagram |
| Material / technique | Macro or controlled material study showing surface, structure or process | Cross-section, tool, process sequence, applications and failure modes |
| Building / architect | Exterior or spatial view that explains the design principle | Plan/section, detail, context, construction or material relationship |
| Event / movement / school | Period-appropriate group, place or diagram that explains the event | Timeline, key people, documents, objects, map or archival fragments |
| Concept / analysis | Editorial diagram or visual metaphor grounded in the verified argument | Comparison, mechanism diagram, annotated detail or source image |

If a documentary image is unavailable or rights are unclear, use an original editorial diagram or a clearly disclosed AI illustration. Do not use a generic portrait or attractive stock image that does not explain the article.

## 2. Article-list visual

The list image follows the Prada pattern: a wide horizontal composition paired with the title and summary. It must be readable at a glance, preserve a calm editorial tone and communicate the article's thesis without text baked into the image.

Required characteristics:

- wide landscape composition, designed for the card crop;
- one dominant visual idea, not a collage of unrelated references;
- safe text area on the opposite side of the card title when the layout uses a split card;
- no legible AI-generated pseudo-text, logos or invented archival details;
- focal subject remains identifiable after responsive cropping;
- visual contrast is subordinate to the title and summary, not louder than them.

Recommended source dimensions: at least 1600 × 900 px for a hero/list asset. Store a smaller derivative only when the original and its hash remain recorded.

## 3. Article-page visual system

### Hero

Every published article should have one hero unless the content is intentionally text-only and the omission is recorded. The hero appears after the object header and before the reading column. It needs:

- precise alt text describing its informational role;
- caption explaining what the reader is seeing;
- creator/credit;
- origin and rights state;
- AI disclosure when generated or reconstructed;
- a source or asset record connected to the content release.

### Inline visuals

Long articles should normally contain 1–3 inline visuals after editorial review. A visual earns its place when it explains a claim, gives scale, shows a process or creates a useful comparison. Each inline figure has its own caption, alt text, credit, rights/origin and source object.

Suggested rhythm:

1. hero: central thesis;
2. first inline figure: person, object or material evidence;
3. second inline figure: process, context or comparison;
4. optional third figure: timeline, diagram or application.

Do not force a fixed number when the subject does not support it.

## 4. Documentary photography, licensed work and AI

Use the following order of preference:

1. original VANSMITHLAB image;
2. official archive or rights-holder image with a recorded permission/usage basis;
3. public-domain image with jurisdiction and source recorded;
4. licensed image with licence and attribution recorded;
5. editorial use only where the legal/editorial basis is documented;
6. original AI illustration or AI reconstruction, clearly labelled.

Copyright attribution is mandatory when required by the licence, rights holder or editorial basis. When the source is identifiable but a separate licence record is unavailable, publish with explicit creator/rights-holder credit, direct source URL and a visible editorial-use notice; record `rights_state: attribution_required` or `rights_state: editorial_basis_recorded`. Attribution is not ownership and must not be described as a licence. If the source, creator or provenance cannot be identified at all, do not fabricate a credit: replace it with an original, public-domain, licensed or clearly disclosed AI visual.

AI images must not imitate a living artist or fabricate documentary evidence. They may visualise a verified mechanism, material or design principle, but must state that they are editorial/AI-generated illustrations. AI reconstruction must be labelled as hypothetical and cannot prove a historical fact.

## 5. Required media record

Every asset record contains:

```yaml
asset_id: ""
primary_object_id: ""
content_release_id: ""
kind: image | gallery | diagram | video
origin: original | official | licensed | public_domain | editorial | ai_illustration | ai_reconstruction
creator_or_credit: ""
rights_state: ""
licence_or_permission: ""
source_url: ""
content_hash: ""
locale: ru
alt_text: ""
caption: ""
```

## 6. Accessibility and UI behaviour

- Alt text explains what the image contributes, not only that it is beautiful.
- Captions identify creator, date/context and rights where relevant.
- No essential information is embedded only in the image.
- The focal point survives the desktop, tablet and 320–560 px mobile crops.
- Captions remain readable and keyboard/screen-reader order follows the article.
- Images use lazy loading except the first hero, which may be prioritised.
- Decorative geometry is marked decorative and omitted from the accessibility tree.
- AI disclosure is visible in the caption or adjacent disclosure block, never hidden only in metadata.

## 7. Acceptance gate

Before release, the editor confirms:

- the visual explains the article's subject or argument;
- the list image works as a horizontal card at desktop, tablet and mobile widths;
- the hero and inline figures have complete media records;
- rights/provenance are recorded, or the page carries the required attribution and editorial-use notice;
- alt text, caption, credit and AI disclosure are present;
- the visual does not introduce an unsupported factual claim;
- the article remains understandable if an image fails to load;
- RU and EN use equivalent visual meaning, with localized alt text and caption.

## 8. First implementation batch

Use the Prada article card as the reference pattern. Then retrofit the nine published fashion-house articles in this order:

1. Balenciaga
2. Christian Dior
3. Giorgio Armani
4. Gucci
5. Hermès
6. Louis Vuitton
7. Prada
8. Saint Laurent
9. Versace

After the reference article passes visual and responsive QA, apply the same media record and component contract to people, materials and event/school articles.
