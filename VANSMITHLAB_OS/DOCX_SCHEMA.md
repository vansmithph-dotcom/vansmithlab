# VANSMITHLAB — Docx Authoring Schema v1.3

Use this schema to write articles as `.docx` files that the converter reads directly.
Write one paragraph per line in Word. Tags go on their own line, in square brackets.
Every opening tag has a matching closing tag.

RU and EN are two separate `.docx` files with synchronised `[SECTION]` IDs.

---

## 1. ARTICLE_META (required, first block)

```
[ARTICLE_META]
slug: your-slug|language: ru|discipline: architecture|kind: person|role: architect|category: architects|author: VANSMITHLAB|status: master|source_revision: 1|layout_schema: v1|paired_document_id: VSL-XX-001
[/ARTICLE_META]
```

**META line rules:**
- All fields on ONE line, no line breaks. Pairs are separated by `|`, key and value by `: `.
- `slug:` — URL-safe, lowercase, hyphens only. Example: `paolo-roversi`. Same slug for RU and EN.
- `language:` — `ru` or `en`.
- `discipline:` — one or more terms, comma-separated, from `TAXONOMY.md`: `architecture`, `fashion`, `art`, `photography`, `graphic-design`, `product-design`, `interior-design`, `media-publishing`.
- `kind:` — exactly one: `person`, `organization`, `material-technique`, `work`, `movement-style`, `place`, `event-exhibition`, `term`, `theme`.
- `role:` — one or more, comma-separated, **only when `kind: person`**: `architect`, `artist`, `fashion-designer`, `photographer`, `art-director`, `graphic-designer`, `fashion-editor`, `stylist`, `curator`, `industrial-designer`, `interior-designer`, `illustrator`, `critic-theorist`. The first role determines the route.
- `category:` — derived by the converter from `kind` and the first `role`. Do not author it by hand.
- `author:` — `VANSMITHLAB`.
- `status:` — `master` (original) or `translation` (adapted from master).
- `source_revision:` — integer, starts at `1`. Increment when the master changes.
- `layout_schema:` — always `v1`.
- `paired_document_id:` — stable code for the RU+EN pair. Example: `VSL-PR-001`.

---

## 2. HERO (required)

```
[HERO]
Full Name of Subject
Subtitle: one-line editorial descriptor
Editorial quote — 1 to 3 sentences capturing the subject's significance. No quotation marks needed.
[/HERO]
```

- Line 1: display title (person name, house name, article headline).
- Line 2: subtitle — one sentence, factual, no marketing language.
- Line 3: editorial quote — the "hook". Use the subject's own words or a sharp editorial summary.

---

## 2a. TOC (required)

```
[TOC]
1. Getaria: the port, the mother's craft and an early vision of fabric
2. San Sebastián: training in the city of European fashion
[/TOC]
```

- Placed immediately after `[/HERO]`.
- One line per numbered section, in order, with the same wording as the section heading.
- Each entry is an internal Word hyperlink to the matching `sec-N` bookmark.
- Appendix headings (`A. Хронология`, `B. Глоссарий`…) do **not** appear in the TOC.
- The number of entries must equal the number of `sec-N` sections.

---

## 3. SECTION (repeatable, 30+ sections per article)

```
[SECTION id="unique-section-id"]
Section Title
Body text. Multiple paragraphs separated by blank lines.

Second paragraph of body text.

Third paragraph with [^claim_id] references to sources.
[/SECTION]
```

**ID rules:**
- Lowercase, hyphens, no spaces. Must be unique within the file.
- RU and EN share identical IDs for the same content.
- Standard IDs, in this order:
  - `editorial-thesis` — always first
  - `reader-question` — always second
  - `short-answer` — always third
  - `sec-1`, `sec-2`, `sec-3`… — numbered content sections, sequential with no gaps
  - `sources` — reserved for the source appendix
- Bare numeric IDs (`1`, `2`) and descriptive suffixes (`1-topic-name`) were used by earlier generations and are no longer valid. `scripts/validate-structure.py` rejects them.
- Each `sec-N` heading paragraph carries a Word bookmark of the same name, and each `[TOC]` entry links to it. The converter and the audit both rely on this.

