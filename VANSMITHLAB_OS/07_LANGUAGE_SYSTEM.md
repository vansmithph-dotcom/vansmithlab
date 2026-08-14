# Language and Localization System

## Language hierarchy

- **Russian (`ru`)** is the editorial master and default interface language.
- **English (`en`)** is the first localized edition: an idiomatic editorial adaptation, not literal machine output.
- Additional locales are automatically generated only from a current, approved Russian revision.

## Translation contract

A translation must retain the same object IDs, claim IDs, dates, numbers, names, citations, credits, rights limits, AI disclosure and confidence. It may adapt syntax, word order, examples and culturally natural phrasing; it may not add new facts, strengthen certainty, remove uncertainty or substitute its own sources.

## Localization lifecycle

`queued → generated → semantic_validated → published`

When the Russian master revision changes, all descendant translations become `stale`. The system rebuilds them automatically and validates them again before release. A stale translation must not silently claim to be current.

## Interface localization

- Page URLs: `/ru/...` is canonical master; `/en/...` and `/{locale}/...` are derived.
- Generate `hreflang`, canonical links, localized sitemap entries, metadata and Open Graph text from the language database.
- Keep proper nouns in an approved multilingual alias table; never invent a transliteration during an article run.
- Glossary entries can define a Russian term, English equivalent, untranslated original and usage note.

## Escalation

The system requests input only if semantic validation cannot safely preserve meaning: a culturally specific term, contested naming, wordplay central to an argument, or an undefined translation choice. Otherwise translation is automatic.

## Russian titles and names

Russian interface titles, card headings and summaries must be written in Russian. Personal names are transliterated into Russian in the `ru` release (for example, «Эйлин Грей» and «Жан-Мишель Франк»). Keep an English form only when it is the official brand, studio, publication, acronym or registered proper name (for example, SANAA, M/M (Paris), Prada or Visionaire); add the Russian reading in the surrounding copy when useful. A Russian card containing `???`, mojibake or an unexplained English personal name fails localization QA and must not be published.
