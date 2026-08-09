# VANSMITHLAB — Taxonomy v2

Version: 2.0
Status: canonical
Supersedes: v1.1 (flat `category` / `categories`)
Rationale and migration record: `proposals/P-002_TAXONOMY_V2_FULL_DESIGN_FIELD.md`
Implemented in: `lib/taxonomy.ts`, `scripts/convert-docx.py`

## Why three axes

v1.1 held one flat list of eight categories. It sorted the existing corpus correctly and could not be extended, because its members were not siblings: `architects` is a role, `fashion-houses` is an organization, `materials-techniques` is a kind of subject. Adding `fashion-editors` to that list made the defect visible.

`03_KNOWLEDGE_MODEL.md` already prescribes the separation — object types describe what an entity is, categories are browsing paths. v2 restores it.

A second reason: v1.1 could only name what already existed. A database of design that has no editors, schools, movements or exhibitions has gaps, and unnamed gaps are invisible. Naming an empty branch turns an absence into a commissionable task.

## Fields in `[ARTICLE_META]`

| Field | Question | Cardinality |
| --- | --- | --- |
| `discipline` | Which field of design or visual culture? | one or more, comma-separated |
| `kind` | What sort of thing is the subject? | exactly one |
| `role` | If the subject is a person, what did they do? | one or more; present only when `kind: person` |
| `category` | Derived primary route | exactly one, computed — never authored |

```
slug: le-corbusier|language: ru|discipline: architecture, art|kind: person|role: architect, artist|category: architects|author: VANSMITHLAB|status: master|source_revision: 1|layout_schema: v1|paired_document_id: VSL-LE-COR
```

RU and EN pairs carry identical `discipline`, `kind`, `role` and `category`.

## Axis A — `discipline`

| Term | RU label | Articles |
| --- | --- | --- |
| `architecture` | Архитектура | 56 |
| `fashion` | Мода | 30 |
| `art` | Искусство | 21 |
| `photography` | Фотография | 11 |
| `graphic-design` | Графический дизайн | 6 |
| `product-design` | Предметный дизайн | 0 |
| `interior-design` | Интерьер | 0 |
| `media-publishing` | Медиа и издания | 0 |

## Axis B — `kind`

| Term | RU label | Covers | Articles |
| --- | --- | --- | --- |
| `person` | Персона | designer, architect, artist, photographer, editor, curator | 87 |
| `organization` | Институция | house, brand, studio, bureau, school, museum, magazine, publisher | 9 |
| `material-technique` | Материал и техника | fabric, metal, stone, construction method, craft process | 16 |
| `work` | Произведение | building, collection, garment, object, campaign, book, film | 0 |
| `movement-style` | Движение и стиль | Bauhaus, Metabolism, Deconstructivism, Memphis | 0 |
| `place` | Место | city, region, site | 0 |
| `event-exhibition` | Событие и выставка | biennale, show, retrospective | 0 |
| `term` | Термин | glossary definition | 0 |
| `theme` | Тема | cross-cutting research question | 1 |

## Axis C — `role` (only when `kind: person`)

| Term | RU label | Route | Articles |
| --- | --- | --- | --- |
| `architect` | Архитекторы | `/glossary/architects` | 50 |
| `artist` | Художники | `/glossary/artists` | 21 |
| `photographer` | Фотографы | `/glossary/photographers` | 11 |
| `fashion-designer` | Модельеры | `/glossary/designers` | 10 |
| `art-director` | Арт-директора | `/glossary/art-directors` | 6 |
| `graphic-designer` | Графические дизайнеры | `/glossary/graphic-designers` | 1 |
| `fashion-editor` | Редакторы моды | `/glossary/fashion-editors` | 0 |
| `stylist` | Стилисты | `/glossary/stylists` | 0 |
| `curator` | Кураторы | `/glossary/curators` | 0 |
| `industrial-designer` | Промышленные дизайнеры | `/glossary/industrial-designers` | 0 |
| `interior-designer` | Дизайнеры интерьера | `/glossary/interior-designers` | 0 |
| `illustrator` | Иллюстраторы | `/glossary/illustrators` | 0 |
| `critic-theorist` | Критики и теоретики | `/glossary/critics-theorists` | 0 |

`fashion-designer` keeps the historical `designers` route so existing links continue to resolve.

A person may hold several roles. Karl Lagerfeld is `fashion-designer, photographer`; Alexey Brodovitch is `art-director, photographer`; Le Corbusier is `architect, artist`. The first role determines the route.

## Assignment rules

1. `discipline` is the field or fields the article actually works in. Le Corbusier is `architecture, art` because painting has its own sections; he is not `art` merely for having opinions about it.
2. `kind` is what the article is *about*, not what it mentions. An article about a designer who founded a house is `person`; the house gets its own article as `organization`.
3. `role` applies only to people. A material article that discusses architecture takes `discipline: architecture` and no role.
4. A secondary `discipline` or `role` is added only when the article devotes named sections to it. A passing mention is not enough — the rule inherited from v1.1 and unchanged.
5. `category` is computed by the converter from `kind` and the first `role`. Do not write it by hand.

## Sections are queries, not lists

`/glossary` renders one card per role with a live count from the corpus, and lists roles with zero entries separately. Adding `role: fashion-editor` to a single article is all that is required for «Редакторы моды» to appear — no code, no new page file. `app/[locale]/glossary/[role]/` serves every role that does not already have a dedicated page.

## Adding a term

A new `discipline`, `kind` or `role` requires: the term, a Russian label, a definition, a route, and a rationale. Add it to `lib/taxonomy.ts` and to this document in the same change.

---

Version: 2.0 / 2026-08-09 — counts current as of 113 article pairs.