**Body rules:**
- Plain text paragraphs. No Word formatting tricks.
- Source references: `[^claim_id]` format. Example: `[^clm_abc123]`.
- The claim_ids do NOT need to be real — the converter maps them to your source list.
- Blank line between paragraphs = new paragraph in output.

---

## 4. MEDIA_SLOT (optional, place between sections)

```
[MEDIA_SLOT id="PR-HERO-01"]
placement: after-short-answer
format: full-width 5:7
asset: portrait-or-studio-view
caption_required: yes
alt_required: yes
rights_status: to-be-licensed
reference_url: https://example.org/source-page
asset_url: https://example.org/image.jpg
creator_or_rightsholder: Name or institution
title_or_subject: Work, frame or mechanism shown
date_or_context: Year, collection or production context
supports: clm_example_id or example-1
why_it_matters: What the reader should inspect and why it supports the argument
suggested_alt_ru: Короткое информативное описание на русском
suggested_caption_ru: Подпись с автором, контекстом и правами
rights_basis: rights_to_check
[/MEDIA_SLOT]
```

Fields inside the slot (one per line):
- `placement:` — which section it follows. Use section ID.
- `format:` — aspect ratio or layout hint. Examples: `full-width 5:7`, `inline 1:1`, `hero 16:9`.
- `asset:` — what kind of image. Examples: `portrait-or-studio-view`, `archival-photo`, `editorial-diagram`.
- `caption_required:` — `yes` or `no`.
- `alt_required:` — `yes` or `no`.
- `rights_status:` — `to-be-licensed`, `public-domain`, `ai-illustration`, `press-kit`.
- `reference_url:` — required for documentary, licensed, editorial and archival visuals; points to the source page, archive record, rights holder or official project page.
- `asset_url:` — optional direct asset link for editor research only. It is never a licence, permission or instruction to hotlink.
- `creator_or_rightsholder:`, `title_or_subject:`, `date_or_context:` — identify what the reader would see and who controls or created it; use `unknown` only while the asset is held for review.
- `supports:` — claim ID(s), example ID(s) or mechanism the visual makes inspectable.
- `why_it_matters:` — one sentence explaining the visual's argumentative/educational purpose.
- `suggested_alt_ru:` / `suggested_caption_ru:` — author-provided accessibility and editorial copy; provide English equivalents in the EN file.
- `rights_basis:` — `rights_to_check`, `public_domain`, `licensed`, `permission_confirmed`, `editorial_basis_recorded` or `ai_illustration`. A supplied URL never changes this to an approved state.

For a long-form `analysis`, each planned visual must carry this handoff record. The hero and at least four purposeful inline visuals are required by `20_ANALYSIS_EDITORIAL_STANDARD.md`; AI/original diagrams may use a visual specification instead of an asset URL, but must still state what they explain and provide any non-copying reference URLs.

---

## 5. SOURCES (required)

```
[SOURCES id="sources"]
E. Sources
[SOURCE id="S01"]
Palais Galliera — Paolo Roversi exhibition. Palais Galliera. https://www.palaisgalliera.paris.fr/en/exhibitions/paolo-roversi Accessed 2026-08-08.
[/SOURCE]
[SOURCE id="S02"]
Paolo Roversi exhibition catalogue. Paris Musées. https://www.palaisgalliera.paris.fr/expositions/publications/paolo-roversi Accessed 2026-08-08.
[/SOURCE]
[/SOURCES]
```

**Rules:**

Every `[SOURCE]` must be checkable by a reader. What that requires depends on where the source lives:

- **A web source** MUST carry a full `https://` URL and an `Accessed YYYY-MM-DD` date.
  `Title. Publisher. https://… Accessed 2026-08-09.`
- **A printed source** — book, monograph, exhibition catalogue, journal issue — MUST carry author, title, publisher and year, and an ISBN where one exists. A URL is not required and must not be invented for it.
  `Göran Schildt. Alvar Aalto: A Life's Work. Otava, 1994. ISBN 951-1-13343-4.`

