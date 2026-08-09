# P-001 — Connecting the corpus into a knowledge graph

Status: partially delivered — C3 stage 1 (relation graph) and the corpus converter are live; C1 terms, C2 timeline, C4 collections and C5 analysis markers are still proposals.
Note: the category names in sections 3–4 predate taxonomy v2. Read `TAXONOMY.md` v2 for the current vocabulary.
Raised under: `00_START_HERE.md` — "If the required rule does not exist, the agent must create a scoped documentation proposal"
Affects: `03_KNOWLEDGE_MODEL.md`, `04_DATA_ARCHITECTURE.md`, `06_CONTENT_MODEL.md`, `11_SITE_INFORMATION_ARCHITECTURE.md`, `DOCX_SCHEMA.md`, `schemas/knowledge-object.schema.json`

## 1. Measured current state

| Layer | Count | Note |
| --- | --- | --- |
| Article pairs authored (`.docx`, RU+EN) | 112 | all conform to layout_schema v1 |
| Articles converted into `content/ru` | 18 | 94 finished pairs are not on the site |
| Knowledge objects | 84 | `person` 70, `brand` 11, `research` 1, `theme` 1, `photographer` 1 |
| Claims with evidence | 718 | none carry a machine-readable date |
| **Typed relations between objects** | **5** | the graph does not exist yet |
| Glossary entries | 3 | `[GLOSSARY]` blocks exist in 3 `.docx`, all empty |
| Timeline entries | 0 | `[TIMELINE]` blocks exist in 3 `.docx`, all empty |
| Collections | 0 | page renders placeholder cards |

Latent, already present in the prose but not extracted:

