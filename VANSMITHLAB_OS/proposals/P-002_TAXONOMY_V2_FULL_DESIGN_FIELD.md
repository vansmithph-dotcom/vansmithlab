# P-002 — Taxonomy v2: covering the whole field of design

Status: approved and applied 2026-08-09. Canonical text lives in `TAXONOMY.md` v2; this file is the rationale and migration record.
Supersedes on approval: `TAXONOMY.md` v1.1
Affects: `DOCX_SCHEMA.md`, `03_KNOWLEDGE_MODEL.md`, `11_SITE_INFORMATION_ARCHITECTURE.md`, `scripts/convert-docx.py`, all 224 `.docx` masters

## Why v1.1 is not enough

v1.1 gave eight flat categories derived from what the corpus already contained. That was the right move for sorting 112 existing articles, and the wrong shape for a database of design as a whole. Two defects:

1. **It confuses discipline with role.** `architects` is a role; `fashion-houses` is an organization; `materials-techniques` is a kind of subject. They are not siblings, so the list cannot be extended without becoming arbitrary. Adding `fashion-editors` next to `materials-techniques` makes this obvious.
2. **It cannot express an empty branch.** A design encyclopedia that has no fashion editors, no stylists, no schools, no movements and no exhibitions is not a database with gaps — it is a database whose gaps are invisible. Naming the branch is what turns an absence into a commissionable task.

`03_KNOWLEDGE_MODEL.md` already prescribes the fix: categories are "hierarchical browsing paths, such as `Fashion → Dress → Silhouette`", and object types are "what the entity is; controlled and stable". v1.1 collapsed both into one field.

## The model

Three fields, each controlled, each answering a different question.

| Field | Question | Cardinality |
| --- | --- | --- |
| `discipline` | Which field of design or visual culture? | one or more |
| `kind` | What sort of thing is the subject? | exactly one |
| `role` | If the subject is a person, what did they do? | one or more, only when `kind: person` |

A fashion editor is `discipline: fashion`, `kind: person`, `role: fashion-editor`. Vogue is `discipline: fashion, media-publishing`, `kind: organization`. Concrete is `discipline: architecture`, `kind: material-technique`. Nothing has to be forced into a sibling relationship it does not have.

### Axis A — `discipline`

| Term | RU label | In corpus |
| --- | --- | --- |
| `architecture` | Архитектура | 55 |
| `fashion` | Мода | 30 |
| `art` | Искусство | 21 |
| `photography` | Фотография | 11 |
| `graphic-design` | Графический дизайн | 6 |
| `product-design` | Предметный дизайн | 0 |
| `interior-design` | Интерьер | 0 |
| `media-publishing` | Медиа и издания | 0 |

### Axis B — `kind`

| Term | RU label | Covers | In corpus |
| --- | --- | --- | --- |
| `person` | Персона | designer, architect, artist, photographer, editor, curator | 87 |
| `organization` | Институция | house, brand, studio, bureau, school, museum, magazine, publisher | 9 |
| `material-technique` | Материал и техника | fabric, metal, stone, construction method, craft process | 15 |
| `work` | Произведение | building, collection, garment, object, campaign, book, film | 0 |
| `movement-style` | Движение и стиль | Bauhaus, Metabolism, Deconstructivism, Memphis | 0 |
| `place` | Место | city, region, site | 0 |
| `event-exhibition` | Событие и выставка | biennale, show, retrospective | 0 |
| `term` | Термин | glossary definition | 0 |
| `theme` | Тема | cross-cutting research question | 1 |

### Axis C — `role` (only when `kind: person`)

| Term | RU label | In corpus |
| --- | --- | --- |
| `architect` | Архитектор | 50 |
| `artist` | Художник | 21 |
| `fashion-designer` | Модельер | 10 |
| `photographer` | Фотограф | 11 |
| `art-director` | Арт-директор | 6 |
| `graphic-designer` | Графический дизайнер | 1 |
| `fashion-editor` | Редактор моды | 0 |
| `stylist` | Стилист | 0 |
| `curator` | Куратор | 0 |
| `industrial-designer` | Промышленный дизайнер | 0 |
| `interior-designer` | Дизайнер интерьера | 0 |
| `illustrator` | Иллюстратор | 0 |
| `critic-theorist` | Критик и теоретик | 0 |

A person may hold more than one role. Karl Lagerfeld is `fashion-designer, photographer`. Alexey Brodovitch is `art-director, photographer`. Le Corbusier is `architect, artist`.

## What this changes on the site

Glossary stops being three cards and becomes the person index, split by `role`. Encyclopedia becomes the index of everything that is not a person — organizations, materials, works, movements, places, events. Empty branches are listed with a count of zero rather than hidden, so the encyclopedia states its own gaps.

Sections are derived, not stored: a section is a query over the three fields. Adding `role: fashion-editor` to one article is all it takes for «Редакторы моды» to appear.

## Migration

`category` and `categories` from v1.1 map onto v2 without editorial judgement:

| v1.1 | v2 |
| --- | --- |
| `architects` | discipline `architecture`, kind `person`, role `architect` |
| `fashion-designers` | discipline `fashion`, kind `person`, role `fashion-designer` |
| `artists` | discipline `art`, kind `person`, role `artist` |
| `photographers` | discipline `photography`, kind `person`, role `photographer` |
| `art-direction-graphic-design` | discipline `graphic-design`, kind `person`, role `art-director` or `graphic-designer` |
| `fashion-houses` | discipline `fashion`, kind `organization` |
| `materials-techniques` | discipline from the article, kind `material-technique` |
| `thematic-research` | kind `theme` |

Only one case needs a human decision: Peter Saville is `graphic-designer`, Brodovitch and Baron are `art-director`. Everything else is mechanical.

`categories` is retired. `category` remains as the single primary route, computed from `kind` + `role`, so the converter contract does not break.

## The first gaps this exposes

Naming the branches makes the commissioning list obvious. The corpus has 112 articles about people and materials, and nothing at all about:

- the magazines that made the work public — Vogue, Harper's Bazaar, Domus, Casabella;
- the schools — Bauhaus, Ulm, Central Saint Martins, Royal College of Art;
- the movements — Metabolism is described inside four architect articles but has no page of its own;
- the works — no building, collection or campaign has its own record, even though 3,126 sections describe them;
- the editors — Carmel Snow and Diana Vreeland appear inside the photography articles as context, never as subjects.

`Metabolism` is the clearest case: Tange, Kurokawa, Kikutake and Maki all point at it, the relation graph already shows the cluster, and there is no page for the thing they have in common.

---

Version: 0.2 / 2026-08-09 — counts corrected to the measured values after migration.