A publisher name on its own is not a source in either case: `Tate. Anish Kapoor materials.` cannot be checked, cited or registered. Neither can a placeholder such as `to-be-added`.

`scripts/validate-sources.py` enforces both forms and blocks any article written after 2026-08-09 that breaks them.
- ID format: `S01`, `S02`, `S03`... (capital S, two-digit number).
- Source line format: `Title. Publisher. URL Accessed YYYY-MM-DD.`
- Title and publisher are separated by a period and space.
- URL is the full `https://` link.
- `Accessed` keyword marks the retrieval date.
- Every source gets its own `[SOURCE]...[/SOURCE]` block.
- Order sources by first appearance in the article, NOT alphabetically.

---

## 6. MEDIA_PLAN (optional)

```
[MEDIA_PLAN id="media-plan"]
D. Media Plan
... free text with image specifications, rights notes, shot lists ...
[/MEDIA_PLAN]
```

---

## 6a. CALLOUT (optional, inside or between sections)

```
[CALLOUT type="critical-context"]
Критический контекст
Кроп создаёт новый смысл, но также демонстрирует редакционную власть над авторским изображением.
[/CALLOUT]
```

- `type:` — `critical-context`, `interpretation` or `dispute`.
- A `analysis` document must carry at least one `interpretation` callout: this is what separates an attributed argument from a neutral article, per `06_CONTENT_MODEL.md`.
- An `analysis` document must also carry an author/byline, concrete opening case, explicit thesis, at least three sourced examples and a purposeful media plan. Do not use a broad definition as the opening hook. Long-form analysis normally follows the 1,200–3,000-word and **hero plus at least four purposeful inline visuals (usually 5–8)** standard in `20_ANALYSIS_EDITORIAL_STANDARD.md`; photographs/details require source, creator/context and rights metadata. Record justified exceptions in the brief.

---

## 6b. TIMELINE, GLOSSARY, FACT_LEDGER (optional appendices)

```
[TIMELINE id="timeline"]
A. Хронология
[/TIMELINE]

[GLOSSARY id="glossary"]
B. Глоссарий
[/GLOSSARY]

[FACT_LEDGER id="claim-ledger"]
C. Факт-реестр
[/FACT_LEDGER]
```

These three blocks exist in the corpus but are empty everywhere they appear. They are the intended feed for the site's Timeline and Glossary sections; their contents are specified in `proposals/P-001_KNOWLEDGE_GRAPH_CONNECTIONS.md` and not yet ratified. Do not invent an internal format for them — leave them out until P-001 is approved.

---

## 7. SEO (required)

```
[SEO id="seo"]
meta_title: Paolo Roversi — Light, Duration and the Fragile Fashion Image
meta_description: Roversi turned the studio into a place where images emerge slowly.
keywords: Paolo Roversi, fashion photography, Polaroid, large format, Comme des Garçons
[/SEO]
```

---

## 8. RELEASE_CHECKLIST (required)

```
[RELEASE_CHECKLIST id="release-checklist"]
[ ] Semantic headings use native Word styles.
[ ] RU and EN section order and IDs are synchronised.
[ ] Every media slot includes asset ID, placement, caption, alt, and rights status.
[ ] Sources use stable IDs and real hyperlinks.
[ ] Current exhibition information is verified.
[/RELEASE_CHECKLIST]
```

---

## 9. COMPLETE MINIMAL EXAMPLE (RU)