- **249 cross-references** between articles (≥2 mentions of another article's subject). 109 of 112 articles reference at least one other.
- **178 numbered section headings carry a year**; 3,753 year mentions across all body text; years span 1837–2027.
- **204 `[MEDIA_SLOT]` blocks**, **1,137 `[SOURCE]` entries**, **11 `[CALLOUT]` blocks**.

The corpus is a database that has not been wired. Every connection below is extraction, not new authoring.

## 2. What each menu section should be

`03_KNOWLEDGE_MODEL.md` already answers three of these; the definitions are restated here so the implementation has one target.

| Section | Definition | Unit it renders |
| --- | --- | --- |
| Encyclopedia | "What is this?" | knowledge object |
| Glossary | "A glossary entry is a concise object definition." | knowledge object of type `term` |
| Articles | Long-form explanation built from objects | content, `content_type: research` |
| Analysis | "A signed or institutional argument that cites objects without rewriting their factual record." | content, `content_type: analysis` |
| Timeline | "A timeline is a view of dated claims." | claim with a date |
| Collections | "A curated, explicit grouping with selection rationale." | saved query + curator rationale |

Two consequences follow directly and resolve open questions:

- **Timeline needs no new content.** It needs a date on the claim. 718 claims already exist.
- **Collections are not technical.** A collection is an editorial lens: a stored filter plus a written rationale. It is the one place where the editor states *why* these objects belong together.

## 3. Proposed connections

### C1 — Terms marked in articles feed the glossary automatically

Two directions, both expressed in the `.docx`.

An article that **defines** a term declares it:

```
[GLOSSARY id="glossary"]
[TERM slug="bias-cut"]
term: Крой по косой
definition: Раскрой ткани под 45° к нити основы, дающий эластичность без трикотажа.
[/TERM]
[/GLOSSARY]
```

An article that **uses** a term marks it inline, once per section, on first occurrence:

```
Вионне строила платье через [[bias-cut|крой по косой]], а не через вытачку.
```

Converter behaviour: `[TERM]` creates or updates a knowledge object of type `term`; `[[slug|surface form]]` resolves to that object, renders as a link with a hover definition, and registers a back-link. The glossary page then shows each term with "встречается в N материалах" and the list. A `[[slug]]` with no matching `[TERM]` anywhere is a build error, not a silent dead link.

This is the mechanism requested: mark a term in an article and it lands in the glossary by itself.

### C2 — Dated claims produce the timeline

Add three optional fields to the claim object in `schemas/knowledge-object.schema.json`:

```yaml
date_start: "1947-02-12"     # ISO 8601, may be year-only
date_end: null               # for periods
date_precision: day | month | year | decade | circa
```

The timeline page becomes a year axis over every dated claim in the corpus, filterable by category, discipline and object. Selecting 1947 returns Dior's New Look, Balenciaga's tonneau line and anything else dated to that year — across fashion, architecture and art at once. Each entry links to its claim, its source and the article that carries it.

This is the only view that makes the cross-disciplinary premise of the project visible, and it is the cheapest to build because the claims already exist.

### C3 — Relations materialised from existing cross-references

Two-stage, respecting `03_KNOWLEDGE_MODEL.md` ("a relation that expresses a factual connection requires a supporting claim"):

1. **`mentions`** — generated automatically from the 249 detected cross-references. An editorial discovery label, not a factual assertion. Safe to ship unreviewed; powers "Related objects" on every page.
2. **Typed relations** — `worked_at`, `influenced_by`, `created_by`, `part_of`, `collaborated_with`, `photographed_by`. Proposed by the extractor, but written only when an existing claim supports the connection. Anything unsupported becomes a `review_request` rather than a guess.

Without this step the Encyclopedia is a list of 84 unconnected pages. With it, it is a graph.

### C4 — Collections as stored lenses

A collection is a JSON record: a query over `categories`, object type, date range and tags, plus a mandatory `rationale_ru` explaining the selection. Starter set drawn from what the corpus actually contains:

| Collection | Query | Members today |
| --- | --- | --- |
| Японская архитектура | `architects` ∩ Japan | 10 |
| Камень, бетон и металл | `materials-techniques` ∩ `architects` | 5 |
| Мода как конструкция | `materials-techniques` ∩ fashion | 7 |
| Фотография моды | `photographers` + `art-direction-graphic-design` | 10 |
| Дом и его основатель | `fashion-houses` paired with `fashion-designers` | 9 pairs |

### C5 — Analysis separated from Articles

Analysis is a format, not a category — `06_CONTENT_MODEL.md` already governs it. What is missing is the marker that separates fact from interpretation. The `[CALLOUT type="critical-context"]` block already used in 11 files is the seed; formalise `type` values as `critical-context`, `interpretation`, `dispute`, and require an `analysis` document to carry a byline and at least one interpretation marker.

## 4. Suggested order

1. **C1 terms** — smallest change, directly requested, makes the glossary self-maintaining.
2. **C3 relations, stage 1** — one extraction pass turns 84 pages into a connected graph.
3. **C2 timeline** — schema field plus a backfill of dates onto existing claims.
4. **C4 collections** — needs editorial input, not engineering.
5. **C5 analysis markers** — smallest surface, do last.

Running in parallel and independent of all of the above: **94 of 112 article pairs still need converting into `content/`.** No amount of graph work is visible until they are.

## 4a. C3 stage 1 — delivered 2026-08-09

`knowledge/relations.json` now exists, generated by `scripts/dump-corpus.py` + `scripts/build-relations.mjs`.

| Measure | Value |
| --- | --- |
| Nodes (all article pairs) | 112 |
| Nodes backed by a knowledge object | 80 |
| Edges (`mentions`) | 92 |
| Connected nodes | 73 |
| Isolated nodes | 39 |
| Reciprocal pairs | 15 |
| Edges crossing a category boundary | 46 (50%) |

The first extraction pass reported 249 edges. Three matcher defects were found and fixed before anything was written:

1. The last word of a non-person title was accepted as a name, so «Корсетная конструкция» matched the ordinary noun *конструкция* in 27 unrelated articles. Fragment matching is now restricted to the surnames of people.
2. A three-letter inflection tail let «Буржуа» match *буржуазная* and «Росси» match *российский*. The tail is now two letters.
3. Source titles inside `[SOURCES]` were being searched, producing matches on bibliography entries rather than prose. The block is now excluded.

Half of all surviving edges cross a category boundary — Тадао Андо to бетон, Hermès to кожа, Prada to нейлон, Ирвинг Пенн to Алексей Бродович. That is the cross-disciplinary premise of the project becoming machine-readable.

**Known gap:** 32 of 112 articles still have no knowledge object, and 39 nodes have no edge in either direction. The isolated set is mostly architects who are genuinely not named in other articles; it is not a defect of the extractor.

## 4b. Corpus converter — delivered 2026-08-09

`DOCX_SCHEMA.md` was written around a converter that did not exist in the repository. `scripts/convert-docx.py` is that converter.

| Output | Value |
| --- | --- |
| Documents read (RU + EN) | 224 |
| Content files written (`.md` + `.json`) | 448 |
| Listable content items on the site | 237 |
| Distinct sources with a URL → `knowledge/sources.json` | 317 |

Routing follows the v1.1 taxonomy and the section map already present in `lib/content.ts`:

| Category | content_type | Directory |
| --- | --- | --- |
| `architects`, `fashion-designers` | `designer_profile` | `glossary/designers` (58) |
| `artists` | `artist_profile` | `glossary/artists` (19) |
| `photographers`, `art-direction-graphic-design` | `photographer_profile` | `glossary/photographers` (10) |
| `materials-techniques` | `encyclopedia` | `encyclopedia` (17) |
| `fashion-houses` | `research` | `articles` (12) |
| `thematic-research` | `analysis` | `analysis` (2) |

All converted pages are written `state: "drafted"` with their true `verification_state`. `lib/content.ts` now lists drafted pages alongside published ones, so the corpus is visible while the verification badge states exactly what has been through the evidence gate. `tsc --noEmit` passes.

**Evidence finding that blocks promotion to `published`:** of 1,137 `[SOURCE]` entries in the RU masters, **808 carry no URL** — they name a publisher and a description only. `DOCX_SCHEMA.md` requires "real URLs with access dates". Only 317 distinct citable sources exist across the whole corpus. Restoring URLs is the single largest piece of work standing between the corpus and a genuine `published` state.

**Cleanup owed:** 13 records from the old automation pipeline remain in `content/` with `state: "published"`. Eight of them duplicate a newly converted article under a different slug (`istoriya-modnogo-doma-armani` vs `istoriya-modnogo-doma-giorgio-armani`, and the Christian Dior, Louis Vuitton and religion pairs). They will render twice until removed.

## 5. Decisions required from the user

- Approve or amend the inline term syntax `[[slug|surface form]]`.
- Approve adding `date_start`, `date_end`, `date_precision` to the claim schema.
- Confirm that `mentions` may be generated automatically without review, while typed relations may not.
- Confirm the collection starter set, or replace it.

---

Version: 0.1 / 2026-08-09
