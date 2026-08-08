# VANSMITHLAB — Docx Authoring Schema v1.0

Use this schema to write articles as `.docx` files that the converter reads directly.
Write one paragraph per line in Word. Tags go on their own line, in square brackets.
Every opening tag has a matching closing tag.

RU and EN are two separate `.docx` files with synchronised `[SECTION]` IDs.

---

## 1. ARTICLE_META (required, first block)

```
[ARTICLE_META]
slug: your-sluglanguage: rucategory: your-categoryauthor: Ivan Melnikstatus: mastersource_revision: 1layout_schema: v1paired_document_id: VSL-XX-001
[/ARTICLE_META]
```

**META line rules:**
- All fields on ONE line, no spaces after colons in keys, no line breaks.
- `slug:` — URL-safe, lowercase, hyphens only. Example: `paolo-roversi`. Same slug for RU and EN.
- `language:` — `ru` or `en`. No space before value.
- `category:` — one of: `fashion-houses`, `designers`, `artists`, `photographers-art-directors`, `analysis`, `encyclopedia`.
- `author:` — full name. After the colon, space then name.
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
- Standard IDs:
  - `editorial-thesis` — always first
  - `reader-question` — always second
  - `short-answer` — always third
  - `1`, `2`, `3`... — numbered content sections
  - `1-topic-name` — numbered with descriptive suffix (optional)
  - `sources` — reserved for source appendix

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
[/MEDIA_SLOT]
```

Fields inside the slot (one per line):
- `placement:` — which section it follows. Use section ID.
- `format:` — aspect ratio or layout hint. Examples: `full-width 5:7`, `inline 1:1`, `hero 16:9`.
- `asset:` — what kind of image. Examples: `portrait-or-studio-view`, `archival-photo`, `editorial-diagram`.
- `caption_required:` — `yes` or `no`.
- `alt_required:` — `yes` or `no`.
- `rights_status:` — `to-be-licensed`, `public-domain`, `ai-illustration`, `press-kit`.

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

## 7. SEO (optional)

```
[SEO id="seo"]
meta_title: Paolo Roversi — Light, Duration and the Fragile Fashion Image
meta_description: Roversi turned the studio into a place where images emerge slowly.
keywords: Paolo Roversi, fashion photography, Polaroid, large format, Comme des Garçons
[/SEO]
```

---

## 8. RELEASE_CHECKLIST (optional)

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
slug: elsa-schiaparellilanguage: rucategory: designersauthor: Ivan Melnikstatus: mastersource_revision: 1layout_schema: v1paired_document_id: VSL-DS-001
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

---

Version: 1.0 / 2026-08-08