```
[ARTICLE_META]
slug: elsa-schiaparelli|language: ru|discipline: fashion, art|kind: person|role: fashion-designer|category: designers|author: VANSMITHLAB|status: master|source_revision: 1|layout_schema: v1|paired_document_id: VSL-DS-001
[/ARTICLE_META]
[HERO]
Elsa Schiaparelli
Fashion, art and the Surrealist object
Schiaparelli did not decorate clothing with art — she turned the dress into a wearable sculpture, where a lobster, a tear, a lip or a skeleton became construction, not decoration.
[/HERO]
[SECTION id="editorial-thesis"]
Editorial thesis
Schiaparelli's significance rests on turning the fashion house into a laboratory of collaboration with artists.
[/SECTION]
[SECTION id="reader-question"]
Reader question
How did a self-taught Italian designer working in Paris change fashion's relationship to art, the body and humour?
[/SECTION]
[SECTION id="short-answer"]
Short answer
Elsa Schiaparelli was born in Rome in 1890. She opened her house in Paris and became Chanel's main rival.
[/SECTION]
[SECTION id="1"]
1. Rome, New York and the path to fashion
Text of the first section. [^clm_001]
[/SECTION]
[SECTION id="2"]
2. Paris and the first collections
Text of the second section. [^clm_002]
[/SECTION]
[SOURCES id="sources"]
E. Sources
[SOURCE id="S01"]
Schiaparelli — official history. Schiaparelli. https://www.schiaparelli.com/en/maison/history Accessed 2026-08-08.
[/SOURCE]
[SOURCE id="S02"]
Shocking! The Art and Fashion of Elsa Schiaparelli. Philadelphia Museum of Art. https://philamuseum.org/exhibitions/2003/114.html Accessed 2026-08-08.
[/SOURCE]
[/SOURCES]
[SEO id="seo"]
meta_title: Elsa Schiaparelli — fashion, art and Surrealism
meta_description: Schiaparelli turned fashion into a Surrealist object.
keywords: Elsa Schiaparelli, Surrealism, fashion, Dali, lobster dress
[/SEO]
[RELEASE_CHECKLIST id="release-checklist"]
[ ] RU and EN section IDs synchronised.
[ ] Sources verified.
[/RELEASE_CHECKLIST]
```

---

## 10. ENGLISH PAIR (EN)

- Same file structure, same `slug`, same `source_revision`.
- `language: en`, `status: translation`.
- `[HERO]` and `[SECTION]` titles translated to English.
- `[SECTION]` IDs MUST match RU exactly (so the converter pairs them).
- `[SOURCES]` can be in English or shared — the converter takes RU sources as canonical.

---

## 11. EDITORIAL RULES (for GPT or human authors)

1. **No markdown inside docx.** Plain text only. The converter adds formatting.
2. **One paragraph per Word paragraph.** Press Enter once between paragraphs, twice for a blank separator.
3. **Facts, not brand mythology.** Say "popularised" not "invented".
4. **Claims use `[^claim_id]`.** Map claims to sources in your head — the IDs just need to be consistent within the file.
5. **Sources are real URLs with access dates.** No "Google Images", no Pinterest.
6. **RU is the master.** EN is the translation. If RU changes, bump `source_revision`.
7. **Section order matters.** editorial-thesis -> reader-question -> short-answer -> numbered sections -> sources.
8. **No images in docx.** Use `[MEDIA_SLOT]` blocks to describe what image is needed.
9. **Verification state and confidence are editorial metadata**, not part of the docx schema. The converter sets them.
10. **`paired_document_id`** links RU+EN for the converter. Use the same ID in both files.
11. **Analysis is not a thin article.** The first paragraphs must give the reader a concrete case and a question; the body must develop a sourced argument with examples, marked interpretation and explanatory visuals. Existing dry materials are rewritten as source material, not released unchanged.

---

Version: 1.3 / 2026-08-13

Changes in 1.3: Analysis documents follow `20_ANALYSIS_EDITORIAL_STANDARD.md` v2.0: concrete opening, strong question, authorial thesis, sourced examples, marked interpretation, developed sections and a purposeful visual package. Dry informational material is source input and must be rewritten before release.

Changes in 1.2: `category`/`categories` replaced by the three-axis model in `TAXONOMY.md` v2 — `discipline`, `kind`, `role`; `category` is now derived, not authored. Every `[SOURCE]` must carry a URL and an access date.

Changes in 1.1: `category:` now draws on the controlled vocabulary in `TAXONOMY.md` (eight terms; `designers`, `encyclopedia`, `photographers-art-directors` and `analysis` retired). New multi-value field `categories:`. META line delimiter documented as `|`. `author:` fixed to `VANSMITHLAB`.
