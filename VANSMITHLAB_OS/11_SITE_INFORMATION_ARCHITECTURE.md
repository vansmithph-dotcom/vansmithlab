# Site Information Architecture

## Core navigation

```text
Home
Explore
  ├─ Encyclopedia
  ├─ Glossary
  ├─ Timeline
  └─ Collections
Articles
Analysis
Search
About / Methodology
Language
```

This is intentionally compact. “Explore” is the discovery system; it does not expose every object type in the top navigation.

## Page families

| Page | User intent | Essential modules |
| --- | --- | --- |
| Home | Understand the project and enter a subject | statement, search, entry routes, featured concept, latest verified update, latest analysis |
| Encyclopedia object | Answer “what is this?” | definition, trust panel, core facts, timeline, related objects, sources |
| Glossary | Decode a term fast | concise definition, pronunciation/aliases where useful, context, examples, related terms |
| Article / research | Understand a question deeply | thesis/summary, readable body, evidence markers, citations, related objects |
| Analysis | Read an attributed argument | author/byline, thesis, fact vs interpretation markers, source trail, response/correction policy |
| Timeline | Understand sequence and context | period controls, chronology, filters, linked objects |
| Collection | Browse a deliberate lens | curator rationale, members, filters, adjacent collections |
| Search | Find known or unknown subjects | query, type/discipline/time/place filters, result explanations |

## Discovery dimensions

The information architecture supports multiple entrances to the same knowledge:

- **discipline:** fashion, graphic, product, interior, architecture, photography, etc.;
- **entity:** person, brand, material, technique, object, movement, institution;
- **time:** period, year, decade, chronology;
- **place:** region, city, culture;
- **concept:** religion, identity, labour, technology, sustainability, body, power;
- **format:** entry, glossary, research, analysis, timeline, gallery, video.

Do not force users to understand database types before discovery. Filters may expose them after a search or browse action.

## URL model

```text
/ru/encyclopedia/{type}/{slug}
/ru/glossary/{slug}
/ru/articles/{slug}
/ru/analysis/{slug}
/ru/timeline/{slug}
/ru/collections/{slug}
/ru/search?q=
```

Localized routes repeat under `/en/` and future locale prefixes. Object ID is independent of route and slug.

## What comes later

An interactive network graph, personalized feed, account system and extensive social/community layer are future enhancements. In the first release, strong links, timeline, filters and search provide a more legible graph experience.
